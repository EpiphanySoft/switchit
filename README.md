![switchit logo](resources/switchit_logo.png)
-
# switchit
A no-nonsense framework for command-line switch parsing and command dispatching.

`switchit` enables you to write modern command-line applications using a straightforward API and features including:

* [x] Robust command definition using an simple object-oriented API.
* [x] Supports switches in short or long form (`-d`, `--debug`)
* [x] Supports grouping of short form switches (`-xvf` === `-x -v -f`)
* [x] Nested command hierarchy (like `git remote add {args}`)
* [x] Required, optional and variadic switches and parameters
* [x] Command aliases (e.g.: `cmd color` === `cmd colour`)
* [x] Built-in help

## Getting Started

**Quick Start**

Install `switchit` into your project:

    $ npm install switchit --save

Create a `.js` file and add the following:
 
    const Command = require('switchit').Command;
    
    class SayHi extends Command {
        execute (params) {
            console.log(`Hi, ${params.name}!`);
        }
    }
    
    SayHi.define({
        switches: 'name'
    });
    
    new SayHi().run();

Run your project file, don't forget to pass `--name` or `-n`:

    $ node examples/simple.js --name "Finn"
    Hi, Finn!

Switches and parameters can be configured to be used interchangeably when running the program (as long as they have the same name):

    const Command = require('switchit').Command;
    
    class SayHi extends Command {
        execute (params) {
            console.log(`Hi, ${params.name}!`);
        }
    }
    
    SayHi.define({
        switches: 'name',
        parameters: 'name'
    });
    
    new SayHi().run();
   
Look ma, no switches!

    $ node examples/simple2.js Jake
    Hi, Jake!

### Nested command hierarchy

You can group several commands under a single command container with ease:

    const {
        Command,
        Container
    } = require('switchit');
    
    class SayHi extends Command {
        execute (params) {
            console.log(`Hi, ${params.name}!`);
        }
    }
    
    SayHi.define({
        switches: 'name',
        parameters: 'name'
    });
    
    class SayBye extends Command {
        execute (params) {
            console.log(`Bye, ${params.name}!`);
        }
    }
    
    SayBye.define({
        switches: 'name',
        parameters: 'name'
    });
    
    class MyApp extends Container {}
    
    MyApp.define({
        commands: {
            hi: SayHi,
            bye: SayBye
        }
    });
    
    new MyApp().run();

Go ahead, try them in the command line:

    $ node examples/multiple.js hi --name Marceline
    Hi, Marceline!
    $ node examples/multiple.js bye -n Felicia
    Bye, Felicia!
    
Don't forget you can also pass `name` as a parameter, this is equivalent to the tests above:

    $ node examples/multiple.js hi Marceline
    Hi, Marceline!
    $ node examples/multiple.js bye Felicia
    Bye, Felicia!

### Required or optional switches and parameters

Switches are required by default, you can make any of them optional using the syntax: `[{name}={value}]` (e.g.: `[name=Gunter]`)

    const Command = require('switchit').Command;
    
    class SayHi extends Command {
        execute (params) {
            console.log(`Hi, ${params.name}!`);
        }
    }
    
    SayHi.define({
        switches: '[name=Gunter]'
    });
    
    new SayHi().run();

Check it out:

    $ node examples/optional.js
    Hi, Gunter!

or if you prefer to be more verbose:

    const Command = require('switchit').Command;
    
    class SayHi extends Command {
        execute (params) {
            console.log(`Hi, ${params.name}!`);
        }
    }
    
    SayHi.define({
        switches: {
            name: {
                type: 'string',
                value: 'Gunter'
            }
        }
    });
    
    new SayHi().run();

This produces the same output:

    $ node examples/optional2.js
    Hi, Gunter!

### Variadic switches and parameters

Let's try a more complete example, a program that can receive your coffee order, note that `topping` is a variadic switch/parameter and is marked as optional (surrounded by `[]`):
 
    const Command = require('switchit').Command;
    
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

When run with no switches this command prints a simple message:

    $ node examples/variadic.js
    Let's prepare a cup of coffee.

But you can pass toppings as switches:

    $ node examples/variadic.js --topping Caramel --topping Cinnamon
    Let's prepare a cup of coffee.
    Add the following toppings:
     - Caramel
     - Cinnamon

Or as parameters:

    $ node examples/variadic.js Caramel Cinnamon
    Let's prepare a cup of coffee.
    Add the following toppings:
     - Caramel
     - Cinnamon

That covers the basics, but there's so much more! Once you get the hang of it, make sure to check our [examples](examples/) or our [wiki](https://github.com/dongryphon/switchit/wiki).

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/dongryphon/switchit/tags). 

## Authors

* **Don Griffin** - *Author* - [dongryphon](https://github.com/dongryphon)

See also the list of [contributors](https://github.com/dongryphon/switchit/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
