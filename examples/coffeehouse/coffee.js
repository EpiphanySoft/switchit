const BrewBeverage = require('./beverage.js');

const sorts = ['black', 'espresso', 'iced', 'latte'];

class BrewCoffee extends BrewBeverage {
    get brewMessage () {
        return `Let's prepare a cup of ${this.params.sort} ${this.beverageName} with ${this.params.shots} shot(s), ${!this.params.milk ? 'no' : 'with'} milk.`
    }
    get sorts () {
        return sorts;
    }
}

BrewCoffee.define({
    help: `Brew some coffee`,
    switches: {
        sort: {
            help: `The soft of coffee to prepare (possible: ${sorts.join(', ')})`,
            type: 'string',
            value: sorts[0]
        },
        shots: {
            help: 'The number of espresso shots to include',
            type: 'number',
            value: 1
        }
    }
});

BrewCoffee.prototype.beverageName = 'coffee';

module.exports = BrewCoffee;