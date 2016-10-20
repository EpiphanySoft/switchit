# Commands and sub-commands

## Command containers

You can group several commands under a single command container with help of the `Container` class:

    const {
        Command,
        Container
    } = require('switchit');
    
    // Define a base class to illustrate how commands can inherit from other commands
    class BrewBeverage extends Command {
        execute (params) {
            console.log(`Let's prepare a cup of ${this.constructor.beverageName}.`);
            if (params.extra.length > 0) {
                console.log('Add the following extras:');
                params.extra.forEach(extra => console.log(`- ${extra}`));
            }
        }
    }
    
    // Switches and parameters are inherited
    BrewBeverage.define({
        switches: '[extra:string[]]',
        parameters: '[extra:string[]]'
    });
    
    class BrewCoffee extends BrewBeverage {}
    BrewCoffee.beverageName = 'coffee';
    
    class BrewTea extends BrewBeverage {}
    BrewTea.beverageName = 'tea';
    
    class Coffeehouse extends Container {}
    
    Coffeehouse.define({
        commands: {
            coffee: BrewCoffee,
            tea: BrewTea
        }
    });
    
    new Coffeehouse().run();

Go ahead, try them in the command line:

    $ node examples/coffeehouse-simple.js coffee --extra Caramel --extra Cinnamon
    Let's prepare a cup of coffee.
    Add the following extras:
    - Caramel
    - Cinnamon
    
    $ node examples/coffeehouse-simple.js tea --extra Honey
    Let's prepare a cup of tea.
    Add the following extras:
    - Honey
    
## Shortest unique prefix

All commands, containers and switches defined by your application can be specified on the command
line by using their full name or by the shortest prefix that is unique. To illustrate, you can run
the commands in our example above like this:

    $ node examples/coffeehouse-simple.js c -e Caramel -e Cinnamon
    Let's prepare a cup of coffee.
    Add the following extras:
    - Caramel
    - Cinnamon

You could use `c`, `co`, `cof`, `coff`, `coffe` or `coffee` since they're all unique in this example.  
There are times when this is not the case and the shortest unique prefix may consist of more than one
character because a single character can be ambiguous.

Our [`npm` mock application](../../examples/npm) includes an `npm-noalias.js` version to illustrate this:
 
    $ node examples/npm-noalias.js i
    "i" matches multiple commands for Npm: init, install
    $ node examples/npm-noalias.js ins
    install takes place here...

## Sub-command aliases

Containers, commands, switches and parameters can all specify custom aliases. For example, to
disambiguate non-unique prefixes. To illustrate this, our [`npm` mock application](../../examples/npm)
configures `i` as an alias for `install`, to avoid ambiguity:
                 
    $ node examples/npm.js i
    install takes place here...

Do you want to offer an alternative spelling or a translation of your command?
Check this out (we're adding `koffie` and `thee` as aliases to our previous `coffeehouse-simple.js`
example `coffee` and `tea` commands, respectively):

    //...
    
    Coffeehouse.define({
        commands: {
            coffee: BrewCoffee,
            tea: BrewTea,
            koffie: 'coffee',       // <-- Add 'koffie' as alias for 'coffee'
            thee: 'tea'             // <-- Add 'thee' as alias for 'tea'
        }
    });
    
    //...
    
Let's test this:

    $ node examples/alias.js koffie
    Let's prepare a cup of coffee.
    $ node examples/alias.js thee
    Let's prepare a cup of tea.

## Default sub-command

The "empty string" command specifies the action a command container should take when no
sub-command is specified. Our [`git` mock application](../../examples/git)'s `remote` command has a
special [`ListRemote`](../../examples/git/remote/ls.js) command as default. These are the contents
of [`examples/git/remote/index.js`](../../examples/git/remote/index.js):

    // ... 
    
    Remote.define({
        title: 'remote',
        help: 'Commands to manage remote references',
        commands: {
            add: AddRemote,
            '': ListRemote
        }
    });
    
    // ... 

And when running on the command line, it looks like this:

    $ node examples/git.js remote
    list all remotes

Note  the `Syntax` section in the help output (more information about help below)

    $ node examples/git.js help remote
                           
     git remote: Commands to manage remote references
     
     Available sub-commands:
      * add:        Adds a remote reference named <name> for the repository at <url>        
     
     Syntax:
       git remote                   Shows a list of existing remotes
       git remote (subcommand)      Execute subcommand

## Command chaining

`switchit` understands two special command-like keywords `then` and `and` that are used to chain
command calls. Let's execute both commands above on a single line using the `and` keyword:

     $ node examples/coffeehouse-simple.js coffee --extra Caramel --extra Cinnamon and tea --extra Honey
    Let's prepare a cup of coffee.
    Add the following extras:
    - Caramel
    - Cinnamon
    Let's prepare a cup of tea.
    Add the following extras:
    - Honey

If your command hierarchy contains multiple levels, you can use the `then` keyword to jump back to
the root level. Let's use a `git` example to illustrate this. Let's say you have a repository and
you want to:

1. Add a remote reference called 'upstream' pointing to 'example.com:user/repo'
2. Fetch from 'upstream'
3. Commit your working copy changes

Traditionally you'd need tree command line calls:

    $ git remote add example.com:user/repo upstream
    $ git fetch upstream
    $ git commit -m "Are we done yet?"
    
Using our [`git` mock application](../../examples/git) you can run this using a single command line call:

    $ node examples/git.js remote add example.com:user/repo upstream then fetch upstream and commit -m "Look at this"

### How is this different than using the command line '&&' operator?

In the example above, there's not a lot of difference in terms of output, but you avoided the cost
of relaunching `git` each time which, depending on what your program does at launch, can be quite
costly in terms of performance.

## Private commands
TODO