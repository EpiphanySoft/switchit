"use strict";

const Arguments = require('./Arguments');
const Switches = require('./Switches');
const Type = require('./Type');
const Util = require('./Util');

const paramRe = /^\-{1,2}([a-z_-][\w-]*)$/i;
const shortParamGroupRe = /^\-([a-z_-][\w-]*)$/i;
const paramAssignRe = /\-{1,2}([^=]+)\=(.*)/i;
const plusParamRe = /\+([a-z_-][\w-]*)/i;

/**
 * This is the abstract base class for the `Command` and `Container` classes. All
 * Cmdlets have a set of `switches` tracked at the class level.
 *
 * Instances of Cmdlets have a `parent` reference to the Cmdlet instance that created it.
 * The top-most Cmdlet will have a `null` value for its `parent` and it is said to be the
 * root. Since only one Cmdlet can be active at a time, Cmdlets can also have a `child`
 * reference.
 *
 * Given a three level command invocation like this:
 *
 *      foo bar zip
 *
 * There are 3 Cmdlets: "foo", "bar" and "zip". The first two are `Container` instances
 * while the last is a `Command` instance.
 *
 *      foo.down()      === bar
 *      foo.down('zip') === zip
 *      foo.leaf()      === zip
 *
 *      bar.up()   === foo
 *      bar.root() === foo
 *      bar.down() === zip
 *      bar.leaf() === zip
 *
 *      zip.up()      === bar
 *      zip.up('foo') === foo
 *      zip.root()    === foo
 *
 * Or visually:
 *
 *      Container               Container                Command
 *      +=======+    child      +=======+    child      +=======+
 *      |       | ------------> |       | ------------> |       |
 *      |  foo  |               |  bar  |               |  zip  |
 *      |       | <------------ |       | <------------ |       |
 *      +=======+    parent     +=======+    parent     +=======+
 *
 *        .down() --------------> .
 *
 *        .down('zip') ---------------------------------> .
 *
 *        .leaf() --------------------------------------> .
 *
 *        . <-------------------- .up()
 *
 *        . <-------------------- .root()
 *
 *                                .down() --------------> .
 *
 *                                .leaf() --------------> .
 *
 *                                . <-------------------- .up()
 *
 *        . <-------------------------------------------- .up('foo')
 *
 *        . <-------------------------------------------- .root()
 *
 * As instances are created to process arguments, they are attached to this chain as well
 * as pushed on to the `owner` stack of the associated `Arguments` instance.
 *
 * As instances are cleaned up (via `destroy`), they are detached from this chain and
 * popped off the `Arguments` ownership stack.
 */
class Cmdlet {
    static define (members) {
        // Process switches first so that parameters can link up with existing
        // switches
        if (members.switches) {
            this.defineAspect('switches', members.switches);
        }

        for (let name in members) {
            if (name !== 'switches' && name !== 'help') {
                this.defineAspect(name, members[name]);
            }
        }

        // Define help last so it can attach text to any defined switch or
        // parameter....
        if (members.help) {
            this.defineAspect('help', members.help);
        }
    }

    static defineAspect (name, value) {
        if (name === 'switches') {
            let items = this.switches;
            items.addAll(value);
        }
        else if (name === 'help') {
            this.defineHelp(value);
        }
        else {
            this[name] = value;
        }
    }

    /**
     * Handle this type of thing:
     *
     *      help: {
     *          '': 'My help stuff',
     *
     *          switch: 'Help on a switch',
     *          param: 'Help on a parameter'
     *      }
     *
     * Help for sub-commands is handled in the define call for that class.
     */
    static defineHelp (value) {
        if (typeof value === 'string') {
            this.help = value;
        }
        else if (value) {
            for (let name in value) {
                let text = value[name];

                if (name === '') {
                    this.help = text;
                } else {
                    let ok = this.defineItemHelp(name, text);

                    if (!ok) {
                        throw new Error(`No parameter or switch "${name}" for help text "${text}"`);
                    }
                }
            }
        }
    }
    
    static defineItemHelp (name, text) {
        let item = this.switches.get(name);
        let ok;

        if (item) {
            item.help = text;
            ok = true;
        }
        
        return ok;
    }

    static get switches () {
        return Switches.get(this);
    }

    static get title () {
        return this._title || this.name;
    }

    static set title (v) {
        this._title = v;
    }

    static getAspects (includePrivate = false) {
        return {
            switches: this.switches.items.map((s) => {
                if (!s.private || includePrivate) return s;
            }),
            title: this.title,
            help: this.help
        }
    }
    
    //-----------------------------------------------------------

    constructor () {
        this.id = ++Cmdlet.idSeed;
        this.params = {};
    }

    get fullName () {
        var s = this.parent;
        
        s = s ? s.fullName + ' ' : '';
        
        return s + (this.name || this.constructor.title);
    }

    get switches () {
        return this.constructor.switches;
    }

    applyDefaults (params) {
        this.switches.applyDefaults(params);
    }

    atRoot () {
        return !this.parent;
    }

    attach (parent, name) {
        this.parent = parent;
        this.name = name;
        parent.child = this;
        return this;
    }
    
    configure (args) {
        const me = this;
        var params = me.params,
            switches = me.switches,
            entry, match, val;

        return args.pull().then(arg => {
            // While we have arguments, try to process them
            if (arg !== null) {
                match = plusParamRe.exec(arg);

                if (match) {
                    // +param
                    val = true;
                }
                else if ((match = paramAssignRe.exec(arg))) {  // <== assignment
                    // --param=value
                    val = match[2];
                }
                else if ((match = paramRe.exec(arg))) {  // <== assignment
                    // --param value
                    entry = switches.lookup(match[1]);

                    return args.pull().then(value => {
                        let result = entry.setRaw(params, value);

                        if (result === 1) { // Missing value
                            me.raise(`Missing value for "${entry.name}" switch`);
                        }
                        if (result === 2) {  // Invalid value
                            me.raise(`Invalid value for "${entry.name}" switch: "${value}"`);
                        }

                        if (result === 3) { // Ignored value
                            args.unpull(value);
                        }
                        // else Success

                        return me.configure(args);
                    });
                }
                else {
                    // Non-switch, check for other types of arguments (parameters)...
                    return me.processArg(arg, args);
                }

                entry = switches.lookup(match[1]);

                entry.setRaw(params, val);

                return me.configure(args);
            }
        });
    }

    destroy () {
        var parent = this.parent;

        if (parent) {
            this.parent = null;

            if (parent.child === this) {
                parent.child = null;
            }
        }
    }

    dispatch (args) {
        var me = this;
        var params = me.params;

        args.ownerPush(me);

        return Util.finally(me.configure(args).then(() => {
            me.applyDefaults(params);
            me.validate(params);

            return me.execute(params, args);
        }),
        () => {
            args.ownerPop(me);
        });
    }

    down (name) {
        var candidate = this.child;
        var is = (typeof name === 'function') ? name : (c => !name || c.name === name);

        while (candidate && !is(candidate)) {
            candidate = candidate.child;
        }

        return candidate;
    }

    leaf () {
        if (!this.child) {
            return this;
        }
        return this.child.leaf();
    }

    processArg (arg, args) {
        args.unpull(arg);
        return null;
    }

    raise (msg) {
        //TODO include context info like:
        //      ... while processing 'foo' switch for 'bar blerp'

        throw new Error(msg);
    }

    root () {
        if (!this.parent) {
            return this;
        }

        return this.parent.root();
    }

    /**
     * This method executes the commands described by the provided string arguments. This
     * method wraps the strings in an `Arguments` instance and delegates the work to the
     * `dispatch` method.
     * @param {Arguments|String...|Array} args The arguments to run.
     * @return {Promise} The Promise that resolves with the command result.
     */
    run (...args) {
        var a = args[0];

        if (args.length === 1) {
            if (a.isArguments || Array.isArray(a)) {
                args = a;
            }
        }
        else if (!args.length) {
            args = process.argv.slice(2);
        }

        a = args.isArguments ? args : new Arguments(args);

        return this.dispatch(a);
    }

    up (name) {
        var candidate = this.parent;
        var is = (typeof name === 'function') ? name : (c => !name || c.name === name);

        while (candidate && !is(candidate)) {
            candidate = candidate.parent;
        }

        return candidate;
    }
    
    validate (params) {
        var err = this.switches.validate(params || this.params);

        if (err) {
            this.raise(err);
        }
    }

    //---------------------------------------------------------------
    // Private
}

Object.assign(Cmdlet, {
    isCmdlet: true,
    idSeed: 0,

    _switches: new Switches(Cmdlet)
});

Object.assign(Cmdlet.prototype, {
    isCmdlet: true,

    child: null,
    parent: null
});

module.exports = Cmdlet;
