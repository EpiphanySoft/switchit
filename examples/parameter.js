/*
 * `parameter.js`
 *
 * The purpose of this example is to demonstrate how parameters are read from command line arguments.
 *
 * To run:
 *      $ node parameter.js Tim
 */
const Command = require('../index.js').Command;

class SayHi extends Command {
    execute (params) {
        console.log(`Hi, ${params.name}!`);
    }
}

SayHi.define({
    parameters: 'name'
});

new SayHi().run();