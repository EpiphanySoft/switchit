"use strict";

const Cmdlet = require('./Cmdlet');
const Commands = require('./Commands');

class Container extends Cmdlet1 {
    static define (members) {
        super.define(members);

        var add = members.commands;

        if (add) {
            var items = this.commands;
            items.addAll(add);
        }
    }

    static get commands () {
        return Commands.get(this);
    }

    //-----------------------------------------------------------

    get commands () {
        return this.constructor.commands;
    }

    dispatch (args) {
        var both = !this.parent;
        var first = true;
        
        do {
            this.configure(args);
            
            let arg = args.pull();

            if (!arg) {
                if (first) {
                    //TODO new HelpCommand().attach(this, "help").dispatch(arguments);
                }
            } else {
                let entry = this.commands.lookup(arg);

                if (entry) {
                    let cmd = entry.create(this);

                    try {
                        cmd.dispatch(args);
                    }
                    finally {
                        cmd.destroy();
                    }
                }
                else {
                    //TODO
                }
            }

            first = false;

        } while (args.pullConjunction(both));
    }
}

Container.title = 'Command category';
Container._commands = new Commands(Container);

Container.prototype.parent = null;

module.exports = Container;
