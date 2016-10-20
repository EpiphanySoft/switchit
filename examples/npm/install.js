const Command = require('../../index.js').Command;

class Install extends Command {
    execute (params) {
        console.log('install takes place here');
        console.log('Params:', params);
    }
}

Install.define({
    help: {
        '': 'Install a package',
        'global': 'Use this switch to install the package globally',
        'save': 'Package will appear in your dependencies',
        'save-dev': 'Package will appear in your devDependencies',
        'folderorname': 'The package folder path or name in the npm registry'
    },
    switches: '[global:boolean=false] [save:boolean=false] [save-dev:boolean=false]',
    parameters: '[folderorname:string=.]'
});

module.exports = Install;