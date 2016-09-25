"use strict";

const Value = require('./Value');

const NAME = '[a-z_]\\w*';
const itemRe = new RegExp('^\\s*(?:' +
            '(?:\\[' +
                '(' + NAME + ')' +   // [1]
                '(?:[:](' + NAME + '))?' +  // [2] optional ":type"
            ')' +
            '(?:\\[' +
                '(' + NAME + ')' +   // [3]
                '(?:[:](' + NAME + '))?' +  // [4] optional ":type"
                '(?:[=]([^\\]]+))?' +       // [5] optional "=value"
            '\\])' +
        ')\\s*$', 'i');

//const shortHandRe = /^(\[)?([a-z]+[0-9\-_]*)(:(\w+)(=([\w._\-]+))?)?(])?$/i;

/**
 * This class manages a case-insensitive collection of named items for a class. This is
 * used to manage "switches" and "arguments" for Command and "commands" for Commands.
 * @private
 */
class Items {
    static get (owner, name) {
        var key = '_' + name;
        var ret = owner[key];

        if (!owner.hasOwnProperty(key)) {
            let base = Items.get(Object.getPrototypeOf(owner), name);

            owner[key] = ret = new this(owner, base, name);
        }

        return ret;
    }

    constructor (owner, base, kind) {
        this.owner = owner;
        this.base = base || null;
        this.items = base ? base.items.slice() : [];
        this.map = base ? Object.create(base.map) : {};
        this.kind = base ? base.kind : kind;
        this.values = base ? Object.create(base.values) : {};
    }

    add (name, item) {
        if (!item) {
            item = this.parseDef(name);
        }

        item = this.parseItem(item);

        item.name = name;
        item.loname = name.toLowerCase();

        item = this.wrap(item);

        this.items.push(item);
        this.map[name] = this.map[item.loname] = item;
        this.values[name] = this.values[item.loname] = item.value;
    }

    addAll (all) {
        if (typeof all === 'string' || all instanceof String) {  // TODO instanceof?
            all = all.split(' ');

            all.forEach(part => this.add(part));
        }
        else {
            for (let name in all) {
                this.add(name, all[name]);
            }
        }
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

    lookup (name) {
        var map = this.map,
            entry, first, loname, matches, ret;

        ret = map[name] || map[loname = name.toLowerCase()];

        if (!ret) {
            for (let key in map) {
                entry = map[key];

                if (entry.loname.startsWith(loname)) {
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

    parseDef (def) {
        let match = itemRe.exec(def);

        if (!match) {
            throw new Error(`Invalid parameter syntax definition: "${def}"`);
        }

        let item = {
            name: match[1] || match[3],
            type: match[2] || match[4] || null
        };

        if (match[3]) { // if (optional)
            // Only store a value if we have one (this property is detected using
            // the "in" operator):
            if (match[5] != null) {
                item.value = match[5];
            }
        }

        return item;
    }

    parseItem (item) {
        if (item.constructor !== Object) {
            item = {
                value: item
            };
        }

        return item;
    }

    wrap (item) {
        return item;
    }
}

module.exports = Items;
