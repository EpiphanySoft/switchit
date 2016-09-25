"use strict";

/**
 * @class switchit.TypeDef
 * @singleton
 *
 * This class manages type conversions for a single data type. Instances of this class
 * are created by `Types.define`.
 */
class TypeDef {
    constructor (config) {
        Object.assign(this, config);
    }

    convert (value) {
        return value;
    }

    is (value) {
        return this.name === typeof value;
    }
}

/**
 * @class switchit.Types
 * @singleton
 *
 * This class manages a basic type registry for type conversions. Types can be defined
 * by calling `define`
 */
const Types = {
    defs: {},

    define (def) {
        if (Types.defs[def.name]) {
            throw new Error(`Type already defined: "${def.name}"`);
        }

        Types.defs[def.name] = new TypeDef(def);
    },

    getTypeOf (value) {
        let def = Types.pick(value, def => def.is(value));

        if (!def) {
            // If the value is not a direct type match, see who can parse it
            def = Types.pick(value, def => def.convert(value) !== null);
        }

        return def;
    },

    pick (value, test) {
        let defs = Types.defs;
        let found = null;
        let ambiguous;

        for (let s in defs) {
            let def = defs[s];

            if (test(def, value)) {
                if (found) {
                    (ambiguous || (ambiguous = [found.name])).push(s);
                }

                found = def;
            }
        }

        if (ambiguous) {
            throw new Error(`Ambiguous type for "${value}"; could be: ${ambiguous.join(', ')}`);
        }

        return found;
    }
};

Types.define({
    name: 'boolean',
    default: false,

    convert (value) {
        return Boolean(value);
    }
});

Types.define({
    name: 'date',
    default: new Date(),

    convert (value) {
        // TODO
    },

    is (value) {
        // TODO
    }
});

Types.define({
    name: 'number',
    default: 0,

    convert (value) {
        return parseFloat(value);
    }
});

Types.define({
    name: 'string',
    default: '',

    convert (value) {
        return String(value);
    }
});

module.exports = Types;
