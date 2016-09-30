"use strict";

const Arguments = require('./Arguments');
const Switches = require('./Switches');
const Types = require('./Types');

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
        for (let name in members) {
            this.defineAspect(name, members[name]);
        }
    }

    static defineAspect (name, value) {
        if (name === 'switches') {
            let items = this.switches;
            items.addAll(value);
        }
        else {
            this[name] = value;
        }
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

    attach (parent, name) {
        this.parent = parent;
        this.name = name;
        parent.child = this;
        return this;
    }
    
    configure (args) {
        args.ownerPush(this);

        while (args.more()) {  // while (!atEnd && !atAnd && !atThen) {
            let arg = args.pull();
            
            if (!this.processArg(args, arg)) {
                args.unpull();
                break;
            }
        }

        this.switches.setDefaults(this.params);
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

    down (name) {
        var candidate = this.child;
        var is = (typeof name === 'function') ? name : (c => !name || c.name === name);

        while (candidate && !is(candidate)) {
            candidate = candidate.child;
        }

        return candidate;
    }

    leaf () {
        return this.down(c => !c.child) || this;  // ||this since we may be the leaf
    }

    /**
     * @method parseSwitch
     * This method executes the commands described in the `Arguments` object. This method
     * is typically called via the `run` method.
     * @param {Arguments} args The `Arguments` instance containing the arguments to run.
     * @param arg The current argumetn to parse the switch from
     * @return {Array} A two element array containing the `Switch` instance ([0]) and the parsed value ([1]).
     */

    parseSwitch (args, arg) {
        var params = this.params,
            entry, m, name, value;
        
        if (!(m = paramRe.exec(arg))) {
            if (!(m = paramAssignRe.exec(arg))) {
                if (!(m = plusParamRe.exec(arg))) {
                    return null;
                }
                
                // +param
                return [this.switches.canonicalize(m[1]), true];
            }

            // --param=value
            value = m[2];
        }

        name = this.switches.canonicalize(m[1]);
        if (value === undefined) {
            // --param value
            
            if (typeof params[name] !== 'boolean') {
                value = args.mustPull();
            }
            else {
                // We allow "-foo" to toggle a boolean value if no value is provided
                value = args.peek();

                let bv = Types.boolean.convert(value);
                if (bv === null) {
                    value = !params[name];
                }
                else {
                    // --bool true|false|...
                    args.advance();
                    value = bv;
                }
            }
        }
        
        entry = this.switches.lookup(name);
        let v = entry.convert(value);

        if (v === null) {
            this.raise(`Invalid ${entry.type} value for ${name}: "${value}"`);
        }

        return [entry, v];
    }

    processArg (args, arg) {
        return this.processSwitch(args, arg);
    }

    processSwitch (args, arg) {
        var parsed = this.parseSwitch(args, arg);
        var params = this.params;
        var switches = this.switches;

        if (!parsed) {
            return false;
        }

        // Delegate the act of putting the value into the params map over to the
        // Switch instance.
        parsed[0].set(params, parsed[1]);
        parsed[0].set(switches, parsed[1]);
        return true;
    }

    raise (msg) {
        //TODO include context info like:
        //      ... while processing 'foo' switch for 'bar blerp'

        throw new Error(msg);
    }

    root () {
        return this.up(p => !p.parent) || this;  // ||this since we may be the root
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
