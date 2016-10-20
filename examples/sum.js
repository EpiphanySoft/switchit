/*
 * `sum.js`
 *
 * The purpose of this example is to demonstrate how variadic arguments are configured.
 *
 * To run:
 *      $ node sum.js 1 2 3
 */
const Command = require('../index.js').Command;

class Sum extends Command {
    execute (params) {
        console.log(params.summand.reduce((a, b) => a + b, 0))
    }
}

Sum.define({
    parameters: {
        summand: {
            type: 'number',
            vargs: true
        }
    }
});

new Sum().run();