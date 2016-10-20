/*
 * `sayhi.js`
 *
 * The purpose of this example is to show the minimal setup of a `switchit` command.
 *
 * To run:
 *      $ node sayhi.js --name Tim
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