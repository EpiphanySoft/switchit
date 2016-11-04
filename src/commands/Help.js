'use strict';

const columnify = require('columnify');
const marked = require('marked');
const chalk = require('chalk');
const MarkedTerminal = require('marked-terminal');
const stripAnsi = require('strip-ansi');

const Container = require('../Container');
const Command = require('../Command');

class Help extends Command {
    static columnify (items, linePadding = 2, linePrefix = '') {
        return columnify(items, {
            config: {
                name: {
                    minWidth: 25
                }
            },
            preserveNewLines: true,
            maxWidth: 80,
            showHeaders: false
        }).split("\n").map((line) => `${' '.repeat(linePadding)}${line.trim().startsWith('(') ? ' '.repeat(linePrefix.length) : linePrefix}${line}`).join("\n");
    }
    // --------------------------------

    beforeExecute (params) {
        super.beforeExecute(params);
        if (params.markdown && params.html) {
            this.raise('Conflicting switches "markdown" and "html" specify only one.');
        }
    }

    execute (params) {
        let me = this;

        me.out.reset();

        me.normalizeSubject(params);

        me.showHeader(params);
        me.showSyntax(params);
        me.showOptions(params);

        if (params.target.isContainer) {
            me.showCommands(params);
        }

        me.printOutput();
    }

    normalizeSubject (params) {
        let rootCmd = this.root();
        let target = rootCmd.constructor;

        if (params.subject.length === 0) {
            let parent = this.parent;
            if (rootCmd !== parent) {
                params.subject.push(parent.name);
            }
        }

        params.subject = params.subject.map((subject) => {
            target = target.commands.lookup(subject);
            if (!target) {
                this.raise(`No such command or category "${subject}"`);
            }
            let name = target.name;
            target = target.type;
            return name;
        });

        params.target = target;
    }

    showHeader (params) {
        let me = this,
            root = me.root().constructor,
            target = params.target,
            name = target.name,
            help = target.help;

        if (root === target) {
            params.subject = [name];
        }
        else if (target.isContainer || target.isCommand) {
            params.subject.unshift(root.name.toLowerCase());
        }

        this.out.appendLn(this.h1(`${me.bold(params.subject.join(' '))}${help ? ': ' + help : ''}`)).appendLn();
    }

    showSyntax (params) {
        let subject = params.subject,
            fullName = subject.join(' ').toLowerCase(),
            target = params.target,
            aspects = target.getAspects(params.all);

        this.out.appendLn(this.h2('Syntax'));

        let syntaxParts = [];
        if (target.isContainer) {
            if (aspects.defaultCmd) {
                syntaxParts.push(this.buildSyntaxPart(fullName, aspects.defaultCmd.help));
            }
        }

        syntaxParts.push(this.buildSyntaxPart(fullName, '', aspects.switches.length, target.isContainer, aspects.parameters));
        this.out.appendLn(Help.columnify(syntaxParts)).appendLn();
    }

    buildSyntaxPart (name, help, hasOptions = false, isContainer = false, parameters = []) {
        if (hasOptions) {
            name = `${name} [options]`;
        }
        if (isContainer) {
            name = `${name} [command]`;
            help = 'Executes a command';
        }
        else if (parameters.length > 0) {
            let params = [];
            parameters.forEach((parameter) => {
                if (!parameter) return;
                params.push(`${parameter.optional ? '[' : ''}${parameter.name}${parameter.vargs ? '...' : ''}${parameter.optional ? ']' : ''}`)
            });
            name = `${name} ${params.join(' ')}`;
        }
        return {
            name: this.code(name),
            help: help ? this.em(help) : ''
        }
    }

    showOptions (params) {
        let me = this,
            target = params.target,
            aspects = target.getAspects(params.all);

        if (aspects.switches.length > 0) {
            let switchCount = 0;
            aspects.switches.sort((a,b) => {
                if (!a || !b) return 0;
                return a.name > b.name;
            }).forEach((s) => { if (s) {switchCount++;} })

            if (switchCount > 0) {
                me.out.appendLn(this.h2('Available options:'));
                let options = [];
                aspects.switches.forEach(function (option) {
                    if (!option) return;
                    options.push(me.buildOptionPart(option.name, option.type, option.help, option.value, option.vargs));
                });
                options.forEach(function (opt) {
                    opt.name = `${opt.name} (${opt.type})`;
                    delete opt.type;
                });
                me.out.appendLn(Help.columnify(options, 2, '· ')).appendLn();
            }

        }
    }

    buildOptionPart (name, type, help='', value, vargs) {
        return {
            name: this.code(`--${name}`),
            type: `${type}`,
            help: this.em(`${help}${(value !== undefined) ? (!!help ? '\n' : '') + '(default: ' + (vargs ? '[]' : value) + ')' : (!!help ? '\n' : '') + '(required)'}`)
        };
    }

    showCommands (params) {
        let me = this,
            target = params.target,
            aspects = target.getAspects(params.all);

        if (aspects.commands.length > 0) {
            let hasContainers = false;
            let commandCount = 0;
            aspects.commands.sort((a,b) => {
                if (!a || !b) return 0;
                if (a.container || b.container) hasContainers = true;
                return a.name > b.name;
            }).forEach((c) => { if (c) {commandCount++;} });

            if (commandCount > 0) {
                me.out.append(this.h2("Available commands"));
                if (hasContainers) {
                    me.out.append(` (${chalk.cyan('»')}: has sub-commands)`);
                }
                me.out.appendLn(":");
                let commands = [];
                aspects.commands.forEach(function (cmdlet) {
                    if (!cmdlet) return;
                    commands.push(me.buildCommandPart(cmdlet.name, cmdlet.help, cmdlet.container, cmdlet.aliases));
                });
                me.out.appendLn(Help.columnify(commands, 2, '· ')).appendLn().appendLn("Run " + this.code(`${this.fullName} [command]`) + " for more information on a command.");
            }
        }
    }

    buildCommandPart (name, help = '', isContainer = false, aliases = []) {
        return {
            name: `${this.code(name)}${isContainer ? ' ' + chalk.cyan('»') : ''}`,
            help: `${help}${aliases.length > 0 ? '\n(also known as: ' + aliases.join(', ') + ')': ''}`
        }
    }

    printOutput () {
        let out = this.out.flush();

        if (!this.params.markdown) {
            if (!this.params.html) {
                marked.setOptions({
                    renderer: new MarkedTerminal({
                        showSectionPrefix: false
                    })
                });
            } else {
                marked.setOptions({
                    renderer: new marked.Renderer()
                });
            }
            out = marked(out);
        }

        if (!this.params.color) {
            out = stripAnsi(out);
        }

        console.log(out.split('\n').map((l) => l.replace(/\s+$/, '')).join('\n'));
    }
}

Object.assign(Help.prototype, {
    out: {
        _buffer: [],

        LINE_BREAK: '\n',

        appendLn (str) {
            this.append(str);
            this.append(this.LINE_BREAK);
            return this;
        },

        append (str) {
            this._buffer.push(str);
            return this;
        },

        reset () {
            this._buffer = [];
            return this;
        },

        flush () {
            let out = this._buffer.join('');
            this.reset();
            return out.trim();
        }
    },

    h1 (str) {
        return `# ${str}`;
    },

    h2 (str) {
        return `## ${str}`;
    },

    bold (str) {
        return `**${str}**`;
    },

    em (str) {
        return `*${str}*`;
    },

    code (str) {
        return `\`${str}\``;

    }
});

Help.define({
    help: {
        '': 'Display help for a given command',

        all: 'Display help for internal, experimental and private commands and switches',
        markdown: 'Display help in raw markdown syntax',
        html: 'Display help output in html',
        color: 'Use ANSI escape codes to colorize output',
        subject: 'The command or category for which to display help.'
    },

    switches: '[markdown:boolean=no] [all:boolean=no] [color:boolean=true] [html:boolean=false]',
    parameters: '[subject...]'
});
module.exports = Help;
