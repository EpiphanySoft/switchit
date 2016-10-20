const Command = require('../../index.js').Command;

class Pull extends Command {
    execute (params) {
        console.log(`${this.name}... "${params.remote}/${params.branch}"`);
    }
}

Pull.define({
    help: {
        '': 'Pulls changes from a remote branch',
        'remote': 'The remote repository to push to',
        'branch': 'The name of the branch to push'
    },
    parameters: 'remote [branch:string=master]'
});

module.exports = Pull;