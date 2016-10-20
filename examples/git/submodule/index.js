const Container = require('../../../index.js').Container;
const AddSubmodule = require('./add');

class Submodule extends Container {}

Submodule.define({
    help: 'Initialize, update or inspect submodules',
    commands: {
        add: AddSubmodule
    }
});

module.exports = Submodule;