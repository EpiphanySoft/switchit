const Command = require('../../../index.js').Command;

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

module.exports = AddSubmodule;