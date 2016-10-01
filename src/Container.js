"use strict";

const Cmdlet = require('./Cmdlet');
const Commands = require('./Commands');

const Help = require('./Help');

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
        var me = this;

        return new Promise((resolve, reject) => {
            me.configure(args);
            me.validate(me.params);
            let arg = args.pull();

            if (!arg) {
                let defaultCmd = me.commands.lookup('default'),
                    defaultCmdName;
                if (defaultCmd) {
                    defaultCmdName = defaultCmd.name;
                    defaultCmd = defaultCmd.type;
                }
                else {
                    defaultCmdName = 'help';
                    defaultCmd = Help;
                }
                new defaultCmd().attach(me, defaultCmdName).dispatch(args);
                args.ownerPop(me);
                resolve(0);
                return;
            }

            let entry = me.commands.lookup(arg);

            if (!entry) {
                args.ownerPop(me);
                reject(new Error(`No such command or category "${arg}"`)); //TODO full cmd path
                return;
            }

            let cmd = entry.create(me);

            cmd.dispatch(args).then(v => {
                cmd.destroy();
                args.ownerPop(me);

                if (args.pullConjunction(!me.parent) && !args.atEnd()) {
                    // If this command ended with an appropriate conjunction ("and" or
                    // "then" keyword) and there are more arguments to process, call
                    // back to our dispatch() method to go around again.
                    resolve(me.dispatch(args));
                } else {
                    resolve(v);
                }
            },
            err => {
                cmd.destroy();
                args.ownerPop(me);
                reject(err);
            });
        });
    }
}

Object.assign(Container, {
    isContainer: true,

    _commands: new Commands(Container)
});

Object.assign(Container.prototype, {
    isContainer: true
});

module.exports = Container;
