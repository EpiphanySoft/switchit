const Command = require('../index.js').Command;

class Sum extends Command {
    execute (params) {
        console.log(`Hi, ${params.name}!`);
        console.log(params.summand.reduce((a, b) => a + b, 0));
    }
}

Sum.define({
    parameters: {
        summand: {
            type: 'number',
            vargs: true
        },
        name: {
            type: 'string'
        }
    }
});

new Sum().run();