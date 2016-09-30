const Coffeehouse = require('./coffeehouse/index.js');
const coffeehouse = new Coffeehouse();

// This will catch any errors and only log the error message
// (instead of dumping the whole object to the console)
coffeehouse.run().catch(err => {
    console.error(err.message);
    process.exit(1);
});