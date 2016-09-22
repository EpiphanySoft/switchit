"use strict";

const Switches = require('./Switches');

const paramRe = /^\-{1,2}([a-z_-][\w-]*)$/i;
const paramAssignRe = /\-{1,2}([^=]+)\=(.*)/i;
const plusParamRe = /\+([a-z_-][\w-]*)/i;
const boolRe = /^(?:true|false)$/i;
const trueRe = /^true$/i;
const falseRe = /^false$/i;

class Command {
    static get switches () {
        return Items.get(this, 'switches');
    }

    static describe (members) {
        var add = members.switches;

        if (add) {
            var switches = this.switches;
            switches.addAll(add);
        }
    }

    constructor () {
        this.params = Object.assign({}, this.switches.values);
    }

    get switches () {
        return this.constructor.switches;
    }
    
    configure (args) {
        while (args.more()) {
            let arg = args.pull();
            
            if (!this.processConfigParam(args, arg)) {
                args.unpull();
            }
        }
    }

    dispatch (args) {
        this.configure(args);
        this.execute(args);
    }

    parseConfigParam (args, arg) {
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
            
            if (typeof params[name] === 'boolean') {
                // We allow "-foo" to toggle a boolean value if no value is provided
                value = args.peek();
                
                if (boolRe.test(value)) {
                    // --bool true|false
                    args.advance();
                    value = trueRe.test(value);
                }
                else {
                    value = !params[name];
                }
            }
            else {
                value = args.mustPull();
            }
        }
        
        entry = this.switches.lookup(name);
        value = entry.convert(value);

        return [name, value];
    }

    processConfigParam (args, arg) {
        var parsed = this.parseConfigParam(args, arg);

        if (!parsed) {
            return false;
        }

        //

        return true;
    }

    //---------------------------------------------------------------
    // Private
}

Command.title = 'Command';
Command._switches = new Switches(Command, null);

module.exports = Command;
