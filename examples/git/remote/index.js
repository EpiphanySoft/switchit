const Container = require('../../../index.js').Container;
const ListRemote = require('./ls');
const AddRemote = require('./add');

class Remote extends Container {
    //
}

Remote.define({
    title: 'remote',
    help: 'Commands to manage remote references',
    commands: {
        add: AddRemote,
        '': ListRemote
    }
});

module.exports = Remote;