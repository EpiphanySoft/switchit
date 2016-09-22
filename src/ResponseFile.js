"use strict";

const fs = require('fs');
const Path = require('path');

const commentRe = /^\s*#(.*)$/;
const crlfRe = /\r\n/g;

module.exports = {
    read (filename) {
        var fn = Path.resolve(process.cwd(), filename);
        
        var text = fs.readFileSync(fn, {
            encoding: 'utf8'
        });

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
};
