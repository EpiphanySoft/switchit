const {
    Container,
    Help
} = require('../../index');

const BrewCoffee = require('./coffee');
const BrewTea = require('./tea');

class Coffeehouse extends Container {}

Coffeehouse.define({
    help: 'A simple app that brews your favorite beverages!',
    commands: {
        coffee: BrewCoffee,
        tea: BrewTea,
        koffie: 'coffee',
        thee: 'tea',
        cafe: 'coffee',
        c: 'coffee',
        t: 'tea',
        help: Help
    }
});

module.exports = Coffeehouse;