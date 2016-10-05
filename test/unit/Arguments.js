'use strict';

const expect = require('expect.js');
const path = require('path');
const co = require('co');

const Utils = require('../util');
const Arguments = require('../../src/Arguments');

var setExpectations = function (tests = []) {
    return (function* () {
        yield* tests;
    })();
};

describe('Arguments', function() {
    it('Should process all arguments using promises', done => {
        let rawArgs = ['foo', '', 'bar', 'baz'];

        let args = new Arguments(rawArgs.slice());
        let visitedArgs = [];

        co(function* () {
            let gen = setExpectations([
                arg=>expect(arg).to.equal(rawArgs[0]),
                arg=>expect(arg).to.equal(rawArgs[2]),
                arg=>expect(arg).to.equal(rawArgs[3])
            ]);

            while (args.more()) {
                yield args.pull().then(arg => {
                    visitedArgs.push(arg);
                    (gen.next().value)(arg, args);
                });
            }
        })
        .then(() => {
            expect(visitedArgs).to.eql(['foo', 'bar', 'baz']);
            done();
        },
        e => {
            done(e);
        });
    });

    it('should allow un-pulling and re-pulling arguments', done => {
        let rawArgs = ['foo', 'bar', 'baz'];

        let args = new Arguments(rawArgs.slice());
        let visitedArgs = [];

        co(function*() {
            let gen = setExpectations([
                arg=>expect(arg).to.equal(rawArgs[0]), //foo
                arg=>expect(arg).to.equal(rawArgs[1]), //bar
                (arg, args) => {
                    expect(arg).to.equal(rawArgs[2]);  //baz
                    args.unpull(arg);
                },
                (arg, args) => {
                    expect(arg).to.equal(rawArgs[2]);  //baz
                    args.unpull(rawArgs);
                },
                arg=>expect(arg).to.equal(rawArgs[0]), //foo
                arg=>expect(arg).to.equal(rawArgs[1]), //bar
                arg=>expect(arg).to.equal(rawArgs[2])  //baz
            ]);

            while (args.more()) {
                yield args.pull().then(arg => {
                    visitedArgs.push(arg);
                    (gen.next().value)(arg, args);
                });
            }
        })
        .then(() => {
            // Added an extra 'baz,foo,bar,baz' because it was un-pulled and then re-pulled
            expect(visitedArgs).to.eql([ 'foo', 'bar', 'baz', 'baz', 'foo', 'bar', 'baz' ]);
            done();
        },
        e => {
            done(e);
        });
    });

    it('should expose meta information about its state', done => {
        let rawArgs = ['foo', 'bar', 'then', 'baz', 'and', 'abc', 'then', 'xyz'];

        let args = new Arguments(rawArgs.slice());
        let visitedArgs = [];

        co(function* () {
            let gen = setExpectations([
                //foo
                (arg, args) =>{
                    expect(arg).to.equal('foo');
                    expect(args.atEnd()).to.not.be.ok();
                },
                //bar
                (arg) => {
                    expect(arg).to.equal('bar');},
                //then
                (arg, args) => {
                    expect(arg).to.equal('then');
                    expect(args.isThen(arg)).to.be.ok();
                    expect(args.isConjunction(arg)).to.be.ok();
                },
                //baz
                (arg) => {
                    expect(arg).to.equal('baz');
                },
                //and
                (arg, args) => {
                    expect(arg).to.equal('and');
                    expect(args.isAnd(arg)).to.be.ok();
                    expect(args.isConjunction(arg)).to.be.ok();
                },
                //abc
                (arg) => {
                    expect(arg).to.equal('abc');
                },
                //then
                (arg, args) => {
                    expect(arg).to.equal('then');
                    expect(args.isAnd(arg)).to.not.be.ok();
                    expect(args.isConjunction(arg)).to.be.ok();
                },
                //xyz
                (arg, args) => {
                    expect(arg).to.equal('xyz');
                    expect(args.atEnd()).to.be.ok();
                }
            ]);

            while (args.more()) {
                yield args.pull().then(arg => {
                    visitedArgs.push(arg);
                    (gen.next().value)(arg, args);
                });
            }
        })
        .then(() => {
            done();
        },
        e => {
            done(e);
        });
    });

    it('should process and expand response files', function (done) {
        let rawArgs = [`@${path.join(Utils.getTestSourceFilesDir(), 'arguments', 'responsefile.txt')}`];

        let args = new Arguments(rawArgs.slice());
        let result = [];

        co(function* () {
            let gen = setExpectations([
                arg=>expect(arg).to.equal('somefoo'),
                arg=>expect(arg).to.equal('then'),
                arg=>expect(arg).to.equal('somebar')
            ]);

            while (args.more()) {
                yield args.pull().then(arg => {
                    result.push(arg);
                    (gen.next().value)(arg, args);
                });
            }
        })
        .then(() => {
            expect(result).to.eql(['somefoo', 'then', 'somebar']);
            done();
        },
        e => {
            done(e);
        });
    });

    it('should reject the promise if an non existing response file is specified', function (done) {
        let args = new Arguments([`@${path.join(Utils.getTestSourceFilesDir(), 'arguments', 'unexistingfile')}`]);

        args.pull().then(() => {
            expect().fail();
        },
        e => {
            expect(e.message).to.contain('ENOENT: no such file or directory');
            done();
        });
    });

    it('should normalize line endings', function (done) {
        let rawArgs = [`@${path.join(Utils.getTestSourceFilesDir(), 'arguments', 'crlf.txt')}`];

        let args = new Arguments(rawArgs.slice());
        let result = [];

        co(function* () {
            let gen = setExpectations([
                arg=>expect(arg).to.equal('foo'),
                arg=>expect(arg).to.equal('bar')
            ]);

            while (args.more()) {
                yield args.pull().then(arg => {
                    result.push(arg);
                    (gen.next().value)(arg, args);
                });
            }
        })
            .then(() => {
                    expect(result).to.eql(['foo', 'bar']);
                    done();
                },
                e => {
                    done(e);
                });
    });

    it('should allow escaping the @ symbol as @@', function (done) {
        let args = new Arguments([`@@foo`]);
        let result = [];

        co(function* () {
            let gen = setExpectations([
                arg=>expect(arg).to.equal('@foo')
            ]);

            while (args.more()) {
                yield args.pull().then(arg => {
                    result.push(arg);
                    (gen.next().value)(arg, args);
                });
            }
        })
        .then(() => {
            expect(result).to.eql(['@foo']);
            done();
        },
        e => {
            done(e);
        });
    });
});
