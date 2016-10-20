/*
 * `optional.js`
 *
 * The purpose of this example is to demonstrate how optional switches are configured.
 *
 * To run:
 *      $ node optional.js
 */
const Command = require('../index.js').Command;

class SayHi extends Command {
    execute (params) {
        console.log(`Hi, ${params.name}!`);
    }
}

SayHi.define({
    switches: {
        name: {
            value: 'Ringo'
        }
    }
});

new SayHi().run();