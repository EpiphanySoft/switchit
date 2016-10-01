"use strict";

const Items = require('./Items');
const Value = require('./Value');

class Parameter extends Value {
}

Parameter.kind = 'parameter';
Parameter.kinds = 'parameters';
Parameter.isParameter = Parameter.prototype.isParameter = true;

/**
 * This class manages a case-insensitive collection of named positional parameters.
 * @private
 */
class Parameters extends Items {
    // empty
}

Parameters.itemType = Parameters.prototype.itemType = Parameter;
Parameters.isParameters = Parameters.prototype.isParameters = true;

module.exports = Parameters;
