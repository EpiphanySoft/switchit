const Command = require('../index.js').Command;

class SayHi extends Command {
    execute (params) {
        console.log(`Hi, ${params.name}!`);
    }
}

SayHi.define({
    switches: {
        name: {
            type: 'string',
            value: 'Gunter'
        }
    }
});

new SayHi().run();