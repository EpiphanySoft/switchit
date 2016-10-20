# `coffeehouse.js`: A command-line beverage genius
This command attempts to demonstrate most of the features of `switchit` using a single application example.

## Showcased features
* [x] Object-oriented command definition (See [`beverage.js`](beverage.js), [`coffee.js`](coffee.js) and [`tea.js`](tea.js))
* [x] Switchy parameters (See [`extra`] on `coffee` or `tea` commands)
* [x] Optional and required switches (See [`coffee.js`](coffee.js))
* [x] Variadic switches and parameters (See [`extra`] on `coffee` or `tea` commands)
* [x] Custom aliases (Try running `node coffeehouse.js koffie`)
* [x] Built-in `help` command

## How to run this example

Use [`../coffeehouse.js`](../coffeehouse.js):

    $ node coffeehouse.js      
     
     Coffeehouse: A simple app that brews your favorite beverages!
     
     Available sub-commands:
      * coffee:     Brew some coffee        (alias: koffie, cafe, c)
      * tea:        Brew some tea   (alias: thee, t)
      * help:       This command displays help for other commands   
     
     Syntax:
       coffeehouse [subcommand]
        
## How it works

[`../coffeehouse.js`](../coffeehouse.js) includes the `Coffeehouse` class from [`index.js`](index.js)
and starts the example:

    const Coffeehouse = require('./coffeehouse/index.js');
    const coffeehouse = new Coffeehouse();
    
    // This will catch any errors and only log the error message
    // (instead of dumping the whole object to the console)
    coffeehouse.run().catch(err => {
        console.error(err.message);
        process.exit(1);
    });

The `Coffeehouse` class (located at [`index.js`](index.js)) requires all available commands
as well as the built-in Help command, then defines itself as a subclass of `Container`.  
Note how it defines multi-language aliases for the two main commands, as well as disambiguate 
`c` and `t` as shortest unique prefixes for `coffee` and `tea` respectively.

    const {
        Container,
        Help
    } = require('../../index');
    
    const BrewCoffee = require('./coffee');
    const BrewTea = require('./tea');
    
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
    
    module.exports = Coffeehouse;

Another interesting feature demonstrated by this example is inheritance of commands, with `BrewCoffee`
(located at [`coffee.js`](coffee.js)) extending from `BrewBeverage` (located at [`beverage.js`](beverage.js)).  
Do note that switches and parameters are inherited (and merged when present on both parent and child classes).

    //-------------------------------------------------- beverage.js
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
        help: {
            'extra': 'One or more extras to add',
            'milk': 'Add some milk'
        },
        switches: '[milk:boolean=false]',
        parameters: '[{extra:string[]}]'
    });
    
    module.exports = BrewBeverage;
    
    //-------------------------------------------------- coffee.js
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
    
You can find the complete Help output for this application below.

## Application reference (help output)

Main help page:

    $ node coffeehouse.js
     Coffeehouse: A simple app that brews your favorite beverages!
     Syntax
       coffeehouse [command]   Executes a command
     
     Available commands:
       · coffee                  Brew some coffee
                                   (also known as: koffie, cafe, c)
       · tea                     Brew some tea
                                   (also known as: thee, t)
     
     Run Coffeehouse Help [command] for more information on a command.

`coffee` command help:

    $ node coffeehouse.js help coffee 
     coffeehouse coffee: Brew some coffee
     Syntax
       coffeehouse coffee [options] [extra...]
     
     Available options:
       · --extra (string)        One or more extras to add
                                   (required)
       · --milk (boolean)        Add some milk
                                   (default: false)
       · --shots (number)        The number of espresso shots to include
                                   (default: 1)
       · --sort (string)         The soft of coffee to prepare (possible: black, espresso, iced, latte)
                                   (default: black)

`tea` command help:

    $ node coffeehouse.js help tea
     coffeehouse tea: Brew some tea
     Syntax
       coffeehouse tea [options] [extra...]
     
     Available options:
       · --extra (string)        One or more extras to add
                                   (required)
       · --lime (boolean)        Add some lime
                                   (default: false)
       · --milk (boolean)        Add some milk
                                   (default: false)
       · --sort (string)         The soft of tea to prepare (possible: green, black, iced, jasmin)
                                   (default: green)

## Sample output

    $ node coffeehouse.js coffee --sort 'iced' --milk=true -sh 2 'Whipped cream' Caramel    
      Let's prepare a cup of iced coffee with 2 shot(s), with milk.
      Add the following extras:
      - Whipped cream
      - Caramel

    $ node coffeehouse.js tea --sort jasmin --lime=true -e Honey                           
       Let's prepare a cup of jasmin tea with a splash of lime.
       Add the following extras:
       - Honey

    $ node coffeehouse.js coffee --sort 'latte' --no-milk Cinnamon
      Let's prepare a cup of latte coffee with 1 shot(s), no milk.
      Add the following extras:
      - Cinnamon
      
    $ node coffeehouse.js coffee --sort 'foo'
      'foo' is not a valid sort of coffee. Possible values are: black, espresso, iced, latte