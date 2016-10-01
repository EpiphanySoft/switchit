'use strict';

const expect = require('expect.js');
const path = require('path');

const Command = require('../../src/Command');
const Switches = require('../../src/Switches');
const Parameters = require('../../src/Parameters');
const Arguments = require('../../src/Arguments');

describe('Command', function() {
    function finish (done, promise) {
        promise.then(() => done(), done);
    }

    it('should describe itself as a Command at the class and instance level', function (done) {
        class Foo extends Command {}
        expect(Foo.isCommand).to.be.ok();
        expect(new Foo().isCommand).to.be.ok();
        done();
    });

    it('should describe itself as a Cmdlet at the class and instance level', function (done) {
        class Foo extends Command {}
        expect(Foo.isCmdlet).to.be.ok();
        expect(new Foo().isCmdlet).to.be.ok();
        done();
    });

    it('should have a unique id at the instance level', function (done) {
        class Foo extends Command {}
        expect(new Foo()).to.not.equal(new Foo());
        done();
    });

    it('should initialize the switches property automatically', function (done) {
        class Foo extends Command {}
        expect(new Foo().switches).not.to.equal(null);
        expect(new Foo().switches).to.be.a(Switches);
        done();
    });

    it('should initialize the parameters property automatically', function (done) {
        class Foo extends Command {}
        expect(new Foo().parameters).not.to.equal(null);
        expect(new Foo().parameters).to.be.a(Parameters);
        done();
    });

    it('should accept parameters as properties of the parameters object upon definition', function (done) {
        class Foo extends Command {}
        Foo.define({
            parameters: {
                bar: {
                    value: 'baz'
                }
            }
        });
        let barParam = Foo.parameters.lookup('bar');
        expect(barParam).not.to.equal(null);
        expect(barParam.value).to.equal('baz');
        done();
    });

    it('should accept parameters as a single string', function (done) {
        class Foo extends Command {}
        Foo.define({
            parameters: '[bar=baz]'
        });
        let barParam = Foo.parameters.lookup('bar');
        expect(barParam).not.to.equal(null);
        expect(barParam.value).to.equal('baz');
        done();
    });

    it('should accept parameters as an array of mixed objects', function (done) {
        class Foo extends Command {}
        Foo.define({
            parameters: [
                '[bar=baz]',
                {
                    name: 'abc',
                    value: 'xyz'
                }
            ]
        });
        let barParam = Foo.parameters.lookup('bar');
        expect(barParam).not.to.equal(null);
        expect(barParam.value).to.equal('baz');

        let abcParam = Foo.parameters.lookup('abc');
        expect(abcParam).not.to.equal(null);
        expect(abcParam.value).to.equal('xyz');
        done();
    });

    it('should allow the definition of user-defined aspects', function (done) {
        class Foo extends Command {}
        Foo.define({
            bar: true
        });
        expect(Foo.bar).to.be.ok();
        done();
    });

    it('should dispatch calls to its execute method', function (done) {
        class Foo extends Command {
            execute () {
                done();
            }
        }
        new Foo().run([]);
    });

    it('should return a promise when dispatching a call', function (done) {
        class Foo extends Command {
            execute () {}
        }
        new Foo().run([]).then(done);
    });

    it('should consider the case when the execute method fails and reject the promise', function (done) {
        class Foo extends Command {
            execute () {
                throw new Error('This error should be caught.');
            }
        }
        new Foo().run([]).then(() => expect.fail(), () => done());
    });

    it('should reject the promise if a required switch is not present', function (done) {
        class Foo extends Command {}
        Foo.define({
            switches: 'bar'
        });
        new Foo().run([]).then(() => expect.fail(), () => done());
    });

    it('should reject the promise if a required parameter is not present', function (done) {
        class Foo extends Command {}
        Foo.define({
            parameters: 'bar'
        });
        new Foo().run([]).then(() => expect.fail(), () => done());
    });


    it('should pass the parameters and args as arguments to the execute call', function (done) {
        class Foo extends Command {
            execute () {
                expect(arguments.length).to.equal(2);
                expect(arguments[0]).to.be.a(Object);
                expect(arguments[1]).to.be.a(Arguments);
                done();
            }
        }
        Foo.define({
            switches: '[bar=baz]'
        });
        new Foo().run([]);
    });

    it('should pass the parameters both as args of the execute call and the this.params property', function (done) {
        class Foo extends Command {
            execute (parameters) {
                expect(parameters).to.equal(this.params);
                done();
            }
        }
        Foo.define({
            switches: '[bar=baz]'
        });
        new Foo().run([]);
    });

    it('should process switches as part of the dispatch call', function (done) {
        class Foo extends Command {
            execute (parameters) {
                expect(parameters.bar).to.equal('test');
                expect(this.params.bar).to.equal('test');
                done();
            }
        }
        Foo.define({
            switches: 'bar'
        });
        new Foo().run(['--bar', 'test']);
    });

    it('should process parameters as part of the dispatch call', function (done) {
        class Foo extends Command {
            execute (parameters) {
                expect(parameters.bar).to.equal('test');
                expect(this.params.bar).to.equal('test');
                done();
            }
        }
        Foo.define({
            parameters: 'bar'
        });
        new Foo().run(['test']);
    });

    it('should not pass extra positional arguments as parameters', function (done) {
        class Foo extends Command {
            execute (parameters) {
                expect(parameters.bar).to.equal('baz');
                expect(this.params.bar).to.equal('baz');
                expect(Object.keys(parameters).length).to.equal(this.constructor.parameters.items.length);
                done();
            }
        }
        Foo.define({
            parameters: 'bar'
        });
        new Foo().run(['baz', 'abc']);
    });

    it('should reject invalid values for parameter types', function (done) {
        class Foo extends Command {}
        Foo.define({
            parameters: 'bar:number'
        });
        new Foo().run(['baz']).then(() => expect.fail(), () => done());
    });

    it('should accumulate vargs switches', function (done) {
        class Foo extends Command {
            execute (parameters) {
                expect(parameters.bar).to.equal([1,2]);
                expect(parameters.baz).to.equal('abc');
                console.log('foo');
            }
        }

        Foo.define({
            parameters: 'baz',
            switches: [{
                name: 'bar',
                type: 'number',
                vargs: true
            }]
        });

        new Foo().run('--bar=1', '--bar', '2', 'abc').then(done, done);
    });

    it('should accumulate vargs parameters', function (done) {
        class Foo extends Command {
            execute (parameters) {
                expect(parameters.bar).to.equal([1,2]);
                expect(parameters.baz).to.equal('abc');
                console.log('foo');
            }
        }

        Foo.define({
            parameters: '[bar:number[]] baz'
        });

        new Foo().run('1', '2', 'abc').then(done, done);
    });

    it('should allow moving past optional vargs parameters', function (done) {
        class Foo extends Command {
            execute (parameters) {
                expect(parameters.bar.length).to.equal(0);
                expect(parameters.baz).to.equal('abc');
            }
        }
        Foo.define({
            parameters: '[bar:number[]] baz'
        });
        new Foo().run(['abc']).then(done, done);
    });

    it('switch with default boolean parameter', function (done) {
        class Foo extends Command {
            execute (parameters) {
                expect(parameters.debug).to.equal(true);
                done();
            }
        }
        Foo.define({
            switches: {
                debug: {
                    value: false
                }
            }
        });
        new Foo().run('--debug');
    });

    it('switch with default boolean parameter not supplied', function (done) {
        class Foo extends Command {
            execute (parameters) {
                expect(parameters.debug).to.equal(false);
                done();
            }
        }
        Foo.define({
            switches: {
                debug: {
                    value: false
                }
            }
        });
        new Foo().run([]);
    });

    it('switch with default boolean parameter supplied', function (done) {
        class Foo extends Command {
            execute (parameters) {
                expect(parameters.debug).to.equal(true);
                done();
            }
        }
        Foo.define({
            switches: {
                debug: {
                    value: false
                }
            }
        });
        new Foo().run('--debug', 'true');
    });

    it('switch does not consume the following parameter', function (done) {
        class Foo extends Command {
            execute (parameters) {
                expect(parameters.debug).to.equal(true);
                expect(parameters.foo).to.equal('foo');
                done();
            }
        }
        Foo.define({
            parameters: 'foo',
            switches: {
                debug: {
                    value: false
                }
            }
        });
        new Foo().run('--debug', 'foo');
    });

});
