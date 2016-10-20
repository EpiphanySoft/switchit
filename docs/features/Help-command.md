# Built-in help command
Command containers automatically provide basic help output when no command is specified. Using our
previous `coffeehouse-simple.js` example, check this out:

    $ node examples/coffeehouse-simple.js

     Coffeehouse
     
     Available sub-commands:
      * coffee
      * tea
     
     Syntax:
       coffeehouse [subcommand]

## Including the help command
Help can also be included as a command on your program, here we've added it to our
`coffeehouse-simple.js` example and is available at [`../examples/help.js`](../../examples/help.js):
    
    const {
        //...
        Help                    // <- Import Help from switchit 
    } = require('switchit');
    
    // ...
    
    Coffeehouse.define({
        commands: {
            coffee: BrewCoffee,
            tea: BrewTea,
            help: Help          // <- Add it as a command
        }
    });
    
    //...

After this change, you can use the `help` command:

    $ node examples/help.js help coffee
      
      coffeehouse coffee
      
      Available options:
       * --topping (string) (default: [])
      
      Syntax:
        coffeehouse coffee [options] [extra...] 

All our mock applications (`git`, `npm`, `coffeehouse`) include examples on how to configure the
output of the help command.

    $ node examples/git.js help commit
     
     git commit: Commits current changes
     
     Available options:
      * --message (string): The commit message      
     
     Syntax:
       git commit [options]

## Runtime options
TODO
