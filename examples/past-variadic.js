/*
 * `past-variadic.js`
 *
 * The purpose of this example is to demonstrate how values can be parsed after a variadic parameter.
 *
 * To run:
 *      $ node past-variadic.js 1 2 3 Tim
 */
const Command = require('../index.js').Command;

class Sum extends Command {
    execute (params) {
        console.log(`Hi, ${params.name}!`);
        console.log(params.summand.reduce((a, b) => a + b, 0));
    }
}

Sum.define({
    parameters: {
        summand: {
            type: 'number',
            vargs: true
        },
        name: {
            type: 'string'
        }
    }
});

new Sum().run();