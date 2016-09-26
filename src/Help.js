"use strict";

const Command = require('./Command');

/**
 * This class manages a case-insensitive collection of named switches.
 * @private
 */
class Help extends Command {
    execute (params) {
        console.log(`${this.name}`, params);
    }
}

module.exports = Help;
