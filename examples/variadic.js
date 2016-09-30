const Command = require('../index.js').Command;

class BrewCoffee extends Command {
    execute (params) {
        console.log("Let's prepare a cup of coffee.");
        if (params.extra.length > 0) {
            console.log(`Add the following extras:`);
            params.extra.forEach(extra => console.log(`- ${extra}`));
        }
    }
}

BrewCoffee.define({
    switches: '[extra:string[]]',
    parameters: '[extra:string[]]'
});

new BrewCoffee().run();