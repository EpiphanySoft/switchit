const chalk = require('chalk');
const Path = require('path');

const Command = require('../Command');

class Version extends Command {
    execute() {
        let pkg = require(Path.resolve(Version.home, 'package.json'));
        let version = (pkg && pkg.version) || 'unknown';

        console.log(`${chalk.yellow(pkg.name)} version: ${chalk.green(version)}`);
    }
}

Version.define({
    help: 'Displays the current version'
});

Version.home = Path.resolve(__dirname, '..', '..');

module.exports = Version;
