"use strict";

const ResponseFile = require('./ResponseFile');

const andRe = /and/i;
const thenRe = /then/i;
const andOrThenRe = /and|then/i;
const expandRe = /^@([\s\.]+)$/;

/**
 * This class manages the String[] of arguments to be dispatched by Cmdlets. It tracks
 * the current position of provides many helper methods to simplify the code processing
 * each argument.
 */
class Arguments {
    constructor (args) {
        this._args = args;
        this._index = 0;
        this._owners = [];
    }

    get length () {
        return this._args.length - this._index;
    }

    get owner () {
        var owners = this._owners,
            n = owners.length;

        return n ? owners[n - 1] : null;
    }

    get total () {
        return this._args.length;
    }

    * [Symbol.iterator] () {
        for (var i = 0; i < this.length; ++i) {
            yield this.at(i);
        }
    }

    advance (n = 1) {
        this._index = Math.max(0, Math.min(this._index + n, this._args.length));
    }

    at (offset = 0) {
        var i = this._index + offset,
            a = this._args,
            s = null;

        if (i < a.length) {
            s = this._get(i);
        }

        return s;
    }
    
    atAnd () {
        var s = this.peek();
        return andRe.test(s);
    }

    atConjunction () {
        var s = this.peek();
        return andOrThenRe.test(s);
    }
    
    atEnd () {
        return this._index === this._args.length;
    }

    atThen () {
        var s = this.peek();
        return thenRe.test(s);
    }

    more () {
        var s = this.peek();
        return s && !andOrThenRe.test(s);
    }

    mustPull (message) {
        var s = this.pull();
        if (!s) {
            throw new Error(message || 'Missing required argument');
        }
        return s;
    }

    ownerPop () {
        this._owners.pop();
    }

    ownerPush (owner) {
        this._owners.push(owner);
    }

    peek () {
        return this.at();
    }

    pull () {
        var ret = this.at();

        this.advance();

        return ret;
    }

    pullConjunction (both) {
        if (both) {
            if (!this.atConjunction()) {
                return false;
            }

            // In some cases (like template expansion of arguments) it is easy to get
            // "and and" or "then and" etc. together so we consume redundant conjunctions
            // here.
            while (this.atConjunction()) {
                this.advance();
            }
        } else {
            if (!this.atAnd()) {
                return false;
            }

            // Consume redundant "and" conjunctions...
            while (this.atAnd()) {
                this.advance();
            }

            // Make sure we don't bump into a "then" after all...
            if (this.atThen()) {
                return false;
            }
        }

        return true;
    }

    rewind () {
        this._index = 0;
    }
    
    unpull () {
        if (!this._index) {
            throw new Error('No arguments to unpull');
        }
        
        --this._index;
    }

    //---------------------------------------------------------
    // Private

    _get (index) {
        var args = this._args;
        var arg = args[index];

        if (typeof arg === 'string') {
            var m = expandRe.exec(arg);

            // handle @@foo to mean literal @foo
            if (m && (arg = m[1])[0] !== '@') {
                // We call out to allow user to hook into the processing of the
                // response file.
                let lines = this._readResponseFile(arg, index);
                this._replaceResponseFileArg(index, lines);

                arg = this._get(index);  // recurse
            }
            else {
                args[index] = [arg];
            }
        }
        else {
            arg = arg[0];
        }

        return arg;
    }

    _readResponseFile (filename) {
        return ResponseFile.read(filename);
    }

    _replaceResponseFileArg (index, lines) {
        this._args.splice(index, 1, ...lines);
    }
}

module.exports = Arguments;
