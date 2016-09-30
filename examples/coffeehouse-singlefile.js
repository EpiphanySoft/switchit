const {
    Command,
    Container,
    Help
} = require('../index.js');

//------------------------------------------ coffeehouse/beverage.js
class BrewBeverage extends Command {
    execute (params) {
        this._validateSort(params.sort);
        console.log(this.brewMessage);
        if (params.extra.length > 0) {
            console.log('Add the following extras:');
            params.extra.forEach(extra => console.log(`- ${extra}`));
        }
    }
    _validateSort (sort) {
        if (this.sorts.indexOf(sort) === -1) {
            throw Error(`'${sort}' is not a valid sort of ${this.beverageName}. Possible values are: ${this.sorts.join(', ')}`);
        }
    }
}

BrewBeverage.define({
    switches: {
        extras: {
            help: 'One or more extras to add',
            type: 'string',
            vargs: true,
            value: []
        },
        milk: {
            help: 'Add some milk',
            type: 'boolean',
            value: false
        }
    },
    parameters: '[extra:string[]]'
});

//------------------------------------------ coffeehouse/coffee.js
const coffeeSorts = ['black', 'espresso', 'iced', 'late'];

class BrewCoffee extends BrewBeverage {
    get brewMessage () {
        return `Let's prepare a cup of ${this.params.sort} ${this.beverageName} with ${this.params.shots} shot(s), ${!this.params.milk ? 'no' : 'with'} milk.`
    }
    get sorts () {
        return coffeeSorts;
    }
}

BrewCoffee.define({
    help: `Brew some coffee`,
    switches: {
        sort: {
            help: `The soft of coffee to prepare (possible: ${coffeeSorts.join(', ')})`,
            type: 'string',
            value: coffeeSorts[0]
        },
        shots: {
            help: 'The number of espresso shots to include',
            type: 'number',
            value: 1
        }
    }
});

BrewCoffee.prototype.beverageName = 'coffee';

//------------------------------------------ coffeehouse/tea.js
const teaSorts = ['green', 'black', 'iced', 'jasmin'];

class BrewTea extends BrewBeverage {
    get brewMessage () {
        return `Let's prepare a cup of ${this.params.sort} tea${this.params.milk || this.params.lime ? ' with a splash of' + (this.params.milk ? 'milk' : 'lime'): ''}.`;
    }
    get sorts () {
        return teaSorts;
    }
}

BrewTea.define({
    help: 'Brew some tea',
    switches: {
        sort: {
            help: `The soft of tea to prepare (possible: ${teaSorts.join(', ')})`,
            type: 'string',
            value: teaSorts[0]
        },
        lime: {
            help: 'Add some lime',
            type: 'boolean',
            value: false
        }
    }
});

BrewTea.prototype.beverageName = 'tea';

//------------------------------------------ coffeehouse/index.js
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

//------------------------------------------ coffeehouse.js
const coffeehouse = new Coffeehouse();

// This will catch any errors and only log the error message
// (instead of dumping the whole object to the console)
coffeehouse.run().catch(err => {
    console.error(err.message);
    process.exit(1);
});