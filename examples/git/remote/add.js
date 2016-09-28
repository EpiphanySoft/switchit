const Command = require('../../../index.js').Command;

class AddRemote extends Command {
    execute (params) {
        console.log(`${this.parent.name} ${this.name}... "${params.url}" "${params.name}"`);
    }
}

AddRemote.define({
    help: 'Adds a remote reference named <name> for the repository at <url>',

    parameters: 'url name'
});

module.exports = AddRemote;