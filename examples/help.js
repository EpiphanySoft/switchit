const switchit = require('switchit');

// Each command can live on its own file or module
const Init = require('./init.js');
const Clone = require('./clone.js');
//...
// 'git remote' has subcommands (add, remove)
const Remote = require('./remote.js');

class Git extends switchit.Container {}

Git.define({
    help: 'The simple content tracker',
    commands: [
        Init,
        Clone,
        switchit.Help  // Include the help command
    ]
});

new Git().run();
// See the full sample app in our 'git' example