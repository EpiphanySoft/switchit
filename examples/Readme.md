# switchit examples

This directory contains all the examples used in the [project's Readme file](../README.md) as well as a couple more to demonstrate certain features of `switchit`.

## Table of contents
- Basic Examples
    - [Simple command](#simple-command)
    - [Optional switches and parameters _shorthand syntax_](#optional-switches-and-parameters-shorthand-syntax)
    - [Optional switches and parameters _configuration object_](#optional-switches-and-parameters-configuration-object)
    - [Variadic switches and parameters](#variadic-switches-and-parameters)
    - [Command Hierarchy example](#command-hierarchy-example)
    - [Custom aliases](#custom-aliases)
    - [Including the `help` command](#including-the-help-command)
- Application Examples
    - [`git` mock](#a-git-mock-app-built-on-top-of-switchit)
    - [`npm` mock](#an-npm-mock-app-built-on-top-of-switchit)
    - [`coffeehouse.js`: A command-line beverage genius](#coffeehousejs-a-command-line-beverage-genius)

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

### Optional switches and parameters (shorthand syntax)
**Purpose:** Demonstrate how switches and parameters can be marked as optional using the shorthand syntax.  
**File:** [`optional.js`](optional.js)  
**Example output:**

    $ node optional.js 
      Hi, Ringo!

### Optional switches and parameters (configuration object)
**Purpose:** Demonstrate how switches and parameters can be marked as optional using a configuration object.  
**File:** [`optional2.js`](optional2.js)  
**Example output:**

    $ node optional2.js 
      Hi, Ringo!

### Variadic switches and parameters
**Purpose:** Demonstrate how switches and parameters can be configured to receive a variable number of values (variadic)  
**File:** [`variadic.js`](variadic.js)  
**Example output**:

    $ node variadic.js 
      Let's prepare a cup of coffee.
      
    $ node variadic.js Caramel Cinnamon
      Let's prepare a cup of coffee.
      Add the following extras:
      - Caramel
      - Cinnamon
      
    $ node variadic.js --extra Caramel --extra Cinnamon
      Let's prepare a cup of coffee.
      Add the following extras:
      - Caramel
      - Cinnamon

### Command Hierarchy example
**Purpose:** Demonstrate how a container with multiple sub-commands is defined and run.  
**File:** [`coffeehouse-simple.js`](coffeehouse-simple.js)  
**Example output:** 

    $ node coffeehouse-simple.js coffee --extra Caramel --extra Cinnamon
    Let's prepare a cup of coffee.
    Add the following extras:
    - Caramel
    - Cinnamon
    
    $ node coffeehouse-simple.js tea --extra Honey
    Let's prepare a cup of tea.
    Add the following extras:
    - Honey

### Custom aliases
**Purpose:** Demonstrate how commands can define their own alias.  
**Files:** 
- [`coffeehouse-singlefile.js`](coffeehouse-singlefile.js)
- [`npm-singlefile.js`](npm-singlefile.js)

**Example output:** 

    $ node coffeehouse-singlefile.js koffie
    Let's prepare a cup of coffee.
    
    $ node npm-singlefile.js i
    install takes place here

### Including the `help` command
**Purpose:** Demonstrate how to include the built-int Help command.  
**File:** [`help.js`](help.js)  
**Example output:**

    $ node help.js
     
     Coffeehouse
     
     Available sub-commands:
      * coffee
      * tea
      * help:       This command displays help for other commands   
     
     Syntax:
       coffeehouse [subcommand]

More examples on how to configure help output are available on the application examples.

## Application examples
The following examples intend to demonstrate how `switchit` can be used to build a full-fledged application.

### A `git` mock app built on top of `switchit`
**Purpose:** Implement a mock version of `git` to demonstrate how it could be built on top of `switchit`  
**Files:**
- [`git.js`](git.js): The entrypoint for the multi-file example
- [`git-singlefile.js`](git-singlefile.js): The whole example as a single file (for readability)  

**Example output**:

    $ node git.js  
     
     Git: the stupid content tracker
     
     Available command containers:
      * remote:     Commands to manage remote references    
      * submodule:  Initialize, update or inspect submodules        
     
     Available sub-commands:
      * help:       This command displays help for other commands   (alias: ?)
      * commit:     Commits current changes 
      * fetch:      Fetches changes from a remote   
      * pull:       Pulls changes from a remote branch      
     
     Syntax:
       git [container|subcommand]

        
See the [example readme file](git/) for more information.

### An `npm` mock app built on top of `switchit`
**Purpose:** Implement a mock version of `npm` to demonstrate the use of alias to avoid ambiguity with shortest unique prefixes  
**Files:**
- [`npm.js`](npm.js): The entrypoint for the multi-file example
- [`npm-singlefile.js`](npm-singlefile.js): The whole example as a single file (for readability)
- [`npm-noalias.js`](npm-noalias.js): The entrypoint for the multi-file example without aliases configured (to demonstrate the concept of ambiguity with single character unique prefixes)

**Example output**:

    $ node npm.js
     
     Npm: javascript package manager
     
     Available sub-commands:
      * help:       This command displays help for other commands   
      * init:       Interactively create a package.json file        
      * install:    Install a package       (alias: i)
     
     Syntax:
       npm [subcommand]
  
    $ node npm-noalias.js     
     
     Npm: javascript package manager
     
     Available sub-commands:
      * help:       This command displays help for other commands   
      * init:       Interactively create a package.json file        
      * install:    Install a package       
     
     Syntax:
       npm [subcommand]
        
See the [example readme file](npm/) for more information.

### `coffeehouse.js`: A command-line beverage genius
**Purpose:** Demonstrate most of the features of `switchit` using a single application example  
**Files:**
- [`coffeehouse.js`](coffeehouse.js): The entrypoint for the multi-file example
- [`coffeehouse-singlefile.js`](coffeehouse-singlefile.js): The whole example as a single file (for readability)

**Example output**:

    $ node coffeehouse.js
         
     Coffeehouse: A simple app that brews your favorite beverages!
     
     Available sub-commands:
      * coffee:     Brew some coffee        (alias: koffie, cafe, c)
      * tea:        Brew some tea   (alias: thee, t)
      * help:       This command displays help for other commands   
     
     Syntax:
       coffeehouse [subcommand]
        
See the [example readme file](coffeehouse/) for more information.