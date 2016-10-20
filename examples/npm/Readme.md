# An `npm` mock app built on top of `switchit`
This command attempts to implement a mock version of `npm` to demonstrate how it could be built on top of `switchit`.

## Showcased features
* [x] Interactive mode (See [`init.js`](init.js). Try running `node npm.js init`)
* [x] Optional and required switches (See [`install.js`](install.js))
* [x] Custom aliases to avoid ambiguity between single character prefixes (Try running `node npm.js i`)
* [x] Built-in help

## How to run this example

Use [`../npm.js`](../npm.js):

    $ node npm.js    
     Npm: javascript package manager
     Syntax
       npm [command]           Executes a command
     
     Available commands:
       · init                    Interactively create a package.json file
       · install                 Install a package
                                   (also known as: i)
     
     Run Npm Help [command] for more information on a command.
        
## How it works

[`../npm.js`](../npm.js) includes the `Npm` class from [`index.js`](index.js) and starts the example:

    const Npm = require('./npm/index.js');
    const npm = new Npm();
    
    // This will catch any errors and only log the error message
    // (instead of dumping the whole object to the console)
    npm.run().catch(err => {
        console.error(err.message);
        process.exit(1);
    });

The `Npm` class (located at [`index.js`](index.js)) requires all available commands as well as the built-in Help command,
 then defines itself as a subclass of `Container`.  
Note how it defines `i` as an alias for `install` to disambiguate the shortest unique prefix between `init` and `install`.

    const {
        Container,
        Help
    } = require('../../index.js');
    
    const Init = require('./init.js');
    const Install = require('./install.js');
    
    class Npm extends Container {}
    
    Npm.define({
        help: 'javascript package manager',
        commands: {
            help: Help,
            init: Init,
            install: Install,
            i: 'install'
        }
    });
    
    module.exports = Npm;