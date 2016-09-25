"use strict";

const Arguments = require('./Arguments');
const Switches = require('./Switches');
const Types = require('./Types');

const paramRe = /^\-{2}([a-z_-][\w-]*)$/i;
const shortParamGroupRe = /^\-([a-z_-][\w-]*)$/i;
const paramAssignRe = /\-{1,2}([^=]+)\=(.*)/i;
const plusParamRe = /\+([a-z_-][\w-]*)/i;

/**
 * This is the abstract base class for the `Command` and `Container` classes.
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
            items.addAll(add);
        }
        else {
            this[name] = value;
        }
    }

    static get switches () {
        return Switches.get(this);
    }
    
    //-----------------------------------------------------------

    constructor () {
        this.params = {};
    }

    get switches () {
        return this.constructor.switches;
    }

    attach (parent, name) {
        this.parent = parent;
        this.name = name;
    }
    
    configure (args) {
        while (args.more()) {  // while (!atEnd && !atAnd && !atThen) {
            let arg = args.pull();
            
            if (!this.processArg(args, arg)) {
                args.unpull();
            }
        }

        this.switches.setDefaults(this.params);
    }

    destroy () {
        // template method
    }

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

        if (!parsed) {
            return false;
        }

        // Delegate the act of putting the value into the params map over to the
        // Switch instance.
        parsed[0].set(params, parsed[1]);
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

    run (...args) {
        var a = args[0];

        if (args.length === 1 && Array.isArray(a)) {
            args = a;
        }

        return this.dispatch(new Arguments(args));
    }

    up (name) {
        var parent = this.parent;
        var is = (typeof name === 'function') ? name : (p => !name || p.name === name);

        while (parent && !is(parent)) {
            parent = parent.parent;
        }

        return parent;
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

    _switches: new Switches(Cmdlet)
});

Object.assign(Cmdlet.prototype, {
    isCmdlet: true
});

module.exports = Cmdlet;
