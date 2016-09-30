const Command = require('../../index.js').Command;

class Init extends Command {
    execute () {
        console.log('init takes place here');
    }
}

Init.define({
    help: 'Interactively create a package.json file'
});

module.exports = Init;