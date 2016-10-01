"use strict";

const Container = require('./Container');
const Command = require('./Command');

/**
 * This class manages a case-insensitive collection of named switches.
 * @private
 */
class Help extends Command {
    execute (params) {
        let rootCmd = this.root();

        // Lines of output will be pushed here then concatenated
        let out = [];
        let syntax = [];

        // If there are no arguments, could be something like: `{program}` or `{program} help|h|?` or `{program} {category...}` (e.g. 'git', 'git help', 'git remote')
        if (params.subject.length === 0) {
            // If this is a "category root" call, something like `{program} {someCat}` (e.g. "git remote")
            // push the parent as if it was passed like an argument, so `{program} {someCat}` becomes `{program} help {someCat}` (e.g.: git remote -> git help remote)
            let parent = this.parent;
            if (rootCmd !== parent) {
                params.subject.push(parent.name);
            }
        }

        // Let's now make sure the supplied chain of arguments is something we know of
        let target = rootCmd.constructor;
        // We're taking advantage of the resolution process to get the real name of each subject part (git r a -> git remote add)
        params.subject = params.subject.map(function (subject) {
            target = target.commands.lookup(subject);
            if (!target) {
                throw new Error(`No such command or category "${subject}"`);
            }

            let name = target.name;
            target = target.type;
            return name;
        });

        // Show the help title, the program name for the main 'help' call or the category/command name for other calls
        if (rootCmd.constructor == target) {
            target = rootCmd.constructor;
            // This will display something like "Git: the stupid content tracker"
            out.push('');
            out.push(`${rootCmd.constructor.name}${rootCmd.constructor.help ? ': ' + rootCmd.constructor.help : ''}`);
        } else {
            // This will display something like "git remote add: Adds a remote reference..."
            out.push('');
            out.push(`${rootCmd.constructor.name.toLowerCase()} ${params.subject.join(' ')}${target.help ? ': ' + target.help : ''}`);
        }

        let fullName = `${rootCmd.constructor.name.toLowerCase()}${params.subject.length > 0 ? ' ' + params.subject.join(' '): ''}`;
        // This will display something like "git", "git remote add"
        syntax.push(fullName);

        if (target.switches.items.length > 0) {
            out.push('');
            out.push('Available options:');
            target.switches.items.forEach(function (option) {
                // Example:
                //  * --message (string)    The commit message
                //  * --some-optional (string)  An optional variadic switch (default: [])
                out.push(` * --${option.name} (${option.type})${option.help ? ':\t' + option.help + '\t' : ''}${option.value !== undefined ? ' (default: ' + (option.vargs ? '[]' : option.value) + ')' : ''}`);
            });
            // Since we have options, push their placeholder into the syntax string
            syntax.push('[options]');
        }

        if (target.isContainer && target.commands.items.length > 0) {
            let containers = [];
            let commands = [];
            let syntaxTokenParts = [];
            let defaultCmd;
            target.commands.items.forEach(function (cmdlet) {
                if (cmdlet.type.isContainer) {
                    containers.push(cmdlet);
                }
                else if (cmdlet.type.isCommand) {
                    commands.push(cmdlet);
                }
            });

            if (containers.length > 0) {
                out.push('');
                out.push('Available command containers:');
                containers.forEach(function (ct) {
                    // Example:
                    //  * remote:        Commands to manage remote...
                    out.push(` * ${ct.name}${ct.type.help ? ':\t' + ct.type.help + '\t' : ''}${ct.aliases.length > 0 ? ' (or ' + ct.aliases.join(', ') + ')': ''}`);
                });
                syntaxTokenParts.push('container');
            }

            if (commands.length > 0) {
                out.push('');
                out.push('Available sub-commands:');
                commands.forEach(function (command) {
                    if (command.name === "default") {
                        defaultCmd = command;
                        if (defaultCmd.type.help) {
                            syntax.unshift(`${fullName}\t${defaultCmd.type.help}\n  `);
                        }
                    }
                    else {
                        // Example:
                        //  * help:       This command ...
                        out.push(` * ${command.name}${command.type.help ? ':\t' + command.type.help + '\t' : ''}${command.aliases.length > 0 ? ' (or ' + command.aliases.join(', ') + ')': ''}`);
                    }
                });
                syntaxTokenParts.push('subcommand');
            }

            // This container has additional containers and/or commands, push the placeholder into the syntax string
            syntax.push(`${defaultCmd ? '(' : '[' }${syntaxTokenParts.join('|')}${defaultCmd ? ')\tExecute subcommand' : ']' }`);
        }

        if (target.isCommand && target.parameters && target.parameters.items.length > 0) {
            // This command accepts named positional arguments, push them into the syntax string
            target.parameters.items.forEach(function (parameter) {
                // requiredArg [optionalArg] variadicRequiredArg... [variadicOptionalArg...]
                syntax.push(`${parameter.optional ? '[' : ''}${parameter.name}${parameter.vargs ? '...' : ''}${parameter.optional ? ']' : ''}`);
            });
        }

        // Construct the syntax string and add it to the output
        out.push('');
        out.push(`Syntax:`);
        out.push(`  ${syntax.join(' ')}`);
        this.printOutput(out, 1);
    }

    printOutput (strArr, indent = 0) {
        strArr = strArr.map(ln => `${' '.repeat(indent)}${ln}`);
        // TODO: markdown support
        console.log(strArr.join('\n'));
    }
}

Help.define({
    help: 'This command displays help for other commands',

    switches: {
        markdown: {
            help: 'Display help in markdown format',
            type: 'boolean',
            value: false
        },
        all: {
            help: 'Display help for internal, experimental and private commands and switches',
            type: 'boolean',
            value: false
        }
    },

    parameters: {
        subject: {
            vargs: true,
            type: 'string',
            value: []
        }
    }
});

module.exports = Help;
