"use strict";

const Types = require('./Types');

class Value {
    constructor (config) {
        Object.assign(this, config);

        this.optional = 'value' in this;
        this.required = !this.optional;

        if (!this.type) {
            if (this.required) {
                this.type = 'string';
            }
            else {
                let def = Types.getTypeOf(this.value);

                if (!def) {
                    throw new Error(`No type for "${value}" (use Types.define to define it)`);
                }

                this.type = def.name;
            }
        }

        if (!this.typeDef) {
            throw new Error(`Unknown value type "${this.type}" (use Types.define to define it)`);
        }
    }

    convert (value) {
        var def = this.typeDef;

        return def.convert(value);
    }

    get typeDef () {
        return Types.defs[this.type];
    }
}

module.exports = Value;
