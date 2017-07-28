const {
    Container,
    Help,
    commands
} = require('../../index.js');

const Commit = require('./commit');
const Fetch = require('./fetch');
const Pull = require('./pull');
const Remote = require('./remote');
const Submodule = require('./submodule');

class Git extends Container {}

Git.define({
    title: 'git',
    help: 'the simple content tracker',
    commands: {
        '?': 'help',
        help: Help,
        commit: Commit,
        fetch: Fetch,
        pull: Pull,
        remote: Remote,
        submodule: Submodule,
        version: commands.Version
    },
    logo: true
});

module.exports = Git;