const Command = require('../').Command;

class SayHi extends Command {
    execute (params) {
        console.log(`Hi, ${params.name}!`);
    }
}

SayHi.define({
    parameters: 'name',
    interactive: true,
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