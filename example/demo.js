const {
    Args,
    Command,
    Commands
    } = require('../index.js'); //require('switchit');

class Commit extends Command {
    execute () {
        console.log(`Commit changes... "${this.message}"`);
    }
}

Commit.describe({
    help: 'Commits current changes',
    
    switches: {
        message: {
            help: 'The commit message',
            value: ''
        }
    }
});

class Git extends Commands {
    //
}

Git.describe({
    commands: {
        commit: Commit
    }
});

const git = new Git();

git.dispatch(new Args([ 'commit', '-m', 'foobar' ]));
