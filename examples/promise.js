/*
 * `promise.js`
 *
 * The purpose of this example is to demonstrate how the `.run()` command returns a promise.
 *
 * To run:
 *      $ node promise.js
 *      $ node promise.js Tim
 */
const Command = require('../').Command;

class SayHi extends Command {
    execute (params) {
        console.log(`Hi, ${params.name}!`);
    }
}

SayHi.define({
    parameters: 'name'
});

new SayHi().run().then(() => {
    console.log("Success!");
},(e) => {
    console.error(`Oh no! ${e.message}`);
});