const Command = require('../index.js').Command;

class Sum extends Command {
    execute (params) {
        console.log(params.summand.reduce((a, b) => a + b, 0))
    }
}

Sum.define({
    parameters: {
        summand: {
            type: 'number',
            vargs: true
        }
    }
});

new Sum().run();