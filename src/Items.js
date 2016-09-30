"use strict";

const Value = require('./Value');

const NAME = '[a-z_]\\w*';
const VARARG = '((?:\\.\\.\\.)|(?:\\[\\]))?';  // match "type..." or "type[]"
const itemRe = new RegExp('^\\s*(?:' +
            '(?:' +
                '(' + NAME + ')' +   // [1]
                '(?:[:](' + NAME + ')'+VARARG+')?' +  // [2] optional ":type..." [3]
            ')|' +
            '(?:\\[' +
                '(' + NAME + ')' +   // [4]
                '(?:[:](' + NAME + ')'+VARARG+')?' +  // [5] optional ":type..." [6]
                '(?:[=]([^\\]]*))?' +       // [7] optional "=value"
            '\\])' +
        ')\\s*$', 'i');

// Playground for above: https://jsfiddle.net/yo6m18xr/

/**
 * This class manages a case-insensitive collection of named items for a class. This is
 * used to manage "parameters" for Command's and "commands" for Containers as well as
 * "switches" for both.
 * @private
 */
class Items {
    static get (owner, name) {
        var key = '_' + name;
        var ret = owner[key];

        if (!owner.hasOwnProperty(key)) {
            let base = this.get(Object.getPrototypeOf(owner), name);

            owner[key] = ret = new this(owner, base, name);
        }

        return ret;
    }

    constructor (owner, base, kind) {
        this.owner = owner;
        this.base = base || null;
        this.items = base ? base.items.slice() : [];
        this.kind = base ? base.kind : kind;
        this.map = base ? Object.create(base.map) : {};
    }

    add (name, item) {
        if (item) {
            if (typeof item === 'string' || item instanceof String) {
                item = this.itemFromString(item);
                name = item.name;
            } else {
                item = this.itemFromValue(item);
            }
        } else {
            item = this.itemFromString(name);
            name = item.name;
        }

        item.name = name;
        item.loname = name.toLowerCase();

        if (!item.isValue) {
            item = this.wrap(item);
        }

        this.items.push(item);
        this.map[name] = this.map[item.loname] = item;
    }

    addAll (all) {
        if (typeof all === 'string' || all instanceof String) {  // TODO instanceof?
            all = all.split(' ');

            all.forEach(part => this.add(part));
        }
        else if (Array.isArray(all)) {
            for (let item of all) {
                this.add(item.name, item);
            }
        }
        else {
            for (let name in all) {
                let item = all[name];

                if (typeof item !== 'string') {
                    this.add(name, item);
                }
            }

            for (let name in all) {
                let item = all[name];

                if (typeof item === 'string') {
                    this.alias(name, item);
                }
            }
        }
    }
    
    alias (alias, actualName) {
        var map = this.map,
            item = map[actualName],
            loname = alias.toLowerCase();
        
        if (!item) {
            throw new Error(`No such command "${actualName}" for alias "${alias}"`);
        }

        map[alias] = map[loname] = item;
        item.alias.push(alias);
    }
    
    canonicalize (name) {
        var entry = this.lookup(name);

        if (!entry) {
            throw new Error(`${name} matches no ${this.kind} for ${this.owner.title}`);
            // "bar" matches no switches for "git commit"
            // "foo" matches no commands for "git"
        }

        return entry.name;
    }

    /**
     * This method accepts a string and produces an item config object.
     * @param {String} def
     * @return {Object}
     */
    itemFromString (def) {
        let match = itemRe.exec(def);

        if (!match) {
            throw new Error(`Invalid parameter syntax definition: "${def}"`);
        }

        let item = {
            name: match[1] || match[4],
            type: match[2] || match[5] || null
        };
        
        if (item.type) {
            item.array = !!(match[3] || match[6]);
        }

        if (match[4]) { // if (optional)
            // Only store a value if we have one (this property is detected using
            // the "in" operator):
            if (match[7] != null) {
                item.value = match[7];
            } else if (match[6]) { // This is an optional variadic argument, no need to explicitly define a default value
                item.value = [];
                item.vargs = true;
            }
        }

        return item;
    }

    itemFromValue (item) {
        if (item.constructor !== Object) {
            item = {
                value: item
            };
        }

        return item;
    }

    lookup (name) {
        var map = this.map,
            entry, first, loname, matches, ret;

        ret = map[name] || map[loname = name.toLowerCase()];

        if (!ret) {
            let ignore = {};
            
            for (let key in map) {
                entry = map[key];

                if (ignore[entry.name]) {
                    // ignore aliases for the same thing (ex "fooBar" and "foobar")
                    continue;
                }
                
                ignore[entry.name] = true;

                if (key.startsWith(loname) || key.startsWith(name)) {
                    if (!ret) {
                        first = key;
                        ret = entry;
                    }
                    else {
                        if (!matches) {
                            matches = [first];
                        }

                        matches.push(key);
                    }
                }
            }
            
            if (matches) {
                // If we have multiple matches then the name we were given is
                // ambiguous (so throw):
                throw new Error(`"${name}" matches multiple ${this.kind} for ${this.owner.title}: ${matches.join(', ')}`);
                // "bar" matches multiple switches for "git commit"
                // "foo" matches multiple commands for "git"
            }
        }

        return ret || null;
    }

    /**
     * This method applies default values for missing parameters.
     * @param {Object} params The parameter data object.
     */
    setDefaults (params) {
        for (let item of this.items) {
            if (item.optional && !(item.name in params)) {
                if ('value' in item) {
                    item.set(params, item.value);
                }
                else if (item.vargs) {
                    // For optional vargs parameters, drop an empty array in the params
                    // to avoid NPEs (like a rest operator).
                    params[item.name] = [];
                }
                // else we could put the default value for item.type but that would be
                // hard to distinguish from non-supplied parameters (set item.value if
                // that is preferred).
            }
        }
    }

    /**
     * This method returns a String describing problem(s) with the given `params`.
     * @param {Object} params The parameter data object to validate.
     * @return {String} The problem with the `params` or `null` if there is no problem.
     */
    validate (params) {
        var missing;
        
        for (let item of this.items) {
            if (item.required && !(item.name in params)) {
                (missing || (missing = [])).push(item.name);
            }
        }
        
        if (missing) {
            return `Missing required ${this.kind}: ${missing.join(', ')}`;
        }
        
        return null;
    }

    /**
     * Wraps the given config object as a `Value` or derived type.
     * @param {Object} item The config object for the derived `Value` type.
     * @return {Value}
     */
    wrap (item) {
        return new Value(item);
    }
}

module.exports = Items;
