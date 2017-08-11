'use strict';

const expect = require('expect.js');

const Type = require('../../src/Type');

describe('Type', () => {
    describe('Boolean', () => {
        it('should handle null', () => {
            expect(Type.boolean.convert(null)).to.be(null);
        });

        it('should handle undefined', () => {
            expect(Type.boolean.convert(undefined)).to.be(null);
        });

        it('should handle empty string', () => {
            expect(Type.boolean.convert('')).to.be(null);
        });

        it('should handle letters', () => {
            expect(Type.boolean.convert('abc')).to.be(null);
        });

        it('should handle letters and numbers', () => {
            expect(Type.boolean.convert('1a')).to.be(null);
        });

        it('should handle non-zero numbers', () => {
            expect(Type.boolean.convert(1)).to.be(null);
            expect(Type.boolean.convert(42)).to.be(null);
        });

        it('should handle zero', () => {
            expect(Type.boolean.convert(0)).to.be(null);
        });

        describe('Well known values', () => {
            const values = [
                [ 'true',  true ],
                [ 'on',    true ],
                [ 'yes',   true ],

                [ 'false', false ],
                [ 'off',   false ],
                [ 'no',    false ]
            ];

            values.forEach(pair => {
                const lower = pair[0];
                const upper = lower.toUpperCase();
                const capit = upper[0] + lower.substr(1);
                const value = pair[1];

                it(`should include "${lower}"`, () => {
                    let v = Type.boolean.convert(lower);
                    expect(v).to.be(value);
                });

                it(`should include "${upper}"`, () => {
                    let v = Type.boolean.convert(upper);
                    expect(v).to.be(value);
                });

                it(`should include "${capit}"`, () => {
                    let v = Type.boolean.convert(capit);
                    expect(v).to.be(value);
                });
            });
        });
    });

    describe('Number', () => {
        it('should handle null', () => {
            expect(Type.number.convert(null)).to.be(null);
        });

        it('should handle undefined', () => {
            expect(Type.number.convert(undefined)).to.be(null);
        });

        it('should handle empty string', () => {
            expect(Type.number.convert('')).to.be(null);
        });

        it('should handle strings of spaces', () => {
            // Since +'  ' === 0
            expect(Type.number.convert('   ')).to.be(null);
        });

        it('should handle letters', () => {
            expect(Type.number.convert('abc')).to.be(null);
        });

        it('should handle letters and numbers', () => {
            expect(Type.number.convert('1a')).to.be(null);
        });

        it('should handle non-zero numbers', () => {
            expect(Type.number.convert(1)).to.be(1);
            expect(Type.number.convert(3.14)).to.be(3.14);
        });

        it('should handle non-zero strings of numbers', () => {
            expect(Type.number.convert('1')).to.be(1);
            expect(Type.number.convert('3.14')).to.be(3.14);
        });

        it('should handle numbers with exponents', () => {
            expect(Type.number.convert('1e3')).to.be(1000);
        });

        it('should handle numbers with positive exponents', () => {
            expect(Type.number.convert('1e+3')).to.be(1000);
        });

        it('should handle numbers with negative exponents', () => {
            expect(Type.number.convert('1e-3')).to.be(1e-3);
        });

        it('should handle zero', () => {
            expect(Type.number.convert(0)).to.be(0);
        });
    });

    describe('Path', () => {
        const cwd  = process.cwd();
        const path = Type.get('path');

        it('should handle null', () => {
            const test = path.convert(null);

            expect(test).to.be(null);
        });

        it('should handle undefined', () => {
            const test = path.convert(undefined);

            expect(test).to.be(null);
        });

        it('should handle empty string', () => {
            const test = path.convert('');

            expect(test).to.be(null);
        });

        it('should handle strings of spaces', () => {
            const test = path.convert('   ');

            expect(test).to.have.property('path', '   ');
            expect(test.absolutify()).to.have.property('path', `${cwd}/   `);
        });

        it('should handle letters', () => {
            const test = path.convert('abc');

            expect(test).to.have.property('path', 'abc');
            expect(test.absolutify()).to.have.property('path', `${cwd}/abc`);
        });

        it('should not be relative to cwd', () => {
            const test = path.convert('/foo/bar');

            expect(test).to.have.property('path', '/foo/bar');
            expect(test.absolutify()).to.have.property('path', `/foo/bar`);
        });

        it('should handle letters and numbers', () => {
            const test = path.convert('1a');

            expect(test).to.have.property('path', '1a');
            expect(test.absolutify()).to.have.property('path', `${cwd}/1a`);
        });

        it('should handle non-zero numbers', () => {
            const test1 = path.convert(1);
            const test2 = path.convert(3.14);

            expect(test1).to.have.property('path', '1');
            expect(test1.absolutify()).to.have.property('path', `${cwd}/1`);

            expect(test2).to.have.property('path', '3.14');
            expect(test2.absolutify()).to.have.property('path', `${cwd}/3.14`);
        });

        it('should handle zero', () => {
            const test = path.convert(0);

            expect(test).to.have.property('path', '0');
            expect(test.absolutify()).to.have.property('path', `${cwd}/0`);
        });

        describe('array', () => {
            it('should handle null', () => {
                const value = [ null ];

                expect(path.convert(value)).to.eql([ null ]);
            });

            it('should handle undefined', () => {
                const value = [ undefined ];

                expect(path.convert(value)).to.eql([ null ]);
            });

            it('should handle empty string', () => {
                const value = [ '' ];

                expect(path.convert(value)).to.eql([ null ]);
            });

            it('should handle strings of spaces', () => {
                const value = [ '   ' ];

                expect(path.convert(value)).to.eql([
                    { path : '   ' }
                ]);
            });

            it('should handle letters', () => {
                const value = [ 'a/bc' ];

                expect(path.convert(value)).to.eql([
                    { path : 'a/bc' }
                ]);
            });

            it('should handle letters and numbers', () => {
                const value = [ '1/a' ];

                expect(path.convert(value)).to.eql([
                    { path : '1/a' }
                ]);
            });

            it('should handle non-zero numbers', () => {
                const value = [ 1, 3.14 ];

                expect(path.convert(value)).to.eql([
                    { path : '1' },
                    { path : '3.14' }
                ]);
            });

            it('should handle zero', () => {
                const value = [ 0 ];

                expect(path.convert(value)).to.eql([
                    { path : '0' }
                ]);
            });
        });

        describe('is', () => {
            it('should recognize a string', () => {
                expect(path.is('./foo')).to.be(false);
            });

            it('should recognize only a dot', () => {
                expect(path.is('.')).to.be(false);
            });

            it('should not recognize a bool', () => {
                expect(path.is(true)).to.be(false);
            });

            it('should not recognize a number', () => {
                expect(path.is(10)).to.be(false);
            });

            it('should not recognize an array', () => {
                expect(path.is([ 'foo' ])).to.be(false);
            });

            it('should not recognize an object', () => {
                expect(path.is({ foo: 'bar' })).to.be(false);
            });

            it('should not recognize a function', () => {
                expect(path.is( () => {} )).to.be(false);
            });
        });
    });

    describe('String', () => {
        it('should handle null', () => {
            expect(Type.string.convert(null)).to.be(null);
        });

        it('should handle undefined', () => {
            expect(Type.string.convert(undefined)).to.be(null);
        });

        it('should handle empty string', () => {
            expect(Type.string.convert('')).to.be('');
        });

        it('should handle strings of spaces', () => {
            expect(Type.string.convert('   ')).to.be('   ');
        });

        it('should handle letters', () => {
            expect(Type.string.convert('abc')).to.be('abc');
        });

        it('should handle letters and numbers', () => {
            expect(Type.string.convert('1a')).to.be('1a');
        });

        it('should handle non-zero numbers', () => {
            expect(Type.string.convert(1)).to.be('1');
            expect(Type.string.convert(3.14)).to.be('3.14');
        });

        it('should handle zero', () => {
            expect(Type.string.convert(0)).to.be('0');
        });
    });

    it('should provide a base convert method', function () {
        expect(new Type().convert('foo')).to.equal('foo');
    });

    it('should allow defining custom types', function () {
        Type.define({
            default: 1,
            name: 'oddNumber',

            re: /^[13579]+$/i,

            convert (value) {
                var r = +value;
                if (typeof value !== 'number') {
                    let s = String(value);

                    if (!this.re.test(s)) {
                        return null;
                    }
                    r = parseInt(value);
                }
                if (parseInt(value) % 2 == 0) {
                    return null;
                }
                return r;
            },

            is (value) {
                return (parseInt(value) % 2 == 1);
            }
        });

        let oddNumberType = Type.get('oddNumber');
        expect(oddNumberType).to.be.ok();
        expect(oddNumberType.is(3)).to.be.ok();
    });

    it('should throw an error if trying to define a duplicated type', function (done) {
        try {
            Type.define({
                name: 'number'
            });
            expect().fail();
        } catch (ex) {
            expect(ex.message).to.equal('Type already defined: "number"');
            done();
        }
    });

    it('should provide a way to get the type for a (directly or indirectly) given known value type', function () {
        expect(Type.of('foo').name).to.equal('string');
        expect(Type.of(4).name).to.equal('number');
        expect(Type.of(true).name).to.equal('boolean');

        expect(Type.of(() => {}).name).to.equal('string'); // In this test, we're relying on functions being coerced by "string" type
    });

    it('should throw an error if trying to identify type when ambiguous types exists', function (done) {
        try {
            Type.of(3);
            expect().fail();
        } catch (ex) {
            expect(ex.message).to.equal('Ambiguous type for "3"; could be: number, oddNumber');
            done();
        }
    });

    it('should return an array with matching names when trying to pick using a function and no value is passed', function () {
        expect(Type.pick((def) => {
            return def.is(3);
        })).to.eql(['number', 'oddNumber']);
    });
});
