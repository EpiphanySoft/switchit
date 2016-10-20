const Command = require('../index.js').Command;

class Divide extends Command {
    execute (params) {
        console.log(params.numerator / params.denominator);
    }
}

Divide.define({
    // The order of these properties defines the expected position of the arguments
    parameters: {
        numerator: {
            type: 'number'
        },
        denominator: {
            type: 'number'
        }
    }
});

new Divide().run();