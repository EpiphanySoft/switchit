/*
 * `switch.js`
 *
 * The purpose of this example is to demonstrate how switches are read from the command line.
 *
 * To run:
 *      $ node switch.js --name Tim
 */
const Command = require('../index.js').Command;

class SayHi extends Command {
    execute (params) {
        console.log(`Hi, ${params.name}!`);
    }
}

SayHi.define({
    switches: 'name'
});

new SayHi().run();