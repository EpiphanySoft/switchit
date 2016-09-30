const Command = require('../../index.js').Command;

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

module.exports = Install;