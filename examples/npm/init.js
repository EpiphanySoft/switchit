/*
 * This class provides an example on how to configure interactive mode
 */
const Command = require('../../index.js').Command;

class Init extends Command {
    execute (params) {
        // There's nothing really important here, just a quick way to construct a mock package.json file based on
        // user input
        let json = Object.assign({}, params);

        // Test command actually goes inside scripts.test
        if (!!params.testcommand) {
            json['scripts'] = {
                test: params.testcommand
            };
            delete json.testcommand;
        }

        // params.version is a semver object, so we just want its string
        json.version = params.version.version;

        // Show the json
        console.log(`About to write to ${process.cwd()}/package.json:`);
        console.log(JSON.stringify(json, null, '  '));
    }
}

Init.define({
    // Add help texts just to improve the user experience
    help: {
        '': ['This utility will walk you through creating a package.json file.',
             'It only covers the most common items, and tries to guess sensible defaults.',
             ''
            ].join('\n'),
        author: 'Your name',
        description: 'This helps people discover your package',
        entrypoint: 'The project main file',
        gitrepository: 'The path to this project\'s repository',
        keywords: 'These help people discover your package',
        license: 'The license lets people know how they are permitted to use your package',
        name: 'The name is what your thing is called.',
        testcommand: 'The command needed to run tests',
        version: 'Version must be parseable by node-semver'
    },
    // Some switches are required (name, keywords)
    // Some are optional and confirmable ([name?=value] syntax)
    // The ones that omit a type (like name or description) default to :string
    // Keyworkds is a variadic switch, just to show how that looks in interactive mode
    switches:[
        'name',
        '[version:semver?=1.0.0]',
        '[description?=]',
        '[entrypoint?=index.js]',
        '[testcommand?=]',
        '[gitrepository?=]',
        'keywords:string[]',
        '[author?=]',
        '[license?=ISC]'
    ],
    // This is the only configuration needed to enable interactive mode in this command
    // everything else is standard `switchit` configuration
    interactive: true

});

module.exports = Init;