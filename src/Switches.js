"use strict";

const Items = require('./Items');
const Value = require('./Value');

class Switch extends Value {
}

/**
 * This class manages a case-insensitive collection of named switches.
 * @private
 */
class Switches extends Items {
    static get (owner) {
        return super.get(owner, 'switches');
    }

    constructor (owner, base) {
        super(owner, base, 'switches');
    }

    wrap (item) {
        return new Switch(item);
    }
}

module.exports = Switches;
