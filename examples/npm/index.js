const {
    Container,
    Help
} = require('../../index.js');

const Init = require('./init.js');
const Install = require('./install.js');

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

module.exports = Npm;