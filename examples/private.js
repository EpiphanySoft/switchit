const {
    Container,
    Help
} = require('../index.js');

class Bar extends Container {}

Bar.define({
    switches: {
        foo: {
            value: false,
            private: true
        }
    },
    commands: {
        help: Help
    }
});

new Bar().run();