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
    help: {
        '': 'Brew some coffee',
        sort: `The soft of coffee to prepare (possible: ${sorts.join(', ')})`,
        shots: 'The number of espresso shots to include'
    },
    switches: `[sort=${sorts[0]}] [shots:number=1]`
});

BrewCoffee.prototype.beverageName = 'coffee';

module.exports = BrewCoffee;