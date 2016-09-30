const {
    Container,
    Command,
    Help
} = require('../index.js');

class Init extends Command {
    execute () {
        console.log('init takes place here');
    }
}

Init.define({
    help: 'Interactively create a package.json file'
});

class Install extends Command {
    execute (params) {
        console.log('install takes place here');
        console.log('Params:', params);
    }
}

Install.define({
    help: 'Install a package',
    switches: {
        global: {
            help: 'Use this switch to install the package globally',
            type: 'boolean',
            value: false
        },
        save: {
            help: 'Package will appear in your dependencies',
            type: 'boolean',
            value: false
        },
        'save-dev': {
            help: 'Package will appear in your devDependencies',
            type: 'boolean',
            value: false
        }
    },
    parameters: '[folderorname:string=.]'
});

class Npm extends Container {
    //
}

Npm.define({
    help: 'javascript package manager',
    commands: {
        help: Help,
        init: Init,
        install: Install,
        i: 'install'
    }
});

const npm = new Npm();

// This will catch any errors and only log the error message
// (instead of dumping the whole object to the console)
npm.run().catch(err => {
    console.error(err.message);
    process.exit(1);
});