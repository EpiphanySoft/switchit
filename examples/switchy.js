/*
 * `switchy.js`
 *
 * The purpose of this example is to demonstrate how parameters can be configured as 'switchy', which makes them expose a
 * switch with the same name.
 *
 * To run:
 *      $ node switchy.js --name Tim
 *      $ node switchy.js Tim
 */
const Command = require('../index.js').Command;

class SayHi extends Command {
    execute (params) {
        console.log(`Hi, ${params.name}!`);
    }
}

SayHi.define({
    parameters: {
        name: {
            switch: true
        }
    }
});

new SayHi().run();