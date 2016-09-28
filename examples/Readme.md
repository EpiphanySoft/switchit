# switchit examples

This directory contains all the examples used in the [project's Readme file](../Readme.md) as well as a couple more to demonstrate certain features of `switchit`.

## Table of contents
- Basic Examples
    - [Simple command](#simple-command)
    - [Multiple commands](#multiple-commands)
    - [Optional switches and parameters _shorthand syntax_](#optional-switches-and-parameters-shorthand-syntax)
    - [Optional switches and parameters _configuration object_](#optional-switches-and-parameters-configuration-object)
    - [Variadic switches and parameters](#variadic-switches-and-parameters)
- Application Examples
    - [A `git` mock app built on top of switchit](#a-git-mock-app-built-on-top-of-switchit)

## Basic examples

The following examples demonstrate certain features of `switchit` but are not meant as complete usage examples as they may obviate some parts of the configuration for the sake of shortness.

### Simple command
**Purpose:** Demonstrate the way a simple command is defined and run and that switches can be read from positional arguments as well (as long as they have the same name).
**File:** [`simple2.js`](simple2.js)
**Example output:**

    $ node simple2.js --name John 
      Hi, John!
    $ node simple2.js Paul
      Hi, Paul!

### Multiple commands
**Purpose:** Demonstrate how a command with multiple sub-commands is defined and run.
**File:** [`multiple.js`](multiple.js)
**Example output:** 

    $ node multiple.js hi --name George  
      Hi, George!
    $ node multiple.js bye Ringo       
      Bye, Ringo!


### Optional switches and parameters (shorthand syntax)
**Purpose:** Demonstrate how switches and parameters can be marked as optional using the shorthand syntax.
**File:** [`optional.js`](optional.js)
**Example output:**

    $ node optional.js 
      Hi, Gunter!

### Optional switches and parameters (configuration object)
**Purpose:** Demonstrate how switches and parameters can be marked as optional using a configuration object.
**File:** [`optional2.js`](optional2.js)
**Example output:**

    $ node optional2.js 
      Hi, Gunter!

### Variadic switches and parameters
**Purpose:** Demonstrate how switches and parameters can be configured to receive 0-n values (variadic)
**File:** [`variadic.js`](variadic.js)
**Example output**:

    $ node variadic.js 
      Let's prepare a cup of coffee.
    $ node variadic.js Caramel Cinnamon
      Let's prepare a cup of coffee.
      Add the following toppings:
      - Caramel
      - Cinnamon
    $ node variadic.js --topping Caramel --topping Cinnamon
      Let's prepare a cup of coffee.
      Add the following toppings:
      - Caramel
      - Cinnamon

## Application examples
The following examples intend to demonstrate how `switchit` can be used to build a full-fledged application.

### A `git` mock app built on top of switchit
**Purpose:** Implement a mock version of `git` to demonstrate how it could be built on top of `switchit`
**Files:**
- [`git.js`](git.js): The entrypoint for the multi-file example
- [`git-singlefile.js`](git-singlefile.js): The whole example as a single file (for readability)
**Example output**:

    $ node git.js  
       
       Git: the stupid content tracker
       
       Available categories:
        - remote: Commands to manage remote references
       
       Available commands:
        - help: This command displays help for other commands
        - commit: Commits current changes
        - fetch: Fetches changes from a remote
        - pull: Pulls changes from a remote branch
        
See the [example readme file](git/) for more information.