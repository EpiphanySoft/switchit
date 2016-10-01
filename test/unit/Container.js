'use strict';

const expect = require('expect.js');
const path = require('path');
const fs = require('fs');

const TestUtils = require('../util');
const Container = require('../../src/Container');
const Command = require('../../src/Command');
const Switches = require('../../src/Switches');
const Commands = require('../../src/Commands');
const Arguments = require('../../src/Arguments');

describe('Container', function() {
    var hook;
    beforeEach(function(){
        hook = TestUtils.captureStream(process.stdout);
    });
    afterEach(function(){
        hook.unhook();
    });

    it('should describe itself as a Container at the class and instance level', function (done) {
        class Foo extends Container {}
        expect(Foo.isContainer).to.be.ok();
        expect(new Foo().isContainer).to.be.ok();
        done();
    });

    it('should describe itself as a Cmdlet at the class and instance level', function (done) {
        class Foo extends Container {}
        expect(Foo.isCmdlet).to.be.ok();
        expect(new Foo().isCmdlet).to.be.ok();
        done();
    });

    it('should have a unique id at the instance level', function (done) {
        class Foo extends Container {}
        expect(new Foo()).to.not.equal(new Foo());
        done();
    });

    it('should initialize the switches property automatically', function (done) {
        class Foo extends Container {}
        expect(new Foo().switches).not.to.equal(null);
        expect(new Foo().switches).to.be.a(Switches);
        done();
    });

    it('should initialize the commands property automatically', function (done) {
        class Foo extends Container {}
        expect(new Foo().commands).not.to.equal(null);
        expect(new Foo().commands).to.be.a(Commands);
        done();
    });

    it('should accept commands as verbose object properties of the commands object upon definition', function (done) {
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
        done();
    });

    it('should accept commands as Class properties of the commands object upon definition', function (done) {
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
        done();
    });

    it('should accept commands as an array of Classes upon definition', function (done) {
        class Foo extends Container {}
        class Bar extends Command {}
        Foo.define({
            commands: [Bar]
        });
        let barCmd = Foo.commands.lookup('bar');
        expect(barCmd).not.to.equal(null);
        expect(barCmd.type).to.equal(Bar);
        done();
    });

    it('should throw an error if an invalid command is specified (not a subclass of Cmdlet)', function (done) {
        class Foo extends Container {}
        class Bar {
        }
        try {
            Foo.define({
                commands: {
                    bar: {
                        name: 'bar',
                        type: Bar
                    }  // Bar does not extend from Cmdlet
                }
            });
            expect.fail();
        } catch (ex) {
            done();
        }
    });

    it('should throw an error if an invalid command is specified (string syntax)', function (done) {
        class Foo extends Container {}
        try {
            Foo.define({
                commands: 'bar'
            });
            expect.fail();
        } catch (ex) {
            done();
        }
    });

    it('should allow the definition of user-defined aspects', function (done) {
        class Foo extends Container {}
        Foo.define({
            bar: true
        });
        expect(Foo.bar).to.be.ok();
        done();
    });

    it('should display main help message if no arguments are passed', function (done) {
        class Foo extends Container {}

        new Foo().run([]).then(() => {
            expect(hook.captured()).to.equal(' \n Foo\n \n Syntax:\n   foo\n');
            done();
        });
    });

    it('should allow the definition of a default command other than "help"', function (done) {
        class Foo extends Container {}
        class Bar extends Command {
            execute () {
                done();
            }
        }
        Foo.define({
            commands: {
                default: Bar
            }
        });
        new Foo().run([]);
    });

    it('should return a promise when dispatching a call', function (done) {
        class Foo extends Container {}
        new Foo().run([]).then(done);
    });

    it('should reject the promise if the command does not exist', function (done) {
        class Foo extends Container {}
        new Foo().run(['test']).then(() => expect.fail(), () => done());
    });

    it('should consider the case when the execute method of a dispatched command fails and reject the promise', function (done) {
        class Foo extends Container {}
        class Bar extends Command {
            execute () {
                throw new Errnpor('This error should be caught.');
            }
        }
        Foo.define({
            commands: [ Bar ]
        });
        new Foo().run(['bar']).then(() => expect.fail(), () => done());
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
        new Foo().run(['bar']).then(() => expect.fail(), () => done());
    });

    it('should pass its switches to the dispatched command execute call as this.parent.params', function (done) {
        class Foo extends Container {}
        class Bar extends Command {
            execute () {
                expect(this.parent.params.baz).to.equal('test');
                done();
            }
        }
        Foo.define({
            switches: 'baz',
            commands: [ Bar ]
        });
        new Foo().run(['--baz', 'test', 'bar']);
    });

    it('should not pass extra positional arguments as parameters', function (done) {
        class Foo extends Container {}
        class Bar extends Command {
            execute () {
                done();
            }
        }
        Foo.define({
            commands: [ Bar ]
        });
        new Foo().run(['bar', 'baz']);
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
        Bar.define({
            commands: [Baz, Xyz]
        });
        Abc.define({
            commands: [Def]
        });
        Foo.define({
            commands: [Bar, Abc]
        });
        new Foo().run(['bar', 'baz', 'and', 'xyz', 'then', 'abc', 'def']).then(()=>{
            expect(ret.join(' ')).to.equal('It works fine!')
            done();
        });
    });

    it('should provide subcommands a way to calculate their full name', function (done) {
        class Foo extends Container {
        }
        class Bar extends Container {
        }
        class Baz extends Command {
            execute() {
                expect(this.fullName).to.equal('Foo Bar Baz');
                done();
            }
        }
        Bar.define({
            commands: [Baz]
        });
        Foo.define({
            commands: [Bar]
        });
        new Foo().run(['bar', 'baz'])
    });

    it('should provide a way to specify its own title', function (done) {
        class Foo extends Container {
        }
        class Bar extends Command {
            execute() {
                expect(this.fullName).to.equal('somefoo Bar');
                done();
            }
        }
        Foo.define({
            title: 'somefoo',
            commands: [Bar]
        });
        new Foo().run(['bar']);
    });

    it('should provide a way to move across the execution tree', function (done) {
        class Foo extends Container {
        }
        class Bar extends Container {
        }
        class Baz extends Command {
            execute() {
                let root = this.root();
                expect(root).to.be.a(Foo);
                expect(root.down()).to.be.a(Bar);
                expect(root.down().up()).to.be.a(Foo);
                expect(root.leaf()).to.be.a(Baz);
                expect(root.leaf()).to.equal(this);
                done();
            }
        }
        Bar.define({
            commands: [Baz]
        });
        Foo.define({
            commands: [Bar]
        });
        new Foo().run(['bar', 'baz'])
    });
});
