'use strict';

const expect = require('expect.js');

const Util = require('../../src/Util');

describe('Util', () => {
    it('should provide a way to generate a promise from a given function', function (done) {
        let foo = '';

        Util.promisify(function () {
            foo = 'bar';
            return 'baz';
        }).then((val) => {
            expect(foo).to.equal('bar');
            expect(val).to.equal('baz');
        }).then(() => done());
    });

    it('should provide a way to generate a promise from a given function and reject on error', function (done) {
        Util.promisify(function () {
            throw new Error('foo');
        }).then(
            () => expect().fail(),
            e => {
                expect(e.message).to.equal('foo');
                done();
            }
        );
    });

    it('should provide a way to define an always-executing callback on a promise that itself returns a promise', function (done) {
        Util.promisify(function () {
            throw new Error('foo');
        }).finally(done).then(() => {}, () => {});
    });
});