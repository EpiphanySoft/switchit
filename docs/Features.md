# Feature overview 
 
`switchit` is more than a wrapper for your command.  
Here you can find a list of all the features and functionality it provides:

- Base architecture
    - [Object oriented command definition](#object-oriented-command-definition)
    - [Promise-based command dispatching](#promise-based-command-dispatching)
- Switches and command line arguments
    - [Positional argument processing](#positional-argument-processing)
    - [Command line switch processing](#command-line-switch-processing)
    - [Required and optional parameters](#required-and-optional-values)
    - [Variadic switches and parameters](#variadic-switches-and-parameters)
    - [Switchy parameters](#switchy-parameters)
    - [`--no` prefix](#-no-prefix-processing)
    - [Shortest unique prefix matching](#shortest-unique-prefix-for-switches)
    - [Custom single-character alias](#custom-single-character-alias)
    - [Shorthand syntax](#shorthand-syntax)
        - [Minimal](#minimal)
        - [With specific type](#with-specific-type)
        - [Optional](#optional)
        - [Variadic](#variadic)
        - [Switchy](#switchy)
        - [Custom character alias](#custom-character-alias)
        - [Confirmable](#confirmable)
    - [Private switches](#private-switches)
- Type system
    - [Built-in types](#built-in-types)
    - [Custom type definition](#custom-type-definition)
- Interactive mode
    - [Configuring interactive mode](#configuring-interactive-mode)
    - [Deactivating interactive mode](#headless-mode)
    - [Confirmable parameters and switches](#confirmable-parameters-and-switches)
- Commands and sub-commands
    - [Containers and commands](#containers-and-commands)
    - [Shortest unique prefix](#shortest-unique-prefix-for-commands)
    - [Custom sub-command aliases](#subcommand-aliases)
    - [Default command](#default-command)
    - [Command chaining](#command-chaining)
    - [Private commands](#private-commands)
- Built-in help command
    - [Including the help command](#including-the-help-command)
    - [Runtime options](#runtime-options)
- Response file processing
    - [Complex command processing](#complex-command-processing)
    - [Nested file processing](#nested-file-processing)
    - [Escaping the `@` symbol](#escaping-the-symbol)

## Base architecture

### Object oriented command definition
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
More information in the [API docs](API.md)

### Promise-based command dispatching
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

## Switches and command line arguments

For the purposes of this document, `switchit` refers to command line arguments (a.k.a. positional arguments) as `parameters`
 while it uses `switches` to refer to command line switches (like --foo , -f).

### Positional argument processing
A `switchit` command can process positional arguments passed to it. For example:  
Note the use of `type: 'number'`, more information on the [Types](#types) section. 

    const Command = require('switchit').Command;
    
    class Divide extends Command {
        execute (params) {
            console.log(params.numerator / params.denominator);
        }
    }
    
    Divide.define({
        // The order of these properties defines the expected position of the arguments
        parameters: {
            numerator: {
                type: 'number'
            },
            denominator: {
                type: 'number'
            }
        }
    });
    
    new Divide().run();
    
This command will need to be invoked like this: `command <numerator> <denominator>`. Check it out:

    $ node ../examples/divide.js 10 2
    5
    
    $ node ../examples/divide.js 2 10
    0.2

### Command line switch processing
A `switchit` command can process command line switches passed to it. For example:

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

More information on the shorthand syntax (`switches: 'name'`) [below](#shorthand-syntax).  
In this example, the switch `--name` is available:

    $ node ../examples/switch.js --name John
    Hi, John!
    
You can also use `-n`:

    $ node ../examples/switch.js -n John
    Hi, John!

More information about alternate names of switches in the sections ["Shortest unique prefix"](#shortest-unique-prefix-for-switches)
and ["Custom single-character alias"](#custom-single-character-alias)

### Required and optional values
Both parameters and switches are required by default, but can be made optional by defining a default `value` for them:

    const Command = require('switchit').Command;
    
    class SayHi extends Command {
        execute (params) {
            console.log(`Hi, ${params.name}!`);
        }
    }
    
    SayHi.define({
        switches: {
            name: {
                value: 'Ringo'
            }
        }
    });
    
    new SayHi().run();
    
Sample output:

    $ node ../examples/optional.js
    Hi, Ringo!

### Variadic switches and parameters

Switches and parameters can take one or more values if configured with `vargs: true`.
Here's an example with variadic parameters:
 
    const Command = require('switchit').Command;
    
    class Sum extends Command {
        execute (params) {
            console.log(params.summand.reduce((a, b) => a + b, 0))
        }
    }
    
    Sum.define({
        parameters: {
            summand: {
                type: 'number',
                vargs: true
            }
        }
    });
    
    new Sum().run();

When run with no switches this command prints a simple message:

    $ node ../examples/sum.js 1 2 3
    6

Do note that variadic `string` parameters will consume all remaining positional arguments regardless of their type.  
The only way of moving past a variadic parameter is if it is of a type different to `string`, in which case, the first argument that doesn't 
convert to the parameter type will be assigned to the next parameter (if any).

For example:

    const Command = require('switchit').Command;
    
    class Sum extends Command {
        execute (params) {
            console.log(`Hi, ${params.name}!`);
            console.log(params.summand.reduce((a, b) => a + b, 0));
        }
    }
    
    Sum.define({
        parameters: {
            summand: {
                type: 'number',
                vargs: true
            },
            name: {
                type: 'string'
            }
        }
    });
    
    new Sum().run();
    
Sample output:

    $ node ../examples/past-variadic.js 1 2 3 Bart
    Hi, Bart!
    6

### 'Switchy' parameters

Parameters can also expose themselves as switches with the property `switch: true`,
giving the user the possibility of specifying them either way. Here's an example:

    const Command = require('switchit').Command;
    
    class SayHi extends Command {
        execute (params) {
            console.log(`Hi, ${params.name}!`);
        }
    }
    
    SayHi.define({
        parameters: {
            name: {
                switch: true
            }
        }
    });
    
    new SayHi().run();

Now you can specify `name` both as a positional argument and a switch:

    $ node ../examples/switchy.js Homer
    Hi, Homer!
    $ node ../examples/switchy.js --name Marge
    Hi, Marge!

### `--no` prefix processing

`switchit` understands switches like: `--no-color` and treats them as `--color=false`, check it out:

    const Command = require('switchit').Command;
    
    class Program extends Command {
        execute (params) {
            if (params.output) {
                console.log("Some output here!");
            }
        }
    }
    
    Program.define({
        switches: {
            output: {
                type: "boolean",
                value: true
            }
        }
    });
    
    new Program().run();
    
Sample output:

    $ node ../examples/no-prefix.js
    Some output here!
    $ node ../examples/no-prefix.js --no-output

### Shortest unique prefix

`switchit` is able to identify a switch by its shortest unique prefix. For example:

    const Command = require('switchit').Command;
    
    class Program extends Command {
        execute (params) {
            console.log(params);
        }
    }

    Program.define({
        switches: {
            detach: {
                type: 'boolean',
                value: false
            },
            debug: {
                type: 'boolean',
                value: true
            }
        }
    });
    
    new Program().run();
    
The shortest unique prefix for `detach` is `det` and for `debug` is `deb` in this case:

    $ node ../examples/sup.js --det --deb
    { detach: true, debug: false }

Trying to use a non-unique prefix results in an error:

    $ node ../examples/sup.js --d
    "d" matches multiple switches for Program: detach, debug

### Custom single character alias 

In the example above, you can break the ambiguity by specifying a case sensitive single-character alias for one or more
switches using the `char` property:

    const Command = require('switchit').Command;
    
    class Program extends Command {
        execute (params) {
            console.log(params);
        }
    }
    
    Program.define({
        switches: {
            detach: {
                type: 'boolean',
                value: false,
                char: 'd'
            },
            debug: {
                type: 'boolean',
                value: true,
                char: 'D'
            }
        }
    });
    
    new Program().run().catch((e) => {
        console.log(e.message);
    });

Sample output:

    $ node ../examples/char.js -D -d
    { debug: false, detach: true }

### Shorthand syntax

Specifying switches and parameters can be way less verbose using a shorthand syntax, where all configurations above can be
specified using a string with special notation.

You can find an outline of each possible case below.

#### Minimal
The minimal specification for a switch or parameter is to just define its name:

    Program.define({
        switches: 'foo',
        parameters: 'bar'
    });
    
Which is equivalent to (all other properties use their default values):

    Program.define({
        switches: [{
            name: 'foo',
            type: 'string',
            required: true
            vargs: false,
            switch: false
            char: null,
            confirmable: false
        }],
        parameters: [{
            name: 'bar',
            type: 'string',
            required: true
            vargs: false,
            switch: false
            char: null,
            confirmable: false
        }]
    });

Moving forward in this section, only the shorthand string will be showcased.

#### With specific type
A semicolon after the name announces the start of the type name. (Same as specifying `type`).

    switches: 'foo:boolean bar:number baz:semver xyz:string',
    parameters: 'foo:boolean bar:number baz:semver xyz:string'

More information about built-in types [here](#types).

#### Optional
Wrapping each declaration with square brackets marks this switch or parameter indicates that a default value will be provided.

    switches: '[foo:boolean=true] [bar:number=42] [baz:semver=1.2.3-alpha] [xyz=test]',
    parameters: '[foo:boolean=true] [bar:number=42] [baz:semver=1.2.3-alpha] [xyz=test]'

Omitting the `:type` part will default it to `:string`

#### Variadic
Variadic switches and parameters are indicated with `[]` or `...` after the type name:

    switches: 'foo:boolean[] bar:number... baz:semver[] xyz:string[]',
    parameters: 'foo:boolean[] bar:number... baz:semver[] xyz:string[]'

#### Switchy
**Only applicable to parameters**  
Wrapping a declaration in curly braces indicates this is a _'Switchy'_ parameter, meaning that is also available as a switch.

    parameters '{foo:boolean} {[bar:number=42]} [{baz:semver=1.2.3-alpha}] {xyz:string[]}'
    
Note that it can be combined with the syntax for specific type, optional and variadic.

#### Custom character alias
**Only applicable to switches**
The custom single character alias for a switch can be specified with the help of the `#` character:

    switches: 'f#foo:boolean b#bar:number=42 {B#baz:semver} [x#xyz:string...]'
     
#### Confirmable
When using interactive mode, if you want an optional switch to be included in the list of prompted items, add a `?` character
before the `=` sign:

    switches: '[foo:boolean?=true] [bar:number?=42] [baz:semver?=1.2.3-alpha] [xyz?=test]',
    parameters: '[foo:boolean?=true] [bar:number?=42] [baz:semver?=1.2.3-alpha] [xyz?=test]'

More information about confirmable parameters and switches can be found in the [Interactive](#confirmable-parameters-and-switches) section

### Private switches
If your command contains some feature flags to enable experimental or private features, you can always prevent the
switch from appearing in help output using the `private: true` configuration.

    const {
        Container,
        Help
    } = require('switchit');
    
    class Bar extends Container {}
    
    Bar.define({
        switches: {
            foo: {
                value: false,
                private: true
            }
        },
        commands: {
            help: Help
        }
    });
    
    new Bar().run();
    
(If this example doesn't make a lot of sense yet, check the ["Nested command hierarchy"](#nested-command-hierarchy) section.)
When running the help command, private switches are not visible:

    $ node ../examples/private.js help
    Bar
    Syntax
      bar [options] [command] Executes a command

Do note that when passing the `-a / --all` switch to the `help` command, these are visible:
 
    $ node ../examples/private.js help -a
    Bar
    Syntax
      bar                     Display help for a given command
      bar [options] [command] Executes a command
    
    Available commands:
      · help                    Display help for a given command
    
    Run Bar help [command] for more information on a command.

More information about the built in help command [here](#built-in-help-command).

## Type system

### Built-in types

Built-in types are defined in [`Type.js`](../src/Type.js):

- Boolean: One of: truefalse|yes|no|on|off
- Number: A numerical value
- Semver: A SemVer version, parseable by node-semver
- String: A plain-old string (like this one!)

### Custom type definition

If you need to define a custom type you can use the static `.define` method of `Type`:

    // TODO example
    
## Interactive mode

### Configuring interactive mode
TODO

### Deactivating interactive mode
TODO

### Confirmable parameters and switches
TODO

## Commands and sub-commands

### Containers and commands

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

Our [`npm` mock application](../examples/npm) includes an `npm-noalias.js` version to illustrate this:
 
    $ node examples/npm-noalias.js i
    "i" matches multiple commands for Npm: init, install
    $ node examples/npm-noalias.js ins
    install takes place here...

### Custom sub-command aliases

Containers, commands, switches and parameters can all specify custom aliases. For example, to
disambiguate non-unique prefixes. To illustrate this, our [`npm` mock application](../examples/npm)
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

### Default command

The "empty string" command specifies the action a command container should take when no
sub-command is specified. Our [`git` mock application](../examples/git)'s `remote` command has a
special [`ListRemote`](../examples/git/remote/ls.js) command as default. These are the contents
of [`examples/git/remote/index.js`](../examples/git/remote/index.js):

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

### Command chaining

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

In the example above, there's not a lot of difference in terms of output, but you avoided the cost
of relaunching `git` each time which, depending on what your program does at launch, can be quite
costly in terms of performance.

### Private commands
TODO

## Built-in help command
Command containers automatically provide basic help output when no command is specified. Using our
previous `coffeehouse-simple.js` example, check this out:

    $ node examples/coffeehouse-simple.js

     Coffeehouse
     
     Available sub-commands:
      * coffee
      * tea
     
     Syntax:
       coffeehouse [subcommand]

### Including the help command
Help can also be included as a command on your program, here we've added it to our
`coffeehouse-simple.js` example and is available at [`examples/help.js`](examples/help.js):
    
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

## Response file processing

### Complex command processing
Sometimes you want to execute a set of commands on a regular basis and don't want to write it to
the console each time. For example, let's use that coffee brewing example above and define two
files for our favourite coffee and tea recipes (one argument per line).

This would be our `coffee.txt` file (indented for readability):

    coffee
        Caramel
        Cinnamon
        Whipped Cream

And this would be our `tea.txt` file (again, indented for readability):

    tea
        Honey
        Lime
        
`switchit` can read these files so that each line is taken to be a command line argument, unless
that line begins with `#` in which case it is skipped.

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
    
### Nested file processing
All lines from the specified file are inserted into the command line arguments as if they had
been typed there instead of "@{file}". For example, a `coffe-and-tea.txt` file can contain
response file insertions as well:

    @coffe.txt
    and
    @tea.txt

Now if you try to run this, not only the command line argument is expanded but any `@{file}`
lines on it as well (paths are relative to the current working directory):
    
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
    
### Escaping the `@` symbol
If you want to use the `@` symbol on any of your switch values or parameters, you can
escape it as `@@`:

    $ node examples/simple2.js @@Example
    Hi, @Example!