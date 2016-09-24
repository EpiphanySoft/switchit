"use strict";

const AbstractCommand = require('./AbstractCommand');
const Args = require('./Args');

class Command extends AbstractCommand {
    static define (members) {
        super.define(members);

        var add = members.commands;

        if (add) {
            var commands = this.commands;
            commands.addAll(add);
        }
    }

    constructor () {
        super();
        this.params = Object.assign({}, this.switches.values);
    }

    dispatch (args) {
        this.configure(args);
        this.execute(this.params, args);
    }

    processArg (args, arg) {
        if (super.processArg(args, arg)) {
            return true;
        }

        //
    }

    //---------------------------------------------------------------
    // Private
}

Command.title = 'Command';
Command._arguments = new Args(Command, null);

module.exports = Command;
