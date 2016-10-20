const Command = require('../../../index.js').Command;

class AddRemote extends Command {
    execute (params) {
        console.log(`${this.fullName}... "${params.url}" "${params.name}"`);
    }
}

AddRemote.define({
    help: {
        '': 'Adds a remote reference named <name> for the repository at <url>',
        'name': 'The name of the remote',
        'url': 'The url to the remote repository'
    },
    parameters: 'url name'
});

module.exports = AddRemote;