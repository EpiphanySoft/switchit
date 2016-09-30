const Npm = require('./npm/index.js');
const npm = new Npm();

// This will catch any errors and only log the error message
// (instead of dumping the whole object to the console)
npm.run().catch(err => {
    console.error(err.message);
    process.exit(1);
});