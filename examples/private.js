/*
 * `private.js`
 *
 * The purpose of this example is to demonstrate how switches can be made private.
 *
 * To run:
 *      $ node private.js help
 *      $ node private.js help --all
 */
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