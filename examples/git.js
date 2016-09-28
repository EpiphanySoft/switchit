const Git = require('./git/index.js');
const git = new Git();

// This will catch any errors and only log the error message
// (instead of dumping the whole object to the console)
git.run().catch(err => {
    console.error(err.message);
    process.exit(1);
});