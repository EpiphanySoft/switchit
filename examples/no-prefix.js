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