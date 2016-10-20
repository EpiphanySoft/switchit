const BrewBeverage = require('./beverage.js');

const sorts = ['green', 'black', 'iced', 'jasmin'];

class BrewTea extends BrewBeverage {
    get brewMessage () {
        return `Let's prepare a cup of ${this.params.sort} tea${this.params.milk || this.params.lime ? ' with a splash of ' + (this.params.milk ? 'milk' : 'lime'): ''}.`;
    }
    get sorts () {
        return sorts;
    }
}

BrewTea.define({
    help: {
        '': 'Brew some tea',
        'sort': `The soft of tea to prepare (possible: ${sorts.join(', ')})`,
        'lime': 'Add some lime'
    },
    switches: `[sort=${sorts[0]}] [lime:boolean=false]`
});

BrewTea.prototype.beverageName = 'tea';
module.exports = BrewTea;