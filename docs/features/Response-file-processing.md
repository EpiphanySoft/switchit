# Response file processing

## Complex command processing
Sometimes you want to execute a set of commands on a regular basis and don't want to write it to
the console each time. For example, let's use that coffee brewing example above and define two
files for our favourite coffee and tea recipes (one argument per line).

This would be our `coffee.txt` file (indented for readability):

    coffee
        Caramel
        Cinnamon
        Whipped Cream

And this would be our `tea.txt` file (again, indented for readability):

    tea
        Honey
        Lime
        
`switchit` can read these files so that each line is taken to be a command line argument, unless
that line begins with `#` in which case it is skipped.

    $ node examples/coffeehouse-simple.js @examples/coffee.txt                                  
    Let's prepare a cup of coffee.
    Add the following extras:
    - Caramel
    - Cinnamon
    - Whipped Cream

    $ node examples/coffeehouse-simple.js @examples/tea.txt   
    Let's prepare a cup of tea.
    Add the following extras:
    - Honey
    - Lime
    
## Nested file processing
All lines from the specified file are inserted into the command line arguments as if they had
been typed there instead of "@{file}". For example, a `coffe-and-tea.txt` file can contain
response file insertions as well:

    @coffe.txt
    and
    @tea.txt

Now if you try to run this, not only the command line argument is expanded but any `@{file}`
lines on it as well (paths are relative to the current working directory):
    
    $ cd examples
    $ node coffeehouse-simple.js @coffee-and-tea.txt                  
    Let's prepare a cup of coffee.
    Add the following extras:
    - Caramel
    - Cinnamon
    - Whipped Cream
    Let's prepare a cup of tea.
    Add the following extras:
    - Honey
    - Lime
    
## Escaping the `@` symbol
If you want to use the `@` symbol on any of your switch values or parameters, you can
escape it as `@@`:

    $ node examples/simple2.js @@Example
    Hi, @Example!