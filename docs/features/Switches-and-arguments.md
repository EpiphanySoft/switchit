# Switches and command line arguments

For the purposes of this document, `switchit` refers to command line arguments (a.k.a. positional arguments) as `parameters`
 while it uses `switches` to refer to command line switches (like --foo , -f).

## Positional argument processing
A `switchit` command can process positional arguments passed to it. For example:  
Note the use of `type: 'number'`, more information on the [Type system](Types.md#type-system) section. 

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

    $ node ../../examples/divide.js 10 2
    5
    
    $ node ../../examples/divide.js 2 10
    0.2

## Command line switch processing
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

    $ node ../../examples/switch.js --name John
    Hi, John!
    
You can also use `-n`:

    $ node ../../examples/switch.js -n John
    Hi, John!

More information about alternate names of switches in the sections [Shortest unique prefix matching](#shortest-unique-prefix)
and [Custom single-character alias](#custom-single-character-alias)

## Required and optional values
Both switches and parameters are required by default, but can be made optional by defining a default `value` for them:

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

    $ node ../../examples/optional.js
    Hi, Ringo!

## Variadic switches and parameters

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

    $ node ../../examples/sum.js 1 2 3
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

    $ node ../../examples/past-variadic.js 1 2 3 Bart
    Hi, Bart!
    6

## 'Switchy' parameters

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

    $ node ../../examples/switchy.js Homer
    Hi, Homer!
    $ node ../../examples/switchy.js --name Marge
    Hi, Marge!

## `--no` prefix processing

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

    $ node ../../examples/no-prefix.js
    Some output here!
    $ node ../../examples/no-prefix.js --no-output

## Shortest unique prefix

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

    $ node ../../examples/sup.js --det --deb
    { detach: true, debug: false }

Trying to use a non-unique prefix results in an error:

    $ node ../../examples/sup.js --d
    "d" matches multiple switches for Program: detach, debug

## Custom single character alias 

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

    $ node ../../examples/char.js -D -d
    { debug: false, detach: true }

## Shorthand syntax

Specifying switches and parameters can be way less verbose using a shorthand syntax, where all configurations above can be
specified using a string with special notation.

You can find an outline of each possible case below.

### Minimal
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

### With specific type
A semicolon after the name announces the start of the type name. (Same as specifying `type`).

    switches: 'foo:boolean bar:number baz:semver xyz:string',
    parameters: 'foo:boolean bar:number baz:semver xyz:string'

More information about built-in types [here](Types.md#type-system).

### Optional
Wrapping each declaration with square brackets marks this switch or parameter indicates that a default value will be provided.

    switches: '[foo:boolean=true] [bar:number=42] [baz:semver=1.2.3-alpha] [xyz=test]',
    parameters: '[foo:boolean=true] [bar:number=42] [baz:semver=1.2.3-alpha] [xyz=test]'

Omitting the `:type` part will default it to `:string`

### Variadic
Variadic switches and parameters are indicated with `[]` or `...` after the type name:

    switches: 'foo:boolean[] bar:number... baz:semver[] xyz:string[]',
    parameters: 'foo:boolean[] bar:number... baz:semver[] xyz:string[]'

### Switchy
**Only applicable to parameters**  
Wrapping a declaration in curly braces indicates this is a _'Switchy'_ parameter, meaning that is also available as a switch.

    parameters '{foo:boolean} {[bar:number=42]} [{baz:semver=1.2.3-alpha}] {xyz:string[]}'
    
Note that it can be combined with the syntax for specific type, optional and variadic.

### Custom character alias
**Only applicable to switches**
The custom single character alias for a switch can be specified with the help of the `#` character:

    switches: 'f#foo:boolean b#bar:number=42 {B#baz:semver} [x#xyz:string...]'
     
### Confirmable
When using interactive mode, if you want an optional switch to be included in the list of prompted items, add a `?` character
before the `=` sign:

    switches: '[foo:boolean?=true] [bar:number?=42] [baz:semver?=1.2.3-alpha] [xyz?=test]',
    parameters: '[foo:boolean?=true] [bar:number?=42] [baz:semver?=1.2.3-alpha] [xyz?=test]'

More information about confirmable switches and parameters can be found in the [Interactive.md](Interactive.md#confirmable-switches-and-parameters) file

## Private switches
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
    
(If this example doesn't make a lot of sense yet, check the [Command containers](Commands-and-subcommands.md#command-containers) feature.)
When running the help command, private switches are not visible:

    $ node ../../examples/private.js help
    Bar
    Syntax
      bar [options] [command] Executes a command

Do note that when passing the `-a / --all` switch to the `help` command, these are visible:
 
    $ node ../../examples/private.js help -a
    Bar
    Syntax
      bar                     Display help for a given command
      bar [options] [command] Executes a command
    
    Available commands:
      · help                    Display help for a given command
    
    Run Bar help [command] for more information on a command.

More information about the built in help command [here](Help-command.md#built-in-help-command).