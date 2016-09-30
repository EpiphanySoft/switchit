"use strict";

const fs = require('fs');
const Path = require('path');

const commentRe = /^\s*#(.*)$/;
const crlfRe = /\r\n/g;

class ResponseFileLoader {
    constructor () {
        this.resetBasePath();
    }

    parse (text) {
        if (crlfRe.test(text)) {
            text = text.replace(crlfRe, '\n');
        }

        var lines = text.split('\n'),
            ret = [];

        for (let line of lines) {
            line = line.trim();

            // Skip lines like:
            //
            //      # Foo bar comment
            //
            let m = commentRe.exec(line);
            if (m) {
                line = m[1].trim();
                if (line[0] !== '#') {
                    continue;
                }

                // But keep lines like:
                //
                //      ##somearg
                //
                // After stripping the leading '#' (so keep '#somearg')
            }

            if (line) {
                ret.push(line);
            }
        }

        return ret;
    }

    read (filename) {
        if (this.basePath === process.cwd()) {
            this._basePath = Path.resolve(this.basePath, Path.dirname(filename));
        }

        var fn = Path.resolve(this.basePath, Path.basename(filename));
        
        var text = fs.readFileSync(fn, {
            encoding: 'utf8'
        });

        return this.parse(text);
    }

    get basePath () {
        return this._basePath;
    }

    resetBasePath () {
        this._basePath = process.cwd();
    }
}

module.exports = ResponseFileLoader;
