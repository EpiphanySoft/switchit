"use strict";

const Items = require('./Items');
const Command = require('./Command');

class Cmd extends Command {
}

/**
 * This class manages a case-insensitive collection of named commands
 * @private
 */
class Cmds extends Items {
    constructor (owner, base) {
        super(owner, base, 'commands');
    }

    wrap (item) {
        return new Cmd(item);
    }
}

module.exports = Cmds;
