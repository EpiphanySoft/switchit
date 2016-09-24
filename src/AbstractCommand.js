"use strict";

const Items = require('./Items');
const Switches = require('./Switches');
const Args = require('./Args');

const paramRe = /^\-{2}([a-z_-][\w-]*)$/i;
const shortParamGroupRe = /^\-([a-z_-][\w-]*)$/i;
const paramAssignRe = /\-{1,2}([^=]+)\=(.*)/i;
const plusParamRe = /\+([a-z_-][\w-]*)/i;
const boolRe = /^(?:true|false|yes|no)$/i;
const trueRe = /^true|yes$/i;
const falseRe = /^false|no$/i;

class AbstractCommand {
    static get switches () {
        return Items.get(this, 'switches');
    }

    static get args () {
        return Items.get(this, 'args');
    }

    static define (members) {
        if (members.switches) {
            var switches = this.switches;
            switches.addAll(members.switches);
        }
        if (members.args){
            var args = this.args;
            args.addAll(members.args);
        }
    }

    get switches () {
        return this.constructor.switches;
    }
    
    configure (args) {
        while (args.more()) {  // while (!atEnd && !atAnd && !atThen) {
            let arg = args.pull();
            
            if (!this.processArg(args, arg)) {
                args.unpull();
            }
        }
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
                    // --bool true|false
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

        params[parsed[0]] = parsed[1];
        return true;
    }

    //---------------------------------------------------------------
    // Private
}

AbstractCommand.title = 'Command';
AbstractCommand._switches = new Switches(AbstractCommand, null);
AbstractCommand._args = new Args(AbstractCommand, null);

module.exports = AbstractCommand;
