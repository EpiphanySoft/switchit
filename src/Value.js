"use strict";

const converters = {
    boolean (value) {
        return Boolean(value);
    },

    number (value) {
        return parseFloat(value);
    },

    string (value) {
        return String(value);
    }
};

const defaults = {
    boolean: false,
    number: 0,
    string: ''
};

class Value {
    constructor (config) {
        Object.assign(this, config);
        if (this.value == undefined) {
            this.required = true;
        }
    }

    convert (value) {
        var converter = converters[this.type] || converters[typeof this.value];

        if (converter) {
            return converter(value);
        }
    }
}

Value.defaultValues = defaults;
Value.converters = converters;

module.exports = Value;
