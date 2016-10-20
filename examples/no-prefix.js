/*
 * `no-prefix.js`
 *
 * The purpose of this example is to demonstrate how `switchit` can process a switch with the `--no` prefix to set its
 * value to false.
 *
 * To run:
 *      $ node no-prefix.js --no-output
 */
const Command = require('../index.js').Command;

class Program extends Command {
    execute (params) {
        if (params.output) {
            console.log("Some output here!");
        }
    }
}

Program.define({
    switches: [{
        name: "output",
        type: "boolean",
        value: true
    }]
});

new Program().run();