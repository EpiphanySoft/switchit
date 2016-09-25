"use strict";

const Cmdlet = require('./Cmdlet');
const Commands = require('./Commands');

class Container extends Cmdlet {
    static defineAspect (name, value) {
        if (name === 'commands') {
            var items = this.commands;
            items.addAll(value);
        }
        else {
            super.defineAspect(name, value);
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

Object.assign(Container, {
    isContainer: true,
    title: 'Command container',

    _commands: new Commands(Container)
});

Object.assign(Commands.prototype, {
    isContainer: true,
    parent: null
});

module.exports = Container;
