/*
 * `coffeehouse.js` Command-line application example
 *
 * The purpose of this sample application is to demonstrate most of the features of `switchit`
 * See the example readme file at coffeehouse/Readme.md for more information.
 *
 * To run:
 *      $ node coffeehouse.js
 */
const Coffeehouse = require('./coffeehouse/index.js');
const coffeehouse = new Coffeehouse();

// This will catch any errors and only log the error message
// (instead of dumping the whole object to the console)
coffeehouse.run().catch(err => {
    console.error(err.message);
    process.exit(1);
});