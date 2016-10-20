/*
 * `npm.js` A mock npm implementation built on top of `switchit`
 *
 * The purpose of this sample application is to demonstrate a number of the features of `switchit`
 * See the example readme file at npm/Readme.md for more information.
 *
 * To run:
 *      $ node npm.js
 */
const Npm = require('./npm/index.js');
const npm = new Npm();

// This will catch any errors and only log the error message
// (instead of dumping the whole object to the console)
npm.run().catch(err => {
    console.error(err.message);
    process.exit(1);
});