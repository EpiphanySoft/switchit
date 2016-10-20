/*
 * `char.js`
 *
 * The purpose of this example is to demonstrate how single-character aliases for switches are configured.
 *
 * To run:
 *      $ node char.js -d -D
 */
const Command = require('../index.js').Command;

class Program extends Command {
    execute (params) {
        console.log(params);
    }
}

Program.define({
    switches: {
        detach: {
            type: 'boolean',
            value: false,
            char: 'd'
        },
        debug: {
            type: 'boolean',
            value: true,
            char: 'D'
        }
    }
});

new Program().run().catch((e) => {
    console.log(e.message);
});