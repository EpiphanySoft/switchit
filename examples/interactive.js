/*
 * `interactive.js`
 *
 * The purpose of this example is to demonstrate the interactive capabilities of `switchit`.
 *
 * To run:
 *      $ node interactive.js
 */
const Command = require('../').Command;

class SayHi extends Command {
    execute (params) {
        console.log(`Hi, ${params.name}!`);
    }
}

SayHi.define({
    parameters: 'name',
    interactive: true,
    // Optionally add some help texts to improve the UI
    //  more info at docs/Readme.md#built-in-help-command
    help: {
        '': 'This is a command that says hi!',
        'name': 'Your name'
    }
});
new SayHi().run().then(() => {
    console.log("Success!");
},(e) => {
    console.error(`Oh no! ${e.message}`);
});