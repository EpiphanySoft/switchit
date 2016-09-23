"use strict";

const Items = require('./Items');
const Value = require('./Value');

class Arg extends Value {
}

/**
 * This class manages a case-insensitive collection of named positional args.
 * @private
 */
class Args extends Items {
    constructor (owner, base) {
        super(owner, base, 'arguments');
    }

    wrap (item) {
        return new Arg(item);
    }
}

module.exports = Args;
