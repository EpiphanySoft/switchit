const chalk = require('chalk');

const Command = require('../Command');

class Version extends Command {
    beforeExecute (params) {
        super.beforeExecute(params);
        this.root().skipLogo();
    }

    execute() {
        let pkg = this.root().pkgConfig;
        let version = (pkg && pkg.version) || 'unknown';

        console.log(`${chalk.yellow(pkg.name)} version: ${chalk.green(version)}`);
    }
}

Version.define({
    help: 'Displays the current version'
});


module.exports = Version;
