"use strict";

const expect = require('expect.js');
const fs = require('fs-extra');
const path = require('path');

const randomstring = require("randomstring");

const stripAnsi = require('strip-ansi');

class Util {
    static captureStream (stream) {
        if (Util.stdoutHook) {
            Util.stdoutHook.unhook();
            Util.stdoutHook = null;
        }

        //console.log('>>> Hooking stdout');
        var oldWrite = stream.write;
        var buf = '';
        stream.write = function(chunk, encoding, callback){
            buf += chunk.toString();
            //oldWrite.apply(stream, arguments); // Uncomment to log to the console as well as capture to the buffer
        };

        return Util.stdoutHook = {
            unhook: function unhook(){
                stream.write = oldWrite;
                //console.log('>>> Unhooking stdout');
            },
            captured: function(){
                return stripAnsi(buf);
            }
        };
    }

    static capturesStdout (fn) {
        Util.captureStream(process.stdout);

        var promise = new Promise(function (resolve, reject) {
            try {
                resolve(fn());
            }
            catch (e) {
                reject(e);
            }
        });

        return promise.then(() => {
            return Util.endCapture();
        },
        e => {
            Util.endCapture();
            throw e;
        });
    }

    static endCapture () {
        var hook = Util.stdoutHook;
        var output;
        
        if (hook) {
            output = hook.captured() || '';
            hook.unhook();
            Util.stdoutHook = null;
        }

        return output;
    }

    static getModuleRoot () {
        return path.resolve(path.join(__dirname, ".."));
    }

    static getTestSourceFilesDir () {
        return path.join(Util.getModuleRoot(), 'test-files');
    }

    static getTestTmpDir () {
        return path.join(Util.getModuleRoot(), "test-temp");
    }

    static getTmpDir (dirname) {
        return path.join(Util.getTestTmpDir(), (dirname || randomstring.generate(5)));
    }

    static wrapBefore(before, tmpDir) {
        before(function (next) {
            Util.beforeTests(tmpDir);
            next();
        });
    }

    static beforeTests(tmpDir) {
        if (fs.existsSync(Util.getTestTmpDir())) {
            if (fs.existsSync(tmpDir)) {
                fs.removeSync(tmpDir);
            }
            fs.mkdirSync(tmpDir);
        } else {
            fs.mkdirSync(Util.getTestTmpDir());
            fs.mkdirSync(tmpDir);
        }
    }

    static wrapAfter(after, tmpDir) {
        after(function (next) {
            Util.afterTests(tmpDir);
            next();
        })
    }

    static afterTests(tmpDir) {
        if (fs.existsSync(Util.getTestTmpDir())) {
            if (fs.existsSync(tmpDir)) {
                fs.removeSync(tmpDir);
            }
        }
    }

    static resolves (done, result, promise) {
        if (!promise) {
            promise = result;
            result = undefined;
        }

        return promise.then(v => {
            try {
                if (result !== undefined) {
                    if (typeof result === 'function') {
                        result(v);
                    } else {
                        expect(v).to.be(result);
                    }
                }
                done();
            } catch (e) {
                done(e);
            }
        },
        e => done(e || 'Promise should have resolved'));
    }

    static rejects (done, message, promise) {
        if (!promise) {
            promise = message;
            message = undefined;
        }

        return promise.then(() => done('Promise should have rejected'),
            e => {
                try {
                    if (message !== undefined) {
                        let v = e.message || e;

                        if (typeof message === 'function') {
                            message(v);
                        } else {
                            expect(v).to.contain(message);
                        }
                    }

                    done();
                } catch (e) {
                    done(e);
                }
            });
    }
}

module.exports = Util;
