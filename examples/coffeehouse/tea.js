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
    help: 'Brew some tea',
    switches: {
        sort: {
            help: `The soft of tea to prepare (possible: ${sorts.join(', ')})`,
            type: 'string',
            value: sorts[0]
        },
        lime: {
            help: 'Add some lime',
            type: 'boolean',
            value: false
        }
    }
});

BrewTea.prototype.beverageName = 'tea';
module.exports = BrewTea;