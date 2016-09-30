const {
    Command,
    Container,
    Help
} = require('../index.js');

//------------------------------------------ git/commit.js

function delay (ms) {
    return new Promise(resolve => {
        setTimeout(x => resolve(), ms);
    });
}

class Commit extends Command {
    execute (params) {
        console.log(`${this.fullName}... "${params.message}"`, params);

        return delay(2000).then(() => {
            console.log('tick');
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

//------------------------------------------ git/fetch.js

class Fetch extends Command {
    execute (params) {
        console.log(`${this.name}... "${params.remote}"`);
    }
}

Fetch.define({
    help: 'Fetches changes from a remote',

    parameters: 'remote'
});

//------------------------------------------ git/pull.js

class Pull extends Command {
    execute (params) {
        console.log(`${this.name}... "${params.remote}/${params.branch}"`);
    }
}

Pull.define({
    help: 'Pulls changes from a remote branch',

    parameters: 'remote [branch:string=master]'
});

//------------------------------------------ git/remote/add.js

class AddRemote extends Command {
    execute (params) {
        console.log(`${this.parent.name} ${this.name}... "${params.url}" "${params.name}"`);
    }
}

AddRemote.define({
    help: 'Adds a remote reference named <name> for the repository at <url>',

    parameters: 'url name'
});

//------------------------------------------ git/remote/ls.js

class ListRemote extends Command {
    execute () {
        console.log('list all remotes');
    }
}

ListRemote.define({
    help: 'Shows a list of existing remotes'
});

//------------------------------------------ git/remote/index.js

class Remote extends Container {
    //
}

Remote.define({
    title: 'remote',
    help: 'Commands to manage remote references',
    commands: {
        add: AddRemote,
        default: ListRemote
    }
});

//------------------------------------------ git/submodule/add.js

class AddSubmodule extends Command {
    execute (params) {
        if (!params.path) {
            params.path = 'a calculated path';
        } else {
            params.path = `"${params.path}"`;
        }

        console.log(`Add repository "${params.repository}" as a submodule, using ${params.path} as path.`);
    }
}

AddSubmodule.define({
    help: 'Add the given <repository> as a submodule at the given <path>',

    parameters: [
        'repository',
        {
            name: 'path',
            value: ''
        }
    ]
});

//------------------------------------------ git/submodule/index.js

class Submodule extends Container {
    //
}

Submodule.define({
    title: 'remote',
    help: 'Initialize, update or inspect submodules',
    commands: {
        add: AddSubmodule
    }
});

//------------------------------------------ git/index.js

class Git extends Container {
    //
}

Git.define({
    title: 'git',
    help: 'the stupid content tracker',
    commands: {
        '?': 'help',

        help: Help,
        commit: Commit,
        fetch: {
            type: Fetch
        },
        pull: {
            type: Pull
        },
        remote: Remote,
        submodule: Submodule
    }
});

//------------------------------------------ git.js
const git = new Git();

// This will catch any errors and only log the error message (instead of dumping the whole object to the console)
git.run().catch(err => {
    console.error(err.message);
    process.exit(1);
});
