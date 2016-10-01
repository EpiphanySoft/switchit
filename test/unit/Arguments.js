'use strict';
const expect = require('expect.js');
const path = require('path');

const TestUtils = require('../util');
const Arguments = require('../../src/Arguments');

describe('Arguments', function() {
    it('should provide a way to move through the argument queue', function (done) {
        let rawArgs = ['foo', '-a=1', '-b', '2', '--option-c', '3', '--option-d=4', 'and', 'then', 'bar', 'and', 'and', 'then', 'abc', 'baz'];

        let args = new Arguments(rawArgs.slice());
        expect(args.total).to.equal(rawArgs.length);
        expect(args.peek()).to.equal(rawArgs[0]);
        args.advance();
        expect(args.peek()).to.equal(rawArgs[1]);
        expect(args.pull()).to.equal(rawArgs[1]);
        expect(args.peek()).to.equal(rawArgs[2]);
        args.unpull();
        expect(args.peek()).to.equal(rawArgs[1]);
        args.rewind();
        expect(args.peek()).to.equal(rawArgs[0]);

        try {
            args.unpull();
            expect.fail();
        } catch (ignore) {}

        expect(args.pullConjunction(true)).to.not.be.ok();
        args.advance(7);
        expect(args.pullConjunction()).to.not.be.ok();
        args.advance();
        expect(args.pullConjunction()).to.not.be.ok();
        args.advance();
        expect(args.pullConjunction(true)).to.be.ok();
        expect(args.pull()).to.equal(rawArgs[13]);
        expect(args.more()).to.be.ok();
        expect(args.mustPull()).to.equal(rawArgs[14]);
        args.advance();
        expect(args.atEnd()).to.be.ok();

        try {
            args.mustPull();
            expect.fail();
        } catch (ignore) {}

        done();
    });

    it('should be iterable using the for...of statement', function (done) {
        let rawArgs = ['foo', 'bar', 'baz'];

        let args = new Arguments(rawArgs.slice());

        let result = '';
        for (let arg of args) {
            result += arg;
        }

        expect(result).to.equal(rawArgs.join(''));
        done();
    });

    it('should process and expand response files', function (done) {
        let rawArgs = [`@${path.join(TestUtils.getTestSourceFilesDir(), 'arguments', 'responsefile.txt')}`];

        let args = new Arguments(rawArgs.slice());
        let result = [];
        for (let arg of args) {
            result.push(arg);
        }

        expect(result.join(' ')).to.equal('somefoo then somebar')
        done();
    });
});
