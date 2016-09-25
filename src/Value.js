"use strict";

const EMPTY = [];
const Types = require('./Types');

class Value {
    constructor (config) {
        Object.assign(this, config);

        // Allow the user to provide "optional:true|false" or "required:true|false"
        // and calculate the other from it:
        if (this.optional !== undefined) {
            this.required = !this.optional;
        }
        else if (this.required !== undefined) {
            this.optional = !this.required;
        }
        else {
            this.optional = 'value' in this;
            this.required = !this.optional;
        }

        if (!this.type) {
            if ('value' in this) {
                let type = Types.of(this.value);

                if (!type) {
                    throw new Error(`No type for "${value}" (use Types.define to define it)`);
                }

                this.type = type.name;
            }
            else {
                this.type = 'string';
            }
        }

        if (!this.typeOf) {
            throw new Error(`Unknown value type "${this.type}" (use Types.define to define it)`);
        }
    }

    /**
     * This method is empty and is intended to allow the user to post-process new
     * values after they have been added to the parameter data.
     * @param {Object} data The parameter data object.
     * @param {*} value The new value just added to `data`.
     */
    apply (data, value) {
        // empty
    }

    convert (value) {
        var def = this.typeOf;

        return def.convert(value);
    }

    /**
     * Adds a value to the parameter data object. Handles `vargs` by always producing
     * an array.
     * @param {Object} data The parameter data object.
     * @param {*} value The new value to add `data`.
     */
    set (data, value) {
        let v = value;

        if (this.vargs) {
            v = data[this.name];
            v = (v || EMPTY).concat(value);  // handle 4 or [4,5]
        }

        data[this.name] = v;

        this.apply(data, value);
    }

    get typeOf () {
        return Types.defs[this.type];
    }
}

Value.prototype.vargs = false;

module.exports = Value;
