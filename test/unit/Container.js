'use strict';

const expect = require('expect.js');

const Container = require('../../src/Container');
const Command = require('../../src/Command');
const Switches = require('../../src/Switches');
const Commands = require('../../src/Commands');
const Arguments = require('../../src/Arguments');

const Util = require('../util');

describe('Container', function() {
    it('should describe itself as a Container at the class and instance level', function () {
        class Foo extends Container {}

        expect(Foo.isContainer).to.be.ok();
        expect(new Foo().isContainer).to.be.ok();
    });

    it('should describe itself as a Cmdlet at the class and instance level', function () {
        class Foo extends Container {}

        expect(Foo.isCmdlet).to.be.ok();
        expect(new Foo().isCmdlet).to.be.ok();
    });

    it('should have a unique id at the instance level', function () {
        class Foo extends Container {}

        expect(new Foo()).to.not.equal(new Foo());
    });

    it('should initialize the switches property automatically', function () {
        class Foo extends Container {}

        expect(new Foo().switches).not.to.equal(null);
        expect(new Foo().switches).to.be.a(Switches);
    });

    it('should initialize the commands property automatically', function () {
        class Foo extends Container {}

        expect(new Foo().commands).not.to.equal(null);
        expect(new Foo().commands).to.be.a(Commands);
    });

    it('should accept commands as verbose object properties of the commands object upon definition', function () {
        class Foo extends Container {}
        class Bar extends Command {}

        Foo.define({
            commands: {
                bar: {
                    type: Bar
                }
            }
        });

        let barCmd = Foo.commands.lookup('bar');

        expect(barCmd).not.to.equal(null);
        expect(barCmd.type).to.equal(Bar);
    });

    it('should accept commands as Class properties of the commands object upon definition', function () {
        class Foo extends Container {}
        class Bar extends Command {}

        Foo.define({
            commands: {
                bar: Bar
            }
        });

        let barCmd = Foo.commands.lookup('bar');

        expect(barCmd).not.to.equal(null);
        expect(barCmd.type).to.equal(Bar);
    });

    it('should accept commands as an array of Classes upon definition', function () {
        class Foo extends Container {}
        class Bar extends Command {}

        Foo.define({
            commands: [Bar]
        });

        let barCmd = Foo.commands.lookup('bar');

        expect(barCmd).not.to.equal(null);
        expect(barCmd.type).to.equal(Bar);
    });

    it('should throw an error if an invalid command is specified (not a subclass of Cmdlet)', function () {
        class Foo extends Container {}
        class Bar {}

        try {
            Foo.define({
                commands: {
                    bar: {
                        name: 'bar',
                        type: Bar
                    }  // Bar does not extend from Cmdlet
                }
            });
            expect().fail();
        } catch (ex) {
            // good!
        }
    });

    it('should throw an error if an invalid command is specified (string syntax)', function () {
        class Foo extends Container {}

        try {
            Foo.define({
                commands: 'bar'
            });

            expect().fail();
        } catch (ex) {
            // good
        }
    });

    it('should allow the definition of user-defined aspects', function () {
        class Foo extends Container {}

        Foo.define({
            bar: true
        });

        expect(Foo.bar).to.be.ok();
    });

    it('should allow commands to have a custom aliases', function (done) {
        class Foo extends Container {}
        class Bar extends Command {
            execute() {
                return 123;
            }
        }

        Foo.define({
            commands: {
                bar: Bar,
                baz: 'bar'
            }
        });

        Util.resolves(done, 123, new Foo().run(['baz']));
    });

    it('should allow using shortest unique prefixes for command execution', function (done) {
        class Foo extends Container {}
        class Bar extends Command {
            execute() {
                return 123;
            }
        }

        Foo.define({
            commands: {
                bar: Bar,
                xyz: 'bar'
            }
        });

        Util.resolves(done, 123, new Foo().run(['b']));
    });

    it('should reject the promise if ambiguous prefixes are used for command invocation', function (done) {
        class Foo extends Container {}
        class Bar extends Command {
            execute() {
                return 123;
            }
        }

        Foo.define({
            commands: {
                bar: Bar,
                baz: Bar
            }
        });

        Util.rejects(done, '"b" matches multiple commands for Foo: bar, baz', new Foo().run(['b']));
    });

    it('should throw when an invalid command is defined', function (done) {
        class Foo extends Container {}
        class Bar extends Command {
            execute() {
                return 123;
            }
        }

        try {
            Foo.define({
                commands: {
                    bar: Bar,
                    baz: 'abc'
                }
            });
            expect().fail();
        } catch (ex) {
            expect(ex.message).to.equal('No such command "abc" for alias "baz"');
            done();
        }
    });

    it('should allow the definition of a custom default command', function (done) {
        class Foo extends Container {}
        class Bar extends Command {
            execute () {
                return 123;
            }
        }

        Foo.define({
            commands: {
                '': Bar
            }
        });

        Util.resolves(done, 123,
            new Foo().run([]));
    });

    it('should reject the promise if the command does not exist', function (done) {
        class Foo extends Container {}
        Foo.define({
            title: 'foo'
        });

        Util.rejects(done, 'No such command or category "foo bar"',
            new Foo().run(['bar']));
    });

    it('should consider the case when the execute method of a dispatched command fails and reject the promise', function (done) {
        class Foo extends Container {}
        class Bar extends Command {
            execute () {
                throw new Error('This error should be caught.');
            }
        }

        Foo.define({
            commands: [ Bar ]
        });

        Util.rejects(done, 'This error should be caught.',
            new Foo().run(['bar']));
    });

    it('should reject the promise if a required switch is not present', function (done) {
        class Foo extends Container {}
        class Bar extends Command {
            execute () { }
        }

        Foo.define({
            switches: 'baz',
            commands: [ Bar ]
        });

        Util.rejects(done, 'Missing required switch "baz"',
            new Foo().run(['bar']));
    });

    it('should pass its switches to the dispatched command execute call as this.parent.params', function (done) {
        class Foo extends Container {}
        class Bar extends Command {
            execute () {
                expect(this.parent.params.baz).to.equal('test');
                return 42;
            }
        }

        Foo.define({
            switches: 'baz',
            commands: [ Bar ]
        });

        var foo = new Foo();

        Util.resolves(done, 42,
            foo.run('--baz', 'test', 'bar'));
    });

    it('should do implicit command chaining at root and skip non-parsable parameters', function (done) {
        class Foo extends Container {}
        class Bar extends Command {
            execute (params) {
                this.up().x = params.x;
                return 427;
            }
        }
        class Baz extends Command {
            execute () {
                return 123 + this.up().x;
            }
        }

        Foo.define({
            commands: [
                Bar,
                Baz
            ]
        });
        Bar.define({
            parameters: '[x:number=321]'
        });

        Util.resolves(done, 123+321,
            new Foo().run('bar', 'baz'));
    });

    it('should not allow implicit command chaining at non-root', function (done) {
        class Foo extends Container {}
        class Bar extends Container {}
        class Baz extends Command {
            execute () {}
        }
        class Xyz extends Command {
            execute () {}
        }

        Bar.define({
            commands: [Baz, Xyz]
        });

        Foo.define({
            commands: [Bar]
        });

        new Foo().run(['bar', 'baz', 'then','bar', 'baz','xyz']).then(() => {
            expect().fail();
        }, (e) => {
            expect(e.message).to.equal('Invalid command "xyz" following "Foo Bar"');
            done();
        });
    });

    it('should respect the and/then notion of command chaining', function (done) {
        let ret = [];
        class Foo extends Container {}
        class Bar extends Container {}
        class Baz extends Command {
            execute () {
                ret.push('It');
            }
        }
        class Xyz extends Command {
            execute () {
                ret.push('works');
            }
        }
        class Abc extends Container {}
        class Def extends Command {
            execute () {
                ret.push('fine!');
            }
        }

        Foo.define({
            commands: [Abc, Bar]
        });
        Abc.define({
            commands: [Def]
        });
        Bar.define({
            commands: [Baz, Xyz]
        });

        var foo = new Foo();

        Util.resolves(done, () => {
                expect(ret.join(' ')).to.equal('It works fine!');
            },
            foo.run('bar', 'baz', 'and', 'xyz', 'then', 'abc', 'def'));
    });

    it('should provide subcommands a way to calculate their full name', function (done) {
        class Foo extends Container {
        }
        class Bar extends Container {
        }
        class Baz extends Command {
            execute() {
                return this.fullName;
            }
        }

        Bar.define({
            commands: [Baz]
        });
        Foo.define({
            commands: [Bar]
        });

        Util.resolves(done, 'Foo Bar Baz',
            new Foo().run(['bar', 'baz']));
    });

    it('should provide a way to specify its own title', function (done) {
        class Foo extends Container {
        }
        class Bar extends Command {
            execute() {
                return this.fullName;
            }
        }

        Foo.define({
            title: 'somefoo',
            commands: [Bar]
        });

        Util.resolves(done, 'somefoo Bar',
            new Foo().run(['bar']));
    });

    it('should provide a way to move across the execution tree', function (done) {
        class Foo extends Container {}
        class Bar extends Container {}
        class Baz extends Container {}
        class Abc extends Command {
            execute () {
                let root = this.root();

                expect(this.up().down()).to.be(this);

                expect(root).to.be.a(Foo);
                expect(root.down()).to.be.a(Bar);
                expect(root.down().up()).to.be.a(Foo);
                expect(root.leaf()).to.be.a(Abc);
                expect(root.down('baz')).to.be.a(Baz);
                expect(root.leaf()).to.be(this);
                expect(this.up('bar')).to.be.a(Bar);

                return this.up().name;
            }
        }

        Baz.define({
            commands: {
                Abc: Abc
            }
        });

        Bar.define({
            commands: [{
                name: 'baz',
                type: Baz
            }]
        });
        Foo.define({
            commands: {
                bar: Bar
            }
        });

        Util.resolves(done, 'baz',
            new Foo().run(['bar', 'baz', 'abc']));
    });

    describe('Help', function () {
        it('should display main help message if no arguments are passed', function (done) {
            class Foo extends Container {
            }

            var foo = new Foo();

            Util.resolves(done, Util.capturesStdout(() => {
                return foo.run([]);
            }).then(out => {
                expect(out).to.equal(' \n Foo\n \n Syntax:\n   foo\n');
            }));
        });
    });
});
