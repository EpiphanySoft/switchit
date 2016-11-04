"use strict";

const Cmdlet = require('./Cmdlet');
const Commands = require('./Commands');
const Util = require('./Util');

const Help = require('./commands/Help');

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

    static getAspects (includePrivate = true) {
        let defaultCmd = null,
            aspectMap = Object.assign(super.getAspects(), {
            commands: this.commands.items.map((cmd) => {
                if (cmd.type === Help && !includePrivate) {
                    return;
                }
                if (!cmd.private || includePrivate) {
                    if (cmd.name === '') {
                        defaultCmd = cmd;
                    } else {
                        if (cmd.aliases.indexOf('') > -1) {
                            defaultCmd = cmd;
                        }
                        return Object.assign({
                            aliases: cmd.aliases,
                            name: cmd.name
                        }, cmd.type.getAspects());
                    }
                }
            }),
            container: true
        });

        if (defaultCmd !== null) {
            aspectMap.defaultCmd = defaultCmd.type.getAspects();
        }

        return aspectMap;
    }

    //-----------------------------------------------------------

    get commands () {
        return this.constructor.commands;
    }

    execute (params, args) {
        var me = this;

        return args.pull().then(arg => {
            let counter = me._counter;  // 0 the first time in...

            if (arg) {
                // After any command has run, the only valid tokens that
                // should follow are "and" or "then". Unless this is the
                // root container, in which case we allow commands to be
                // run in an list:
                //
                //      cmd foo bar baz
                //
                // If "foo", "bar" and "baz" are all top-level commands,
                // this is better then requiring:
                //
                //      cmd foo and bar and baz

                if (args.isConjunction(arg)) {
                    // When we hit "then" conjunctions and we are not the root
                    // container, put it back and drop out...
                    if (args.isThen(arg) && !me.atRoot()) {
                        args.unpull(arg);  // put "then" back for root to get
                        return me._result;
                    }

                    // Mark it as ok to dispatch another command now that we've
                    // hit a conjunction (only root is allowed to do so w/o a
                    // conjunction).
                    me._done = false;

                    // Otherwise skip over it and go again on this container...
                    return me.execute(params, args);
                }

                if (counter && me._done) {
                    // We've pulled a non-conjunction (and as a non-root we are
                    // not allowed to do chaining w/o conjunctions), so fail.
                    throw new Error(`Invalid command "${arg}" following "${me.fullName}"`);
                }
            }
            else if (counter) {
                // We've run out of arguments, so we're done if we've run any
                // commands from this container...
                return me._result;
            }
            else {
                // This is the first dip into this container and we've got no
                // more arguments, so delegate on to the default command (help
                // by default).
                arg = '';
            }

            ++me._counter;
            me._done = !me.atRoot();

            let entry = me.commands.lookup(arg);

            if (!entry) {
                throw new Error(`No such command or category "${me.fullName} ${arg}"`);
            }

            let cmd = entry.create(me);

            return Util.finally(cmd.dispatch(args), () => {
                cmd.destroy();
            }).then(v => {
                me._result = v;

                // Loop back on ourselves. We check for *and* and *then* at the
                // front of this method.
                return me.dispatch(args);
            });
        });
    }
}

Object.assign(Container, {
    isContainer: true,

    _commands: new Commands(Container)
});

Object.assign(Container.prototype, {
    isContainer: true,
    _counter: 0,
    _done: false,
    _result: null
});

// Establish "Help" as the (default) default command.
Container.define({
    commands: {
        '': Help
    }
});

module.exports = Container;
