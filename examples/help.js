/*
 * `help.js`
 *
 * The purpose of this example is to demonstrate how the Help command can be included in a container.
 *
 * To run:
 *      $ node help.js help
 *      $ node help.js help coffee
 */
const {
    Command,
    Container,
    Help
} = require('../index');

class BrewBeverage extends Command {
    execute (params) {
        console.log(`Let's prepare a cup of ${this.constructor.beverageName}.`);
        if (params.extra.length > 0) {
            console.log('Add the following extras:');
            params.extra.forEach(extra => console.log(`- ${extra}`));
        }
    }
}

BrewBeverage.define({
    switches: '{[extra:string[]]}'
});

class BrewCoffee extends BrewBeverage {}
BrewCoffee.beverageName = 'coffee';

class BrewTea extends BrewBeverage {}
BrewTea.beverageName = 'tea';

class Coffeehouse extends Container {}

Coffeehouse.define({
    commands: {
        coffee: BrewCoffee,
        tea: BrewTea,
        help: Help
    }
});

new Coffeehouse().run();