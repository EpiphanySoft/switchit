# A `git` mock app built on top of `switchit`
This command attempts to implement a mock version of `git` to demonstrate how it could be built on top of `switchit`.

## Showcased features
* [x] Optional and required switches (See [`pull.js`](pull.js))
* [x] Nested command hierarchy (Available command containers: `remote`, `submodule`. See [`index.js`](index.js))
* [x] Custom aliases (Try running `node git.js ?`)
* [x] Default container sub-command (Try running `node git.js remote`, see [`remote/index.js`](remote/index.js))
* [x] Built-in help

## How to run this example

Use [`../git.js`](../git.js):

    $ node git.js  
     
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
        
## How it works

[`../git.js`](../git.js) includes the `Git` class from [`index.js`](index.js) and starts the example:

    const Git = require('./git/index.js');
    const git = new Git();
    
    // This will catch any errors and only log the error message
    // (instead of dumping the whole object to the console)
    git.run().catch(err => {
        console.error(err.message);
        process.exit(1);
    });

The `Git` class (located at [`index.js`](index.js)) requires all available commands and categories as well as the built-in Help command, then defines itself as a subclass of `Container`.

    const {
        Container,
        Help
    } = require('../../index.js');
    
    const Commit = require('./commit');
    const Fetch = require('./fetch');
    const Pull = require('./pull');
    const Remote = require('./remote');
    
    class Git extends Container {
        //
    }
    
    Git.define({
        title: 'git',
        help: 'the stupid content tracker',
        commands: {
            '?': 'help',
    
            help: Help,
            commit: Commit,
            fetch: {
                type: Fetch
            },
            pull: {
                type: Pull
            },
            remote: Remote
        }
    });
    
    module.exports = Git;
