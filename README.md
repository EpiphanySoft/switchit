![switchit logo](resources/switchit_logo.png)
-
# switchit
A no-nonsense framework for command-line switch parsing and command dispatching.

`switchit` enables you to write modern command-line applications using a straightforward API and features including:

* [x] [Robust command definition using an simple object-oriented API.](#getting-started)
* [x] [Supports switches in short or long form (`-d`, `--debug`)](#short-form-switches)
* [x] [Interchangeably use switches or parameters with the same name](#values-from-switches-or-parameters)
* [x] [Required and optional switches and parameters](#required-and-optional-switches-and-parameters)
* [x] [Variadic switches and parameters](#variadic-switches-and-parameters)
* [x] [Nested command hierarchy (like `git remote add {args}`)](#nested-command-hierarchy)
* [x] [Advanced command chaining using `and` and `then` (e.g.: `program cmd1 then cmd2` instead of `program cmd1 && program cmd2`)](#advanced-command-chaining)
* [x] [Shortest unique prefix for sub-commands and switches (e.g.: `git co` === `git commit`, `git cl` === `git clone`](#shortest-unique-prefix-for-sub-commands-and-switches)
* [x] [Custom aliases and default sub-command (e.g.: `npm i` === `npm install`, `git remote` === `git remote list`)](#custom-aliases-and-default-sub-command)
* [x] [Complex command execution from response files (`program @somefile.txt`)](#response-file-processing)
* [x] [Built-in help](#built-in-help)

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

Run your project file, don't forget to pass `--name`:

    $ node examples/simple.js --name John
    Hi, John!

### Short form switches

You can also pass `-n`:

    $ node examples/simple.js -n Paul
    Hi, Paul!

### Values from switches or parameters

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

    $ node examples/simple2.js George
    Hi, George!

## Feature overview

`switchit` is more than a wrapper for your command, check some of the features below:

### Required and optional switches and parameters

Switches are required by default, you can make any of them optional using the syntax: `[{name}={value}]` (e.g.: `[name=Ringo]`)

    const Command = require('switchit').Command;
    
    class SayHi extends Command {
        execute (params) {
            console.log(`Hi, ${params.name}!`);
        }
    }
    
    SayHi.define({
        switches: '[name=Ringo]'
    });
    
    new SayHi().run();

Check it out:

    $ node examples/optional.js
    Hi, Ringo!

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
                value: 'Ringo'
            }
        }
    });
    
    new SayHi().run();

This produces the same output:

    $ node examples/optional2.js
    Hi, Ringo!

### Variadic switches and parameters

Let's try a more complete example, a program that can receive your coffee order, note that `topping` is a variadic switch/parameter and is marked as optional (surrounded by `[]`):
 
    const Command = require('switchit').Command;
    
    class BrewCoffee extends Command {
        execute (params) {
            console.log("Let's prepare a cup of coffee.");
            if (params.extra.length > 0) {
                console.log(`Add the following extras:`);
                params.extra.forEach(extra => console.log(`- ${extra}`));
            }
        }
    }
    
    BrewCoffee.define({
        switches: '[extra:string[]]',
        parameters: '[extra:string[]]'
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

### Nested command hierarchy

You can group several commands under a single command container with ease:

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

### Advanced command chaining

`switchit` understands two special command-like keywords `then` and `and` that are used to chain command calls.  
Let's execute both commands above on a single line using the `and` keyword:

     $ node examples/coffeehouse-simple.js coffee --extra Caramel --extra Cinnamon and tea --extra Honey
    Let's prepare a cup of coffee.
    Add the following extras:
    - Caramel
    - Cinnamon
    Let's prepare a cup of tea.
    Add the following extras:
    - Honey

If your command hierarchy contains multiple levels, you can use the `then` keyword to jump back to the root level.  
Let's use a `git` example to illustrate this. Let's say you have a repository and you want to:

1. Add a remote reference called 'upstream' pointing to 'git@example.com:user/repo'
2. Fetch from 'upstream'
3. Commit your working copy changes

Traditionally you'd need tree command line calls:

    $ git remote add git@example.com:user/repo upstream
    $ git fetch upstream
    $ git commit -m "Are we done yet?"
    
Using our [`git` mock application](examples/git) you can run this using a single command line call:

    $ node examples/git.js remote add git@example.com:user/repo upstream then fetch upstream and commit -m "Look at this"
    remote add... "git@example.com:user/repo" "upstream"
    fetch... "upstream"
    git commit... "Look at this" { message: 'Look at this' }
    completed

#### How is this different than using my shell's '&&' operator?

In the example above, there's not a lot of difference in terms of output, but you avoided the cost of relaunching `git` each time which, depending on what your program does at launch, can be quite costly in terms of performance.

### Shortest unique prefix for sub-commands and switches

All commands, containers and switches defined by your application can be specified on the command line by using their full name or by the shortest prefix that is unique.  
To illustrate, you can run the commands in our example above like this:

    $ node examples/coffeehouse-simple.js c -e Caramel -e Cinnamon
    Let's prepare a cup of coffee.
    Add the following extras:
    - Caramel
    - Cinnamon

You could use `c`, `co`, `cof`, `coff`, `coffe` or `coffee` since they're all unique in this example.  
There are times when this is not the case and the shortest unique prefix may consist of more than one character because a single character can be ambiguous.

Our [`npm` mock application](examples/npm) includes an `npm-noalias.js` version to illustrate this:
 
    $ node examples/npm-noalias.js i
    "i" matches multiple commands for Npm: init, install
    $ node examples/npm-noalias.js ins
    install takes place here...

### Custom aliases and default sub-command

Containers, commands, switches and parameters can all specify custom aliases. For example, to disambiguate non-unique prefixes.  
To illustrate this, our [`npm` mock application](examples/npm) configures `i` as an alias for `install`, to avoid ambiguity:
                 
    $ node examples/npm.js i
    install takes place here...

Do you want to offer an alternative spelling or a translation of your command?
Check this out (we're adding `koffie` and `thee` as aliases to our previous `coffeehouse-simple.js` example `coffee` and `tea` commands, respectively):

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
    Let's prepare a cup of coffee.

The special alias `default` specifies the action a command container should take when no sub-command is specified.
Our [`git` mock application](examples/git)'s `remote` command has a special [`ListRemote`](examples/git/remote/ls.js) command as default. These are the contents of [`examples/git/remote/index.js`](examples/git/remote/index.js):

    // ... 
    
    Remote.define({
        title: 'remote',
        help: 'Commands to manage remote references',
        commands: {
            add: AddRemote,
            default: ListRemote
        }
    });
    
    // ... 

And when running on the command line, it looks like this (note the `Syntax` section in the help output):

    $ node examples/git.js help remote
                           
     git remote: Commands to manage remote references
     
     Available sub-commands:
      * add:        Adds a remote reference named <name> for the repository at <url>        
     
     Syntax:
       git remote   Shows a list of existing remotes
       git remote (subcommand)      Execute subcommand
     
    $ node examples/git.js remote
    list all remotes

### Response file processing

Sometimes you want to execute a set of commands on a regular basis and don't want to write it to the console each time.
For example, let's use that coffee brewing example above and define two files for our favourite coffee and tea recipes (one argument per line).

This would be our `coffee.txt` file (indented for readability):

    coffee
        Caramel
        Cinnamon
        Whipped Cream

And this would be our `tea.txt` file (again, indented for readability):

    tea
        Honey
        Lime
        
`switchit` can read these files so that each line is taken to be a command line argument, unless that line begins with `#` in which case it is skipped.

    $ node examples/coffeehouse-simple.js @examples/coffee.txt                                  
    Let's prepare a cup of coffee.
    Add the following extras:
    - Caramel
    - Cinnamon
    - Whipped Cream

    $ node examples/coffeehouse-simple.js @examples/tea.txt   
    Let's prepare a cup of tea.
    Add the following extras:
    - Honey
    - Lime
    
All lines from the specified file are inserted into the command line arguments as if they had been typed there instead of "@{file}".
For example, a `coffe-and-tea.txt` file can contain response file insertions as well:

    @coffe.txt
    and
    @tea.txt

Now if you try to run this, not only the command line argument is expanded but any `@{file}` lines on it as well (paths are relative to the current working directory):
    
    $ cd examples
    $ node coffeehouse-simple.js @coffee-and-tea.txt                  
    Let's prepare a cup of coffee.
    Add the following extras:
    - Caramel
    - Cinnamon
    - Whipped Cream
    Let's prepare a cup of tea.
    Add the following extras:
    - Honey
    - Lime

**Note**: If you want to use the `@` symbol on any of your switch values or parameters, you can escape it as `@@`:

    $ node examples/simple2.js @@Example
    Hi, @Example!

### Built-in help

Command containers automatically provide basic help output when no command is specified. Using our previous `coffeehouse-simple.js` example, check this out:

    $ node examples/coffeehouse-simple.js

     Coffeehouse
     
     Available sub-commands:
      * coffee
      * tea
     
     Syntax:
       coffeehouse [subcommand]

Help can also be included as a command on your program, here we've added it to our `coffeehouse-simple.js` example and is available at [`examples/help.js`](examples/help.js):
    
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

All our mock applications (`git`, `npm`, `coffeehouse`) include examples on how to configure the output of the help command.

    $ node examples/git.js help commit
     
     git commit: Commits current changes
     
     Available options:
      * --message (string): The commit message      
     
     Syntax:
       git commit [options]
    
When no sub-container or sub-command is passed to a container, its help page is displayed automatically, unless it defined a `default` alias for a command (more information on the [Custom aliases](#custom-aliases-and-default-sub-command) section).

    $ node examples/git.js
     
     Git: the stupid content tracker
     
     Available command containers:
      * remote:     Commands to manage remote references    
      * submodule:  Initialize, update or inspect submodules        
     
     Available sub-commands:
      * help:       This command displays help for other commands   (alias: ?)
      * commit:     Commits current changes 
      * fetch:      Fetches changes from a remote   
      * pull:       Pulls changes from a remote branch      
     
     Syntax:
       git [container|subcommand]
       
    $ node examples/git.js submodule
         
     git submodule: Initialize, update or inspect submodules
     
     Available sub-commands:
      * add:        Add the given <repository> as a submodule at the given <path>   
     
     Syntax:
       git submodule [subcommand]
       
## More examples and API

Once you get the hang of the examples above, make sure to check our [examples](examples/) directory or our [wiki](https://github.com/dongryphon/switchit/wiki) for more information and API docs.

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/dongryphon/switchit/tags). 

## Authors

* **Don Griffin** - *Author* - [dongryphon](https://github.com/dongryphon)

See also the list of [contributors](https://github.com/dongryphon/switchit/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
