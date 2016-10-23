const Command = require('switchit').Command;

class SayHi extends Command {
    execute (params) {
        console.log(`Hi, ${params.name}!`);
    }
}

SayHi.define({
    help: {
        '': 'This is a command that greets you',
        name: 'Your name'
    },
    parameters: '{name}',
    interactive: true
});

new SayHi().run().catch((e) => {
    console.log(e.message);
});