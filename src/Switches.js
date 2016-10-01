"use strict";

const Items = require('./Items');
const Value = require('./Value');

class Switch extends Value {
}

Switch.kind = 'switch';
Switch.kinds = 'switches';
Switch.isSwitch = Switch.prototype.isSwitch = true;

/**
 * This class manages a case-insensitive collection of named switches.
 * @private
 */
class Switches extends Items {
    // empty
}

Switches.itemType = Switches.prototype.itemType = Switch;
Switches.isSwitches = Switches.prototype.isSwitches = true;

module.exports = Switches;
