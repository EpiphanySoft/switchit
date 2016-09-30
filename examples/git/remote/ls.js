const Command = require('../../../index.js').Command;

class ListRemote extends Command {
    execute () {
        console.log('list all remotes');
    }
}

ListRemote.define({
    help: 'Shows a list of existing remotes'
});

module.exports = ListRemote;