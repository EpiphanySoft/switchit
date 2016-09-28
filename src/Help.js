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
        params.subject.forEach(function (subject) {
            target = target.commands.lookup(subject);
            if (!target) {
                throw new Error(`No such command or category "${subject}"`);
            }
            else {
                target = target.type;
            }
        });

        // Show the help title, the program name for the main 'help' call or the category/comamnd name for other calls
        if (rootCmd.constructor == target) {
            target = rootCmd.constructor;
            out.push('');
            out.push(`${rootCmd.constructor.name}${rootCmd.constructor.help ? ': ' + rootCmd.constructor.help : ''}`);
        } else {
            out.push('');
            out.push(`${rootCmd.constructor.command} ${params.subject.join(' ')}: ${target.help ? target.help : ''}`);
        }

        if (target.switches.items.length > 0) {
            out.push('');
            out.push('Available options:');
            target.switches.items.forEach(function (option) {
                out.push(` * --${option.name}: ${option.help}`);
            });
        }

        if (target.isContainer && target.commands.items.length > 0) {
            let containers = [];
            let commands = [];
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
                out.push('Available categories:');
                containers.forEach(function (container) {
                    out.push(` - ${container.name}${container.type.help ? ': ' + container.type.help : ''}`);
                });
            }

            if (commands.length > 0) {
                out.push('');
                out.push('Available commands:');
                commands.forEach(function (command) {
                    out.push(` - ${command.name}${command.type.help ? ': ' + command.type.help : ''}`);
                });
            }
        }

        this.printOutput(out, 1);
    }

    printOutput (strArr, leftPad = 0) {
        strArr = strArr.map(ln => `${' '.repeat(leftPad)}${ln}`);
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
