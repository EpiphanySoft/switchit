const Command = require('../../index.js').Command;

function delay (ms) {
    return new Promise(resolve => {
        setTimeout(x => resolve(), ms);
    });
}

class Commit extends Command {
    execute (params) {
        console.log(`${this.fullName}... "${params.message}"`, params);

        return delay(2000).then(() => {
            console.log('completed');
            return 42;
        });
    }
}

Commit.define({
    help: 'Commits current changes',

    switches: {
        message: {
            help: 'The commit message'
        }
    }
});

module.exports = Commit;