/*
 * `git.js` A mock git implementation built on top of `switchit`
 *
 * The purpose of this sample application is to demonstrate a number of the features of `switchit`
 * See the example readme file at git/Readme.md for more information.
 *
 * To run:
 *      $ node git.js
 */
const Git = require('./git/index.js');
const git = new Git();

// This will catch any errors and only log the error message
// (instead of dumping the whole object to the console)
git.run().catch(err => {
    console.error(err.message);
    process.exit(1);
});