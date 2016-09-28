const Command = require('../index.js').Command;

class BrewCoffee extends Command {
    execute (params) {
        console.log('Let\'s prepare a cup of coffee.');
        if (params.topping.length > 0) {
            console.log(`Add the following toppings:`);
            params.topping.forEach(topping => console.log(`- ${topping}`));
        }
    }
}

BrewCoffee.define({
    switches: '[topping:string[]]',
    parameters: '[topping:string[]]'
});

new BrewCoffee().run();