"use strict";

const Cmdlet = require('./Cmdlet');
const Parameters = require('./Parameters');

class Command extends Cmdlet {
    static define (members) {
        super.define(members);

        var add = members.parameters;

        if (add) {
            var items = this.parameters;
            items.addAll(add);
        }
    }

    static get parameters () {
        return Parameters.get(this);
    }

    //-----------------------------------------------------------

    constructor () {
        super();

        var params = this.params = Object.assign({}, this.switches.values);
    }

    get parameters () {
        return this.constructor.parameters;
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
Command._parameters = new Parameters(Command);

module.exports = Command;
