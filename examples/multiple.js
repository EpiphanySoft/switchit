const {
    Command,
    Container
} = require('../index.js');

class SayHi extends Command {
    execute (params) {
        console.log(`Hi, ${params.name}!`);
    }
}

SayHi.define({
    switches: 'name',
    parameters: 'name'
});

class SayBye extends Command {
    execute (params) {
        console.log(`Bye, ${params.name}!`);
    }
}

SayBye.define({
    switches: 'name',
    parameters: 'name'
});

class MyApp extends Container {}

MyApp.define({
    commands: {
        hi: SayHi,
        bye: SayBye
    }
});

new MyApp().run();