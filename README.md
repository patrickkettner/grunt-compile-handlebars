# grunt-compile-handlebars

Compiles handlebar templates, outputs static HTML

## Getting Started
Install this grunt plugin next to your project's [grunt.js gruntfile][getting_started] with: `npm install grunt-compile-handlebars`

Then add this line to your project's `grunt.js` gruntfile:

```javascript
grunt.loadNpmTasks('grunt-compile-handlebars');
```

[grunt]: https://github.com/gruntjs/grunt
[getting_started]: https://github.com/gruntjs/grunt/blob/master/docs/getting_started.md

## Documentation
### Who
patrick kettner - a web developer who consistently worked with large static data sets.

### What
grunt-compile-handlebars takes in a handlebars tempalte (and optionally static pre and post html), runs a dataset over it, and outputs static html.

### Where
inside of a grunt task. I assume you know what gruntjs is, but if not - gruntjs.com

### When
this questions doesn't even make sense

## Why
I had to work with several hundred repeated data structures that never changed. Keeping them all in html was silly, but pushing out a template engine for the end user to compile the same information multiple times was even sillier. This allows you to have your templated cake and eat it too.

## Release History
0.0.1 - Dudley

## License
Copyright (c) 2012 Patrick Kettner
Licensed under the MIT license.
