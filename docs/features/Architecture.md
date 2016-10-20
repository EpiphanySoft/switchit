# Base architecture

## Object oriented command definition
Commands on `switchit` are defined using a simple object-oriented API:

    const Command = require('switchit').Command;
    
    class SayHi extends Command {
        execute (params) {
            console.log(`Hi, ${params.name}!`);
        }
    }
    
    SayHi.define({
        switches: 'name'
    });
    
    class SayHiAndBye extends SayHi {
        execute(params) {
            super.execute(params);
            console.log(`Bye, ${params.name}!`);
        }
    }
    
    new SayHiAndBye().run();

When running in the console:

    $ node ../examples/inheritance.js --name Felicia
    Hi, Felicia!
    Bye, Felicia!

Check how `SayHiAndBye` extends from `SayHi` and inherits its `switches`.  
More information in the [API docs](../api)

## Promise-based command dispatching
Asynchronous operations inside a command are possible thanks to a promise-based dispatch pipeline:

    const Command = require('switchit').Command;
    
    class Timeout extends Command {
        execute () {
            let delay = (ms) => {
                return new Promise(resolve => {
                    setTimeout(x => resolve(), ms);
                });
            };
            
            return delay(1000).then(() => {
                console.log('tick');
            });
        }
    }
    
    new Timeout().run().then(() => {
        console.log("tock");
    });
    
Sample output:

    $ node ../examples/asynchronous.js
    tick
    tock