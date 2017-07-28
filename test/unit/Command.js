'use strict';

const expect = require('expect.js');

const Command = require('../../src/Command');
const Switches = require('../../src/Switches');
const Parameters = require('../../src/Parameters');
const Arguments = require('../../src/Arguments');

const Util = require('../util');

describe('Command', function() {
    it('should describe itself as a Command at the class and instance level', function () {
        class Foo extends Command {}

        expect(Foo.isCommand).to.be.ok();
        expect(new Foo().isCommand).to.be.ok();
    });

    it('should describe itself as a Cmdlet at the class and instance level', function () {
        class Foo extends Command {}

        expect(Foo.isCmdlet).to.be.ok();
        expect(new Foo().isCmdlet).to.be.ok();
    });

    it('should have a unique id at the instance level', function () {
        class Foo extends Command {}

        expect(new Foo()).to.not.equal(new Foo());
    });

    it('should initialize the switches property automatically', function () {
        class Foo extends Command {}

        expect(new Foo().switches).not.to.equal(null);
        expect(new Foo().switches).to.be.a(Switches);
    });

    it('should initialize the parameters property automatically', function () {
        class Foo extends Command {}

        expect(new Foo().parameters).not.to.equal(null);
        expect(new Foo().parameters).to.be.a(Parameters);
    });

    it('should accept parameters as properties of the parameters object upon definition', function () {
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
    });

    it('should accept parameters as a single string', function () {
        class Foo extends Command {}

        Foo.define({
            parameters: '[bar=baz]'
        });

        let barParam = Foo.parameters.lookup('bar');

        expect(barParam).not.to.equal(null);
        expect(barParam.value).to.equal('baz');
    });

    it('should accept parameters as an array of mixed objects', function () {
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
    });

    it('should throw an exception if an alias is defined on a parameter', function (done) {
        class Foo extends Command {}
        try {
            Foo.define({
                parameters: {
                    bar: {
                        type: 'boolean'
                    },
                    baz: 'bar'
                }
            });
            expect().fail();
        } catch (ex) {
            expect(ex.message).to.equal('Can only apply aliases to commands: "baz" = "bar"');
            done();
        }
    });

    it('should allow the definition of user-defined aspects', function () {
        class Foo extends Command {}

        Foo.define({
            bar: true
        });

        expect(Foo.bar).to.be.ok();
    });

    it('should return a promise when dispatching a call', function (done) {
        class Foo extends Command {
            execute () {
                return 'xyz';
            }
        }

        Util.resolves(done, 'xyz',
            new Foo().run([]));
    });

    it('should consider the case when the execute method fails and reject the promise', function (done) {
        class Foo extends Command {
            execute () {
                throw new Error('This error should be caught.');
            }
        }

        Util.rejects(done, 'This error should be caught.',
            new Foo().run([]));
    });

    it('should reject the promise if a required switch is not present', function (done) {
        class Foo extends Command {}

        Foo.define({
            switches: 'bar'
        });

        Util.rejects(done, 'Missing value for switch: "bar"',
            new Foo().run([]));
    });

    it('should not allow switches with duplicate names', function (done) {
        class Foo extends Command {}
        try {
            Foo.define({
                switches: 'bar:string bar:number'
            });
            expect().fail();
        } catch (ex) {
            expect(ex.message).to.equal('Duplicate switch "bar"');
            done();
        }
    });

    it('should allow switches to be defined from parameters', function (done) {
        class Foo extends Command {
            execute (parameters) {
                expect(parameters.bar).to.eql(1);
                expect(parameters.baz).to.equal('abc');

                return `${parameters.baz} ${parameters.bar}`;
            }
        }

        Foo.define({
            parameters: 'baz [{bar:number}]'
        });

        Util.resolves(done, 'abc 1',
            new Foo().run('--bar=1', 'abc'));
    });

    it('should not allow switches to be defined from parameters if a switch with that name already exists', function (done) {
        class Foo extends Command {}

        try{
            Foo.define({
                switches: {
                    bar: {
                        type: 'string'
                    }
                },
                parameters: '[{bar:number}]'
            });
            expect().fail();
        } catch (ex) {
            expect(ex.message).to.equal('Parameter bar already defined as a switch');
            done();
        }
    });

    it('should reject the promise if a required parameter is not present', function (done) {
        class Foo extends Command {}

        Foo.define({
            parameters: 'bar'
        });

        Util.rejects(done, 'Missing value for parameter: "bar"',
            new Foo().run([]));
    });


    it('should pass the parameters and args as arguments to the execute call', function (done) {
        class Foo extends Command {
            execute () {
                expect(arguments.length).to.equal(2);
                expect(arguments[0]).to.be.a(Object);
                expect(arguments[1]).to.be.a(Arguments);

                return 'hello';
            }
        }

        Foo.define({
            switches: '[bar=baz]'
        });

        Util.resolves(done, 'hello',
            new Foo().run([]));
    });

    it('should pass the parameters both as args of the execute call and the this.params property', function (done) {
        class Foo extends Command {
            execute (parameters) {
                expect(parameters).to.equal(this.params);
                return parameters.bar;
            }
        }

        Foo.define({
            switches: '[bar=baz]'
        });

        Util.resolves(done, 'baz',
            new Foo().run([]));
    });

    it('should process switches as part of the dispatch call', function (done) {
        class Foo extends Command {
            execute (parameters) {
                expect(parameters.bar).to.equal('test');
                expect(this.params.bar).to.equal('test');

                return parameters.bar;
            }
        }

        Foo.define({
            switches: 'bar'
        });

        Util.resolves(done, 'test',
            new Foo().run(['--bar', 'test']));
    });

    it('should process parameters as part of the dispatch call', function (done) {
        class Foo extends Command {
            execute (parameters) {
                expect(parameters.bar).to.equal('test42');
                expect(this.params.bar).to.equal('test42');

                return parameters.bar;
            }
        }

        Foo.define({
            parameters: 'bar'
        });

        Util.resolves(done, 'test42',
            new Foo().run(['test42']));
    });

    it('should not pass extra positional arguments as parameters', function (done) {
        class Foo extends Command {
            execute (parameters) {
                expect(parameters.bar).to.equal('baz');
                expect(this.params.bar).to.equal('baz');
                expect(Object.keys(parameters).length).to.equal(this.constructor.parameters.items.length);

                return parameters.bar;
            }
        }

        Foo.define({
            parameters: 'bar'
        });

        Util.resolves(done, 'baz',
            new Foo().run(['baz', 'abc'])); // TODO should fail on "abc"
    });

    it('should reject invalid values for parameter types', function (done) {
        class Foo extends Command {}

        Foo.define({
            parameters: 'bar:number'
        });

        var foo = new Foo();

        Util.rejects(done, 'Invalid value for "bar" (expected number): "baz"',
            foo.run('baz'));
    });

    it('switch with default boolean parameter', function (done) {
        class Foo extends Command {
            execute (parameters) {
                expect(parameters.debug).to.equal(true);
                return parameters.debug;
            }
        }

        Foo.define({
            switches: {
                debug: {
                    value: false
                }
            }
        });

        Util.resolves(done, true,
            new Foo().run('--debug'));
    });

    it('switch with default boolean parameter not supplied', function (done) {
        class Foo extends Command {
            execute (parameters) {
                expect(parameters.debug).to.equal(false);
                return parameters.debug;
            }
        }

        Foo.define({
            switches: {
                debug: {
                    value: false
                }
            }
        });

        Util.resolves(done, false,
            new Foo().run([]));
    });

    it('switch with default boolean parameter supplied', function (done) {
        class Foo extends Command {
            execute (parameters) {
                expect(parameters.debug).to.equal(true);
                return parameters.debug;
            }
        }

        Foo.define({
            switches: {
                debug: {
                    value: false
                }
            }
        });

        Util.resolves(done, true,
            new Foo().run('--debug', 'true'));
    });

    it('switch does not consume the following parameter', function (done) {
        class Foo extends Command {
            execute (parameters) {
                expect(parameters.debug).to.equal(true);
                expect(parameters.foo).to.equal('foobar');

                return parameters.foo;
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

        var foo = new Foo();

        Util.resolves(done, 'foobar',
            foo.run('--debug', 'foobar'));
    });

    it('switch with default number supplied', function (done) {
        class Foo extends Command {
            execute (parameters) {
                expect(parameters.counter).to.equal(123);
                return parameters.counter;
            }
        }

        Foo.define({
            switches: '[counter:number=1]'
        });

        Util.resolves(done, 123,
            new Foo().run('--counter', '123'));
    });

    it('switch with default number supplied w/o value', function (done) {
        class Foo extends Command {
            execute (parameters) {
                expect(parameters.counter).to.equal(2);
                return parameters.counter;
            }
        }

        Foo.define({
            switches: '[counter:number=1]'
        });

        Util.resolves(done, 2,
            new Foo().run('-c'));
    });

    it('switch with default number not supplied', function (done) {
        class Foo extends Command {
            execute (parameters) {
                expect(parameters.counter).to.equal(1);
                return parameters.counter;
            }
        }

        Foo.define({
            switches: '[counter:number=1]'
        });

        Util.resolves(done, 1,
            new Foo().run([]));
    });

    describe('Program logo', () => {
        it('should show a command logo if logo is set to true', (done) => {
            class Foo extends Command {
                execute () {}
            }

            Foo.define({
                logo: true
            });

            Util.resolves(done, Util.capturesStdout(() => {
                return new Foo().run([]);
            }).then(out => {
                expect(out).to.contain('foo');
            }));
        });

        it('should accept a string as logo configuration', (done) => {
            class Foo extends Command {
                execute () {}
            }

            Foo.define({
                logo: 'Awesome'
            });

            Util.resolves(done, Util.capturesStdout(() => {
                return new Foo().run([]);
            }).then(out => {
                expect(out).to.contain('Awesome');
            }));
        });

        it('should accept an object as logo configuration', (done) => {
            class Foo extends Command {
                execute () {}
            }

            Foo.define({
                logo: {
                    name: 'Abc',
                    version: '1.2.3'
                }
            });

            Util.resolves(done, Util.capturesStdout(() => {
                return new Foo().run([]);
            }).then(out => {
                expect(out).to.contain('Abc v1.2.3');
            }));
        });

        it('should accept an object with just version as logo configuration', (done) => {
            class Foo extends Command {
                execute () {}
            }

            Foo.define({
                logo: {
                    version: '1.2.3'
                }
            });

            Util.resolves(done, Util.capturesStdout(() => {
                return new Foo().run([]);
            }).then(out => {
                expect(out).to.contain('foo v1.2.3');
            }));
        });

        it('should ignore incomplete configuration', (done) => {
            class Foo extends Command {
                execute () {}
            }

            Foo.define({
                logo: {
                    
                }
            });

            Util.resolves(done, Util.capturesStdout(() => {
                return new Foo().run([]);
            }).then(out => {
                expect(out).not.to.contain('foo');
            }));
        });

        it('should ignore invalid configuration', (done) => {
            class Foo extends Command {
                execute () {}
            }

            Foo.define({
                logo: 123
            });

            Util.resolves(done, Util.capturesStdout(() => {
                return new Foo().run([]);
            }).then(out => {
                expect(out).not.to.contain('foo');
            }));
        });
    });

    describe('Variadic', () => {
        describe('Switches', () => {
            it('should accumulate vargs switches', function (done) {
                class Foo extends Command {
                    execute (parameters) {
                        expect(parameters.bar).to.eql([3,4]);
                        expect(parameters.baz).to.equal('abc');

                        return `${parameters.baz} [${parameters.bar.join(',')}]`;
                    }
                }

                Foo.define({
                    parameters: 'baz',
                    switches: '[bar:number...]'
                });

                Util.resolves(done, 'abc [3,4]',
                    new Foo().run('--bar=3', '--bar', '4', 'abc'));
            });
        });

        describe('Parameters', () => {
            it('should accumulate all vargs parameters', function (done) {
                class Foo extends Command {
                    execute (parameters) {
                        expect(parameters.bar).to.eql([1, 2, 'abc']);

                        return `[${parameters.bar.join(',')}]`;
                    }
                }

                Foo.define({
                    parameters: 'bar...'
                });

                Util.resolves(done, '[1,2,abc]',
                    new Foo().run('1', '2', 'abc'));
            });

            it('should accumulate vargs parameters and continue', function (done) {
                class Foo extends Command {
                    execute (parameters) {
                        expect(parameters.bar).to.eql([1,2]);
                        expect(parameters.baz).to.equal('abc');

                        return `${parameters.baz} [${parameters.bar.join(',')}]`;
                    }
                }

                Foo.define({
                    parameters: '[bar:number[]] baz'
                });

                Util.resolves(done, 'abc [1,2]',
                    new Foo().run('1', '2', 'abc'));
            });

            it('should allow moving past optional vargs parameters', function (done) {
                class Foo extends Command {
                    execute (parameters) {
                        expect(parameters.bar.length).to.equal(0);
                        expect(parameters.baz).to.equal('abc');

                        return `${parameters.baz} [${parameters.bar.join(',')}]`;
                    }
                }

                Foo.define({
                    parameters: '[bar:number[]] baz'
                });

                Util.resolves(done, 'abc []',
                    new Foo().run(['abc']));
            });
        });

        describe('Switches and Parameters', () => {
            it('should accumulate vargs params and switches together', function (done) {
                class Foo extends Command {
                    execute (parameters) {
                        expect(parameters.bar).to.eql([1, 2, 3]);
                        expect(parameters.baz).to.equal('abc');

                        return `${parameters.baz} [${parameters.bar.join(',')}]`;
                    }
                }

                Foo.define({
                    parameters: 'baz [{bar:number...}]'
                });

                Util.resolves(done, 'abc [1,2,3]',
                    new Foo().run('--bar=1', '--bar', '2', 'abc', '3'));
            });
        });
    });
});
