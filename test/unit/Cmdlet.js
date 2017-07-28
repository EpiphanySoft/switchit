'use strict';

const expect = require('expect.js');

const Cmdlet = require('../../src/Cmdlet');
const Switches = require('../../src/Switches');
const Arguments = require('../../src/Arguments');
const Type = require('../../src/Type');
const co = require('co');

const Util = require('../util');

describe('Cmdlet', function() {
    it('should describe itself as a Cmdlet at the class and instance level', function () {
        class Foo extends Cmdlet {}

        expect(Foo.isCmdlet).to.be.ok();
        expect(new Foo().isCmdlet).to.be.ok();
    });

    it('should have a unique id at the instance level', function () {
        class Foo extends Cmdlet {}

        expect(new Foo()).to.not.equal(new Foo());
    });

    it('should initialize the switches property automatically', function () {
        class Foo extends Cmdlet {}

        expect(new Foo().switches).not.to.equal(null);
        expect(new Foo().switches).to.be.a(Switches);
    });

    it('should allow the definition of user-defined aspects', function () {
        class Foo extends Cmdlet {}

        Foo.define({
            bar: true
        });

        expect(Foo.bar).to.be.ok();
    });

    it('should accept switches as properties of the switches object upon definition', function () {
        class Foo extends Cmdlet {}

        Foo.define({
            switches: {
                bar: {
                    value: 'baz'
                }
            }
        });

        let barSwitch = Foo.switches.lookup('bar');

        expect(barSwitch).not.to.equal(null);
        expect(barSwitch.value).to.equal('baz');
    });

    it('should throw an error if a switch uses a non-existing type', function (done) {
        class Foo extends Cmdlet {
        }

        try {
            Foo.define({
                switches: 'bar:baz'
            });
            expect().fail()
        } catch (ex) {
            expect(ex.message).to.equal('Unknown value type "baz" (use Type.define to define it)');
            done();
        }
    });

    it('should throw an error if a switch specifies a default value of a non-existing type', function (done) {
        class Foo extends Cmdlet {
        }
        try {
            Foo.define({
                switches: {
                      bar: {
                        value: null
                    }
                }
            });
          expect().fail()
        } catch (ex) {
            expect(ex.message).to.equal('No type for "null" (use Type.define to define it)');
            done();
        }
    });

    it('should throw an error if a switch specifies an invalid default value', function (done) {
        class Foo extends Cmdlet {
        }
        try {
            Foo.define({
                switches: {
                    bar: {
                        type: 'number',
                        value: 'foo'
                    }
                }
            });
            expect().fail()
        } catch (ex) {
            expect(ex.message).to.equal('Invalid number value: "foo"');
            done();
        }
    });

    it('should accept switches with only their value as configuration', function () {
        class Foo extends Cmdlet {}

        Foo.define({
            switches: {
                bar: 3
            }
        });

        let barSwitch = Foo.switches.lookup('bar');

        expect(barSwitch).not.to.equal(null);
        expect(barSwitch.value).to.equal(3);
    });

    it('should convert all elements on a the default value of a variadic switch' , function () {
        class Foo extends Cmdlet {}

        Foo.define({
            switches: {
                bar: {
                    vargs: true,
                    value: ['1', 2, '3'],
                    type: 'number'
                }
            }
        });

        let barSwitch = Foo.switches.lookup('bar');

        expect(barSwitch).to.be.ok();
        expect(barSwitch.value.map((v) => typeof v)).to.eql(['number', 'number', 'number']);
    });

    it('should accept and convert a single value as default for a variadic switch' , function () {
        class Foo extends Cmdlet {}

        Foo.define({
            switches: {
                bar: {
                    vargs: true,
                    value: '1',
                    type: 'number'
                }
            }
        });

        let barSwitch = Foo.switches.lookup('bar');

        expect(barSwitch).to.be.ok();
        expect(barSwitch.value).to.eql([1]);
    });

    it('should accept switches as a single string', function () {
        class Foo extends Cmdlet {
            //
        }

        Foo.define({
            switches: '[bar=baz]'
        });

        let barSwitch = Foo.switches.lookup('bar');

        expect(barSwitch).not.to.equal(null);
        expect(barSwitch.value).to.equal('baz');
    });

    it('should throw an error if an invalid string was specified as switches configuration', function (done) {
        class Foo extends Cmdlet {
        }
        
        try {
            Foo.define({
                switches: '[bar=baz'
            });
            expect().fail()
        } catch (ex) {
            expect(ex.message).to.equal('Invalid switch definition syntax: "[bar=baz"');
            done();
        }
    });

    it('should accept switches as an array of mixed objects', function () {
        class Foo extends Cmdlet {}

        Foo.define({
            switches: [
                '[bar=baz]',
                {
                    name: 'abc',
                    value: 'xyz',
                    required: true
                }
            ]
        });

        let barSwitch = Foo.switches.lookup('bar');

        expect(barSwitch).not.to.equal(null);
        expect(barSwitch.value).to.equal('baz');

        let abcSwitch = Foo.switches.lookup('abc');

        expect(abcSwitch).not.to.equal(null);
        expect(abcSwitch.value).to.equal('xyz');
    });

    it('should throw an exception if an alias is defined on a switch', function (done) {
        class Foo extends Cmdlet {}
        try {
            Foo.define({
                switches: {
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

    it('should allow single-character property definition for switches (object syntax)', function (done) {
        class Foo extends Cmdlet {}
        Foo.define({
            switches: {
                bar: {
                    type: 'number',
                    char: 'x'
                }
            }
        });
        let foo = new Foo();
        foo.configure(new Arguments(['-x', '3'])).then(()=>{
            expect(foo.params.bar).to.equal(3);
        }).then(() => {
            done();
        }, (e) => {
            done(e);
        });
    });

    it('should allow single-character property definition for switches (string syntax)', function (done) {
        class Foo extends Cmdlet {}
        Foo.define({
            switches:'y#bar:number'
        });
        let foo = new Foo();
        foo.configure(new Arguments(['-y', '3'])).then(()=>{
            expect(foo.params.bar).to.equal(3);
        }).then(() => {
            done();
        }, (e) => {
            done(e);
        });
    });

    it('should throw an exception on duplicate char property', function (done) {
        class Foo extends Cmdlet {}
        try {
            Foo.define({
                switches: 'y#bar:number y#baz:string'
            });
            expect().fail();
        } catch (ex) {
            expect(ex.message).to.equal('Duplicate switch character "y"');
            done();
        }
    });

    it('should parse switches using promises', function (done) {
        class Foo extends Cmdlet {}

        Foo.define({
            switches: '[bar:number=3] [xyz:boolean=false] [abc:boolean=true]'
        });

        co(function* () {
            let foo = new Foo();
            yield foo.configure(new Arguments(['--bar', '3'])).then(() => {
                expect(foo.params.bar).to.be.ok();
                expect(foo.params.bar).to.equal(3);
            });
            foo.destroy();
            foo = new Foo();
            yield foo.configure(new Arguments(['--bar=5'])).then(() => {
                expect(foo.params.bar).to.be.ok();
                expect(foo.params.bar).to.equal(5);
            });
            foo.destroy();
            foo = new Foo();
            yield foo.configure(new Arguments(['-b', '7'])).then(() => {
                expect(foo.params.bar).to.be.ok();
                expect(foo.params.bar).to.equal(7);
            });
            foo.destroy();
            foo = new Foo();
            yield foo.configure(new Arguments(['+x', '+xy'])).then(() => {
                expect(foo.params.xyz).to.be.ok();
            });
            foo.destroy();
            foo = new Foo();
            yield foo.configure(new Arguments(['-a'])).then(() => {
                expect(foo.params.xyz).to.not.be.ok();
            });
        }).then(() => {
            done();
        }, (e) => {
            done(e);
        });
    });

    it('should reject the configuration promise on missing values', function (done) {
        class Foo extends Cmdlet {}

        Foo.define({
            switches: 'bar:number'
        });

        new Foo().run(new Arguments(['--bar'])).then(() => {
            expect().fail();
        }, (e) => {
            expect(e.message).to.equal('Missing value for switch: "bar"');
            done();
        });
    });

    it('should reject the configuration promise on invalid values', function (done) {
        class Foo extends Cmdlet {}

        Foo.define({
            switches: 'bar:number'
        });

        new Foo().run(new Arguments(['--bar', 'a'])).then(() => {
            expect().fail();
        }, (e) => {
            expect(e.message).to.equal('Missing value for switch: "bar"');
            done();
        });
    });    
});
