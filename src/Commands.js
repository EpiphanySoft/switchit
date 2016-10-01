"use strict";

const Item = require('./Item');
const Items = require('./Items');

class Cmd extends Item {
    create (parent) {
        var cmd = new this.type();

        if (parent) {
            cmd.attach(parent, this.name);
        }

        return cmd;
    }

    verify () {
        if (!this.type.isCmdlet) {
            throw new Error(`Invalid command type "${this.type}" (must extend Cmdlet)`);
        }
    }
}

/**
 * This class manages a case-insensitive collection of named commands.
 * @private
 */
class Commands extends Items {
    static get (owner) {
        return super.get(owner, 'commands');
    }

    constructor (owner, base) {
        super(owner, base, 'commands');
    }

    itemFromString (def) {
        // This method would be called if user calls add('foo') or more likely if they
        // call:
        //
        //      C.define({
        //          commands: 'foo bar'
        //      });
        //
        // Neither is valid for a command container.
        //
        throw new Error(`Missing command definition for ${def}`);
    }

    itemFromValue (item) {
        if (item.isCmdlet) {
            item = {
                type: item
            };
        }

        return item;
    }

    wrap (item) {
        return new Cmd(item);
    }
}

module.exports = Commands;
