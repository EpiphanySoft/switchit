/*
 * `divide.js`
 *
 * The purpose of this example is to demonstrate how parameters are read from command line arguments.
 *
 * To run:
 *      $ node divide.js 10 5
 */
const Command = require('../index.js').Command;

class Divide extends Command {
    execute (params) {
        console.log(params.numerator / params.denominator);
    }
}

Divide.define({
    // The order of these properties defines the expected position of the arguments
    parameters: {
        numerator: {
            type: 'number'
        },
        denominator: {
            type: 'number'
        }
    }
});

new Divide().run();