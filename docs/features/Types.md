# Type system

## Built-in types

Built-in types are defined in [`Type.js`](../../src/Type.js):

- [Boolean](../../src/Type.js#L120): One of: truefalse|yes|no|on|off
- [Number](../../src/Type.js#L152): A numerical value
- [Semver](../../src/Type.js#L216): A SemVer version, parseable by node-semver
- [String](../../src/Type.js#L195): A plain-old string (like this one!)

## Custom type definition

If you need to define a custom type you can use the static `.define` method of `Type`:

    // TODO example
    