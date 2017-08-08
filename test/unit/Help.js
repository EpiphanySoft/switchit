'use strict';

const path = require('path');
const expect = require('expect.js');

const Container = require('../../src/Container');
const Command = require('../../src/Command');
const Help = require('../../src/commands/Help');

const Util = require('../util.js');

class FooNoHelp extends Command {}
FooNoHelp.define({
    switches: {
        abc: {
            type: 'string',
            value: 'foo'
        },
        def: {
            type: 'number'
        },
        fgh: {
            type: 'boolean',
            value: true,
            private: true
        },
        ijk: {
            type: 'string',
            vargs: true,
            value: []
        }
    },
    parameters: {
        lmn: {
            type: 'number',
            value: 9
        },
        opq: {
            type: 'string',
            vargs: true,
            value: []
        }
    }
});

class BarNoHelp extends Container {}

BarNoHelp.define({
    switches: {
        rst: {
            type: 'string',
            value: 'test'
        }
    },
    commands: {
        uvw: FooNoHelp,
        help: Help
    }
});

class Foo extends Command {}
Foo.define({
    help: {
        '': 'The quick',
        abc: 'brown fox',
        def: 'jumps over',
        fgh: 'the lazy',
        ijk: 'dog.',
        lmn: 'Lorem ipsum',
        opq: 'dolor sit'
    },
    switches: {
        abc: {
            type: 'string',
            value: 'foo'
        },
        def: {
            type: 'number'
        },
        fgh: {
            type: 'boolean',
            value: true,
            private: true
        },
        ijk: {
            type: 'string',
            vargs: true,
            value: []
        }
    },
    parameters: {
        lmn: {
            type: 'number',
            value: 9
        },
        opq: {
            type: 'string',
            vargs: true,
            value: []
        }
    }
});

class Bar extends Container {}

Bar.define({
    help: {
        '': 'The quick brown fox',
        rst: 'jumps over the lazy dog.'
    },
    switches: {
        rst: {
            type: 'string',
            value: 'test'
        }
    },
    commands: {
        uvw: Foo,
        xyz: 'uvw',
        help: Help
    }, 
    logo: {
        version: '1.0.0'
    }
});

describe('Help', function () {
    it('should show a help page even if no help texts are defined', function (done) {
        var bar = new BarNoHelp();

        Util.resolves(function () {
            Util.resolves(done, Util.capturesStdout(() => {
                return bar.run(['help', '-color', 'uvw']);
            }).then(out => {
                expect(out).to.equal(Util.getFileContents(path.join(Util.getTestSourceFilesDir(), 'help', 'no-help-texts-cmd.txt')));
            }));
        }, Util.capturesStdout(() => {
            return bar.run(['help', '-color']);
        }).then(out => {
            expect(out).to.equal(Util.getFileContents(path.join(Util.getTestSourceFilesDir(), 'help', 'no-help-texts-cont.txt')));
        }));
    });

    it('should allow defining help tests for commands, parameters and switches as well as for the defining object', function (done) {
        var bar = new Bar();

        Util.resolves(function () {
            Util.resolves(done, Util.capturesStdout(() => {
                return bar.run(['help', '-color', 'uvw']);
            }).then(out => {
                expect(out).to.equal(Util.getFileContents(path.join(Util.getTestSourceFilesDir(), 'help', 'all-help-texts-cmd.txt')));
            }));
        }, Util.capturesStdout(() => {
            return bar.run(['help', '-color']);
        }).then(out => {
            expect(out).to.equal(Util.getFileContents(path.join(Util.getTestSourceFilesDir(), 'help', 'all-help-texts-cont.txt')));
        }));
    });

    it('should provide a way to output raw markdown', function (done) {
        var bar = new Bar();

        Util.resolves(done, Util.capturesStdout(() => {
            return bar.run(['help', '-markdown']);
        }).then(out => {
            expect(out).to.equal(Util.getFileContents(path.join(Util.getTestSourceFilesDir(), 'help', 'markdown.md')));
        }));
    });

    it('should provide a way to output html', function (done) {
        var bar = new Bar();

        Util.resolves(done, Util.capturesStdout(() => {
            return bar.run(['help', '-html']);
        }).then(out => {
            expect(out).to.equal(Util.getFileContents(path.join(Util.getTestSourceFilesDir(), 'help', 'html.html')));
        }));
    });

    it('should not allow passing both markdown and html switches', function (done) {
        var bar = new Bar();

        Util.rejects(done, 'Conflicting switches "markdown" and "html" specify only one.', Util.capturesStdout(() => {
            return bar.run(['help', '-html', '-markdown']);
        }));
    });

    it('should support being a nested command (not child of root)', function (done) {
        class Baz extends Container {}
        Baz.define({
            commands: {
                bar: Bar,
                asd: 'bar'
            }
        });
        Util.resolves(done, Util.capturesStdout(() => {
            return new Baz().run(['bar', 'help',  '-color']);
        }).then(out => {
            expect(out).to.equal(Util.getFileContents(path.join(Util.getTestSourceFilesDir(), 'help', 'nested.txt')));
        }));
    });

    it('should show if a command has subcommands', function (done) {
        class Baz extends Container {}
        Bar.define({
            commands: {
                baz: Baz
            }
        });
        Util.resolves(done, Util.capturesStdout(() => {
            return new Bar().run(['help',  '-color']);
        }).then(out => {
            expect(out).to.contain('(»: has sub-commands)');
            expect(out).to.contain('· baz »');
        }));
    });

    it('should reject the promise if an invalid command was specified', function (done) {
        var bar = new Bar();

        Util.rejects(done, 'No such command or category "derp"', Util.capturesStdout(() => {
            return bar.run(['help', 'derp']);
        }));
    });

    it('should display two syntax lines when a custom default command is present', function (done) {
        class Abc extends Command {}
        class Def extends Container {}

        Abc.define({
            help: 'Run command abc'
        });

        Def.define({
            commands: {
                '': Abc,
                help: Help
            }
        });

        var def = new Def();

        Util.resolves(done, Util.capturesStdout(() => {
            return def.run(['help', '-color']);
        }).then(out => {
            expect(out).to.contain('def                     Run command abc');
            expect(out).to.contain('def [options] [command] Runs [command]');
        }));
    });

    it('should display aliases of commands', function (done) {
        class Abc extends Command {}
        class Def extends Container {}

        Abc.define({
            help: 'Run command abc'
        });

        Def.define({
            commands: {
                abc: Abc,
                help: Help,
                foo: 'abc',
                bar: 'foo'
            }
        });

        var def = new Def();

        Util.resolves(done, Util.capturesStdout(() => {
            return def.run(['help', '-color']);
        }).then(out => {
            expect(out).to.contain('(also known as: foo, bar)');
        }));
    });

    it('should not show "Commands" if all commands are private or "special" (default, help)', function (done) {
        class Abc extends Command {}
        class Def extends Command {}
        class Ghi extends Container {}

        Abc.define({
            help: 'Run command abc'
        });

        Def.define({
            help: 'I\'m a private command'
        });

        Ghi.define({
            commands: {
                '': Abc,
                help: Help,
                def: {
                    type: Def,
                    private: true
                }
            }
        });

        var ghi = new Ghi();

        Util.resolves(done, Util.capturesStdout(() => {
            return ghi.run(['help', '-color']);
        }).then(out => {
            expect(out).not.to.contain("Commands:");
        }));
    });

    it('should not show private switches nor parameters', function (done) {
        class Abc extends Command {}
        class Def extends Command {}
        class Ghi extends Container {}

        Abc.define({
            help: 'Run command abc',
            switches: {
                test: {
                    type: 'string',
                    value: '123'
                },
                priv: {
                    private: true,
                    value: false,
                    type: 'boolean'
                },
                foo: {
                    type: 'string',
                    value: '456'
                }
            },
            parameters: {
                asdf: {
                    type: 'string',
                    value: '123'
                },
                privateParam: {
                    private: true
                }
            }
        });

        Ghi.define({
            commands: {
                abc: Abc,
                help: Help
            }
        });

        var ghi = new Ghi();

        Util.resolves(done, Util.capturesStdout(() => {
            return ghi.run(['help', 'abc', '-color']);
        }).then(out => {
            expect(out).not.to.contain("--priv");
            expect(out).not.to.contain("privateParam");
        }));
    });

    it('should provide a way to display all elements (private and special)', function (done) {
        class Abc extends Command {}
        class Def extends Command {}
        class Ghi extends Container {}

        Abc.define({
            help: 'Run command abc'
        });

        Def.define({
            help: 'I\'m a private command'
        });

        Ghi.define({
            commands: {
                '': Abc,
                help: Help,
                def: {
                    type: Def,
                    private: true
                }
            }
        });

        var ghi = new Ghi();

        Util.resolves(done, Util.capturesStdout(() => {
            return ghi.run(['help', '-color', '-all']);
        }).then(out => {
            expect(out).to.contain("I'm a private command");
            expect(out).to.contain("· help");
        }));
    });
});
