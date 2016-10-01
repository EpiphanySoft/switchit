"use strict";

const Value = require('./Value');

// Playground for above: https://jsfiddle.net/yo6m18xr/

/**
 * This class manages a case-insensitive collection of named items for a class. This is
 * used to manage "parameters" for Command's and "commands" for Containers as well as
 * "switches" for both.
 * @private
 */
class Items {
    static get (owner) {
        var name = this.kinds;
        var key = '_' + name;
        var ret = owner[key];

        if (!owner.hasOwnProperty(key)) {
            let base = this.get(Object.getPrototypeOf(owner), name);

            owner[key] = ret = new this(owner, base);
        }

        return ret;
    }

    constructor (owner, base) {
        this.owner = owner;
        this.base = base || null;
        this.items = base ? base.items.slice() : [];
        this.map = base ? Object.create(base.map) : {};
    }

    static get kind () {
        return this.itemType.kind;
    }

    static get kinds () {
        return this.itemType.kinds;
    }
    
    add (name, item) {
        var ItemType = this.itemType;
        
        if (item) {
            item = ItemType.parse(item);
            // if (typeof item === 'string' || item instanceof String) {
            //     item = ItemType.parse(item);
            //     name = item.name;
            // } else {
            //     item = ItemType.parse(item);
            // }
        } else {
            item = ItemType.parse(name);
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
        throw new Error(`Can only apply aliases to commands: "${alias}" = "${actualName}"`);
    }
    
    canonicalize (name) {
        var entry = this.lookup(name);

        if (!entry) {
            throw new Error(`${name} matches no ${this.kinds} for ${this.owner.title}`);
            // "bar" matches no switches for "git commit"
            // "foo" matches no commands for "git"
        }

        return entry.name;
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
                throw new Error(`"${name}" matches multiple ${this.kinds} for ${this.owner.title}: ${matches.join(', ')}`);
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
     * @return {Item}
     */
    wrap (item) {
        var T = this.itemType;
        return new T(item);
    }
}

module.exports = Items;
