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

class Value {
    constructor (config) {
        Object.assign(this, config);
    }

    convert (value) {
        var converter = converters[this.type] || converters[typeof this.value];

        if (converter) {
            return converter(value);
        }
    }
}

Value.converters = converters;

module.exports = Value;
