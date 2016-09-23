const {
    Arguments,
    Command,
    Commands
    } = require('../index.js'); //require('switchit');

class Commit extends Command {
    execute (params) {
        console.log(`Commit changes... "${params.message}"`);
    }
}

Commit.define({
    help: 'Commits current changes',
    
    switches: {
        message: {
            help: 'The commit message',
            value: ''
        }
    }
});

//------------------------------------------

class Fetch extends Command {
    execute (params) {
        console.log(`Fetch... "${params.remote}"`);
    }
}

Fetch.define({
    help: 'Fetches changes from a remote',

    args: 'remote'
});

//------------------------------------------

class Pull extends Command {
    execute (params) {
        console.log(`Pull... "${params.remote}/${params.branch}"`);
    }
}

Pull.define({
    help: 'Pulls changes from a remote branch',

    //args: 'remote [branch:string]'
    args: [{
        name: 'remote'
    }, {
        type: 'string', // the default (could be "number" or "boolean")
        name: 'branch',
        default: ''
    }]
});

//------------------------------------------

class Git extends Commands {
    //
}

Git.define({
    commands: {
        commit: Commit,
        fetch: {
            type: Fetch
        },
        pull: {
            type: Pull
        }
    }
});

const git = new Git();

git.dispatch(new Arguments([ 'commit', '-m', 'foobar' ]));
