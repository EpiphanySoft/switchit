"use strict";

const Items = require('./Items');

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

class Switch {
    constructor (config) {
        Object.assign(this, config);
    }

    convert (value) {
        var converter = converters[typeof this.value];

        if (converter) {
            return converter(value);
        }
    }
}

/**
 * This class manages a case-insensitive collection of named switches.
 * @private
 */
class Switches extends Items {
    constructor (owner, base) {
        super(owner, base, 'switches');
    }

    wrap (item) {
        return new Switch(item);
    }
}

module.exports = Switches;
