# Miscelaneous
## Program logo
Some prorgams benefit from or need to show their name and version on each run (e.g. `lerna`).

`switchit` can do it automatically if `logo` is defined as `true` on the root container of your project or single command:
```
myprogram.define({
  // commands, switches, etc
  logo: true
});
```

When the command is run, its name and version will be logged to the console:
```
$ node myprogram.js
myprogram v1.0.0
This is the output of my command!
```

You can pass a string in case the auto-detected name is not correct or if you want to show a more suitable name:
```
myprogram.define({
  // commands, switches, etc
  logo: 'My awesome program'
});
```
This results in:
```
$ node myprogram.js
My awesome program v1.0.0
This is the output of my command!
```

Lastly, you can pass an object with `name` and `version` to completely customize the logo:
```
const boxen = require('boxen');
myprogram.define({
  // commands, switches, etc
  logo: {
    name: boxen('Welcome to my awesome command'),
    version: ''
  }
});
```
Check this out:
```
$ node myprogram.js
┌───────────────────────────────┐
│ Welcome to my awesome command │
└───────────────────────────────┘
This is the output of my command!
```