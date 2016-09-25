"use strict";

const Arguments = require('./Arguments');
const Switches = require('./Switches');

const paramRe = /^\-{2}([a-z_-][\w-]*)$/i;
const shortParamGroupRe = /^\-([a-z_-][\w-]*)$/i;
const paramAssignRe = /\-{1,2}([^=]+)\=(.*)/i;
const plusParamRe = /\+([a-z_-][\w-]*)/i;
const boolRe = /^(?:true|false|yes|no|on|off)$/i;
const trueRe = /^(?:true|yes|on)$/i;
const falseRe = /^(?:false|no|off)$/i;

class Cmdlet {
    static define (members) {
        var add = members.switches;

        if (add) {
            var items = this.switches;
            items.addAll(add);
        }
    }

    static get switches () {
        return Switches.get(this);
    }
    
    //-----------------------------------------------------------

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

                if (boolRe.test(value)) {
                    // --bool true|false|...
                    args.advance();
                    value = trueRe.test(value);
                }
                else {
                    value = !params[name];
                }
            }
        }
        
        entry = this.switches.lookup(name);
        value = entry.convert(value);

        return [name, value];
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

        params[parsed[0]] = parsed[1];  // TODO call user fn
        return true;
    }

    root () {
        var parent = this;

        while (parent.parent) {
            parent = parent.parent;
        }

        return parent;
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

        while (parent && name && parent.name !== name) {
            parent = parent.parent;
        }

        return parent;
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
