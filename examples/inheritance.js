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