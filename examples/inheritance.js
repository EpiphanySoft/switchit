/*
 * `inheritance.js`
 *
 * The purpose of this example is to demonstrate `switchit`'s object oriented API.
 *
 * To run:
 *      $ node inheritance.js Tim
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

class SayHiAndBye extends SayHi {
    execute(params) {
        super.execute(params);
        console.log(`Bye, ${params.name}!`);
    }
}

new SayHiAndBye().run();