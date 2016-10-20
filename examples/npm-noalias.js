/*
 * `npm-noalias.js`
 *
 * The purpose of this sample application is to demonstrate what happens when two commands start with a similar prefix
 * (`init` and `install` in this case) and the end-user tries to run an ambiguous short name.
 *
 * To run:
 *      $ node npm-noalias.js i
 */
const Npm = require('./npm/index-noalias.js');
const npm = new Npm();

// This will catch any errors and only log the error message
// (instead of dumping the whole object to the console)
npm.run().catch(err => {
    console.error(err.message);
    process.exit(1);
});