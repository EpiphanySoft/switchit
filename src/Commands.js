"use strict";

const Command = require('./Command');
const Items = require('./Items');

class Commands extends Command {
    static get commands () {
        return Items.get(this, 'commands');
    }

    static define (members) {
        super.define(members);

        var add = members.commands;

        if (add) {
            var commands = this.commands;
            commands.addAll(add);
        }
    }

    dispatch (args) {
        this.configure(args);
    }
}

Commands.title = 'Command category';
Commands._commands = new Items(Commands, null, 'commands');

module.exports = Commands;
