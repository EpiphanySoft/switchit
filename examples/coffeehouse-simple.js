/*
 * `coffeehouse-simple.js`
 *
 * The purpose of this example is to demonstrate a couple `switchit` features:
 *   - How parameters and switches with the same name coalesce to a single property of 'params'
 *   - Command containers
 *   - Command inheritance (Object-oriented API)
 *
 * To run:
 *      $ node coffeehouse-simple.js
 *      $ node coffeehouse-simple.js coffee
 *      $ node coffeehouse-simple.js tea Honey Lime
 */
const {
    Command,
    Container
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
    switches: '[extra:string[]]',
    parameters: '[extra:string[]]'
});

class BrewCoffee extends BrewBeverage {}
BrewCoffee.beverageName = 'coffee';

class BrewTea extends BrewBeverage {}
BrewTea.beverageName = 'tea';

class Coffeehouse extends Container {}

Coffeehouse.define({
    commands: {
        coffee: BrewCoffee,
        tea: BrewTea
    }
});

new Coffeehouse().run();