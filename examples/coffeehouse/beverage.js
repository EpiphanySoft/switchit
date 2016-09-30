const Command = require('../../index.js').Command;

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
        extra: {
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

module.exports = BrewBeverage;