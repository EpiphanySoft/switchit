"use strict";

const Items = require('./Items');
const Value = require('./Value');

class Parameter extends Value {
}

/**
 * This class manages a case-insensitive collection of named positional args.
 * @private
 */
class Parameters extends Items {
    static get (owner) {
        return super.get(owner, 'parameters');
    }

    constructor (owner, base) {
        super(owner, base, 'parameters');
    }

    wrap (item) {
        return new Parameter(item);
    }
}

module.exports = Parameters;
