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