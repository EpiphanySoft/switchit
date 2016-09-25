"use strict";

const EMPTY = [];
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
                let type = Types.of(this.value);

                if (!type) {
                    throw new Error(`No type for "${value}" (use Types.define to define it)`);
                }

                this.type = type.name;
            }
        }

        if (!this.typeDef) {
            throw new Error(`Unknown value type "${this.type}" (use Types.define to define it)`);
        }
    }

    convert (value) {
        var def = this.typeOf;

        return def.convert(value);
    }

    set (data, value) {
        if (this.array) {
            let v = data[this.name];

            value = (v || EMPTY).concat(value);  // handle 4 or [4,5]
        }

        data[this.name] = value;
    }

    get typeOf () {
        return Types.defs[this.type];
    }
}

Value.prototype.array = false;

module.exports = Value;
