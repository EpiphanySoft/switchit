"use strict";

const EMPTY = [];
const Item = require('./Item');
const Types = require('./Types');

const NAME = '[a-z_]\\w*';
const itemRe = new RegExp('^\\s*(?:' +
                '(' + NAME + ')' +   // [1]
                '(?:[:](' + NAME + '))?' +  // optional ":type" [2]
                '((?:\\.\\.\\.)|(?:\\[\\]))?'  +   // optional "..." or "[]" [3]
            ')\\s*$', 'i');

/**
 * This class is the base for each item in an `Items` collection. All `Value` instances
 * must have a corresponding defined `Type` in the `Types` registry. This can be set by
 * providing a `type` config property. If no `type` is specified, the `value` (if given)
 * is used. If neither `type` nor `value` are given, the type defaults to String.
 */
class Value extends Item {
    /**
     * This method accepts a string and produces an item config object.
     * @param {String} def
     * @return {Object}
     */
    static parse (def) {
        if (typeof def !== 'string') {
            if (!def || def.constructor !== Object) {
                def = {
                    value: def
                };
            }

            return def;
        }

        var valid = true,
            optional = false,
            switchy = false,
            i, value;

        // Peel off "[]" from "[foo]" to leave "foo" (remember it as optional).
        if (def[0] === '[') {
            valid = def.endsWith(']');
            if (valid) {
                def = def.substr(1, def.length - 2);
                optional = true;
            }
        }

        // Peel off "{}" from "{bar}" to leave "bar" (remember it is a switch).
        // By cascade we also handle "[{foobar}]" combination
        if (valid && def[0] === '{') {
            valid = def.endsWith('}');
            if (valid) {
                def = def.substr(1, def.length - 2);
                // Only parameters use "{foo}" syntax
                valid = this.itemType.isParameter;
                switchy = true;
            }
        }

        // Lop off the value part of "foo=value" (including the "="):
        if (valid && optional) {
            i = def.indexOf('=');
            if (i > 0) {
                value = def.substr(i + 1);
                def = def.substr(0, i);
            }
        }

        // Regex the rest... roughly: name(:type)?(...|[])?
        let match = itemRe.exec(def);

        if (!match || !valid) {
            throw new Error(`Invalid ${this.constructor.kind} syntax definition: "${def}"`);
        }

        let item = {
            name: match[1],
            type: match[2] || null,
            optional: optional,  // may not have a default value...
            switch: switchy,
            vargs: !!match[3]
        };

        if (value !== undefined) {
            // Only set a value if we have one (presence is detected via "in" operator):
            item.value = value;
        }

        return item;
    }

    init () {
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

    /**
     * Converts the given value to the appropriate type. If the value cannot be converted,
     * `null` is returned.
     * @param {*} value The value to convert.
     * @return {*} The `value` suitably converted or `null` if that is not possible.
     */
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
    
    verify () {
        if (!this.typeOf) {
            throw new Error(`Unknown value type "${this.type}" (use Types.define to define it)`);
        }
    }

    get typeOf () {
        return Types.defs[this.type];
    }
}

Value.prototype.isValue = true;
Value.prototype.vargs = false;

module.exports = Value;
