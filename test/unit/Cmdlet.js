'use strict';
const expect = require('chai').expect;
const path = require('path');

const Cmdlet = require('../../src/Cmdlet');
const Switches = require('../../src/Switches');
const Arguments = require('../../src/Arguments');

describe('Cmdlet', function() {
    it('should describe itself as a Cmdlet at the class and instance level', function (done) {
        class Foo extends Cmdlet {}
        expect(Foo.isCmdlet).to.be.true;
        expect(new Foo().isCmdlet).to.be.true;
        done();
    });

    it('should have a unique id at the instance level', function (done) {
        class Foo extends Cmdlet {}
        expect(new Foo()).to.not.equal(new Foo());
        done();
    });

    it('should initialize the switches property automatically', function (done) {
        class Foo extends Cmdlet {}
        expect(new Foo().switches).to.not.be.null;
        expect(new Foo().switches).to.be.an.instanceof(Switches);
        done();
    });

    it('should allow the definition of user-defined aspects', function (done) {
        class Foo extends Cmdlet {}
        Foo.define({
            bar: true
        });
        expect(Foo.bar).to.be.true;
        done();
    });

    it('should accept switches as properties of the switches object upon definition', function (done) {
        class Foo extends Cmdlet {}
        Foo.define({
            switches: {
                bar: {
                    value: 'baz'
                }
            }
        });
        let barSwitch = Foo.switches.lookup('bar');
        expect(barSwitch).to.not.be.null;
        expect(barSwitch.value).to.equal('baz');
        done();
    });

    it('should accept switches as a single string', function (done) {
        class Foo extends Cmdlet {
            //
        }
        debugger;
        Foo.define({
            switches: '[bar=baz]'
        });

        let barSwitch = Foo.switches.lookup('bar');
        expect(barSwitch).to.not.be.null;
        expect(barSwitch.value).to.equal('baz');
        done();
    });

    it('should accept switches as an array of mixed objects', function (done) {
        class Foo extends Cmdlet {}
        Foo.define({
            switches: [
                '[bar=baz]',
                {
                    name: 'abc',
                    value: 'xyz'
                }
            ]
        });
        let barSwitch = Foo.switches.lookup('bar');
        expect(barSwitch).to.not.be.null;
        expect(barSwitch.value).to.equal('baz');

        let abcSwitch = Foo.switches.lookup('abc');
        expect(abcSwitch).to.not.be.null;
        expect(abcSwitch.value).to.equal('xyz');
        done();
    });

});
