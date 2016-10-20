/*
 * `sup.js`
 *
 * The purpose of this example is to demonstrate the concept of Shortest Unique Prefix on switches.
 *
 * To run:
 *      $ node sup.js --det
 *      $ node sup.js --deb
 *      $ node sup.js --d
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
            value: false
        },
        debug: {
            type: 'boolean',
            value: true
        }
    }
});

new Program().run().catch((e) => {
    console.log(e.message);
});