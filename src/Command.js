"use strict";

const Cmdlet = require('./Cmdlet');
const Parameters = require('./Parameters');

class Command extends Cmdlet {
    static defineAspect (name, value) {
        if (name === 'parameters') {
            var items = this.parameters;
            items.addAll(value);
        }
        else {
            super.defineAspect(name, value);
        }
    }

    static get parameters () {
        return Parameters.get(this);
    }

    //-----------------------------------------------------------

    constructor () {
        super();

        // The next positional parameter to accept
        this._paramPos = 0;
    }

    get parameters () {
        return this.constructor.parameters;
    }

    configure (args) {
        super.configure(args);

        this.parameters.setDefaults(this.params);
    }

    dispatch (args) {
        var me = this;

        me.configure(args);

        me.validate(this.params);

        return Promise.resolve(me.execute(me.params, args)).then(r => {
            args.ownerPop(me);
            return r;
        },
        e => {
            args.ownerPop(me);
            throw e;
        });
    }

    processArg (args, arg) {
        if (super.processArg(args, arg)) {
            return true;
        }

        return this.processParam(args, arg);
    }

    processParam (args, arg) {
        let pos = this._paramPos;
        let parameters = this.parameters.items;

        if (pos >= parameters.length) {
            return false;
        }

        let param = parameters[pos];
        let value = param.convert(arg);

        if (value === null) {
            // Cannot accept this value for this parameter
            if (param.required) {
                this.raise(`Invalid ${param.type} value for ${param.name}: "${arg}"`);
            }

            // Since this param is optional, skip to the next candidate and
            // try it (this is the only way to advance past a vargs param):
            ++this._paramPos;
            return this.processParam(args, arg);
        }

        param.set(this.params, value);

        if (!param.vargs) {
            ++this._paramPos;
        }

        // if the param is a vargs, keep accepting valid values for it...
        return true;
    }

    validate (params) {
        super.validate(params);

        var err = this.parameters.validate(params || this.params);

        if (err) {
            this.raise(err);
        }
    }

    //---------------------------------------------------------------
    // Private
}

Object.assign(Command, {
    isCommand: true,

    _parameters: new Parameters(Command)
});

Object.assign(Command.prototype, {
    isCommand: true
});

module.exports = Command;
