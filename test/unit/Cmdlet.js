'use strict';

const expect = require('expect.js');

const Cmdlet = require('../../src/Cmdlet');
const Switches = require('../../src/Switches');
const Arguments = require('../../src/Arguments');

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

    it('should accept switches as an array of mixed objects', function () {
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

        expect(barSwitch).not.to.equal(null);
        expect(barSwitch.value).to.equal('baz');

        let abcSwitch = Foo.switches.lookup('abc');

        expect(abcSwitch).not.to.equal(null);
        expect(abcSwitch.value).to.equal('xyz');
    });
});
