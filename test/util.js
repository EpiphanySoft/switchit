"use strict";

const fs = require('fs-extra');
const path = require('path');

const randomstring = require("randomstring");

const stripAnsi = require('strip-ansi');

class TestUtils {
    static captureStream (stream){
        var oldWrite = stream.write;
        var buf = '';
        stream.write = function(chunk, encoding, callback){
            buf += chunk.toString();
            //oldWrite.apply(stream, arguments); // Uncomment to log to the console as well as capture to the buffer
        };

        return {
            unhook: function unhook(){
                stream.write = oldWrite;
            },
            captured: function(){
                return stripAnsi(buf);
            }
        };
    }

    static getModuleRoot () {
        return path.resolve(path.join(__dirname, ".."));
    }

    static getTestSourceFilesDir () {
        return path.join(TestUtils.getModuleRoot(), 'test-files');
    }

    static getTestTmpDir () {
        return path.join(TestUtils.getModuleRoot(), "test-temp");
    }

    static getTmpDir (dirname) {
        return path.join(TestUtils.getTestTmpDir(), (dirname || randomstring.generate(5)));
    }

    static wrapBefore(before, tmpDir) {
        before(function (next) {
            TestUtils.beforeTests(tmpDir);
            next();
        });
    }

    static beforeTests(tmpDir) {
        if (fs.existsSync(TestUtils.getTestTmpDir())) {
            if (fs.existsSync(tmpDir)) {
                fs.removeSync(tmpDir);
            }
            fs.mkdirSync(tmpDir);
        } else {
            fs.mkdirSync(TestUtils.getTestTmpDir());
            fs.mkdirSync(tmpDir);
        }
    }

    static wrapAfter(after, tmpDir) {
        after(function (next) {
            TestUtils.afterTests(tmpDir);
            next();
        })
    }

    static afterTests(tmpDir) {
        if (fs.existsSync(TestUtils.getTestTmpDir())) {
            if (fs.existsSync(tmpDir)) {
                fs.removeSync(tmpDir);
            }
        }
    }

}

module.exports = TestUtils;
