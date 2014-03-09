# grunt-compile-handlebars [![Build Status](https://secure.travis-ci.org/patrickkettner/grunt-compile-handlebars.png?branch=master)](http://travis-ci.org/patrickkettner/grunt-compile-handlebars)

Compiles handlebar templates, outputs static HTML

## Getting Started
Install this grunt plugin next to your project's [grunt.js gruntfile][getting_started] with: `npm install grunt-compile-handlebars`

Then add this line to your project's `Gruntfile.js` gruntfile:

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
inside of a grunt task. I assume you know what gruntjs is, but if not - [gruntjs.com](http://gruntjs.com)

### When
You have ton of data that rarely changes that you want to template.

### How
There are a lot of different ways to input data, it accepts most any dynamic and static
input.
Heres a few of the ways you can use it

```javascript
'compile-handlebars': {
    allStatic: {
      preHTML: 'test/fixtures/pre-dev.html',
      postHTML: 'test/fixtures/post-dev.html',
      template: 'test/fixtures/template.handlebars',
      templateData: 'test/fixtures/data.json',
      output: 'tmp/allStatic.html'
    },
    dynamicTemplate: {
      template: '<h1>{{salutation}}{{punctuation}} {{location}}</h1>',
      templateData: 'test/fixtures/data.json',
      output: 'tmp/dynamicTemplate.html'
    },
    dynamicTemplateData: {
      template: 'test/fixtures/template.handlebars',
      templateData: {
          "salutation": "Hallo",
          "punctuation": ",",
          "location": "Welt"
      },
      output: 'tmp/dynamicTemplateData.html'
    },
    dynamicPre: {
      preHTML: '<header>INLINE HEADER</header>',
      template: 'test/fixtures/template.handlebars',
      templateData: 'test/fixtures/data.json',
      output: 'tmp/dynamicPre.html'
    },
    dynamicPost: {
      postHTML: '<footer>INLINE HEADER</footer>',
      template: 'test/fixtures/template.handlebars',
      templateData: 'test/fixtures/data.json',
      output: 'tmp/dynamicPost.html'
    },
    allArray: {
      template: ['test/fixtures/deep/spanish.handlebars', 'test/fixtures/deep/deeper/portuguese.handlebars'],
      templateData: ['test/fixtures/deep/spanish.handlebars', 'test/fixtures/deep/deeper/portuguese.json'],
      output: ['tmp/deep/spanish.html','tmp/deep/deeper/portuguese.html'],
      helpers: ['test/helpers/super_helper.js'],
      partials: ['test/fixtures/deep/shared/foo.handlebars']
   },
    globbedTemplateAndOutput: {
      template: 'test/fixtures/deep/**/*.handlebars',
      templateData: 'test/fixtures/deep/**/*.json',
      output: 'tmp/deep/**/*.html'
    },
    globalJsonGlobbedTemplate: {
      template: 'test/fixtures/deep/**/*.handlebars',
      templateData: 'test/fixtures/deep/**/*.json',
      output: 'tmp/deep/**/*.html',
      helpers: 'test/helpers/**/*.js',
      partials: 'test/fixtures/deep/shared/**/*.handlebars',
      globals: [
        'test/globals/info.json',
        'test/globals/textspec.json'
      ]
    }
}
```

### Why
I had to work with several hundred repeated data structures that never changed. Keeping them all in html was silly, but pushing out a template engine for the end user to compile the same information multiple times was even sillier. This allows you to have your templated cake and eat it too.

## Release History
 * 0.6.3 - Pelé  - @mattcg fixed an issue with large amounts of templates
 * 0.6.2 - Dignan  - @goette added support for a global json config
 * 0.6.1 - Grace  - @robinqu added support for handlebars partials
 * 0.6.0 - Future Man - added globbing, lots more test
 * 0.4.0 - Oseary - upgraded to grunt 0.4, removed extra tasks, added tests
 * 0.0.2 - Inez - changed to grunt's native json parser (thanks to @sebslomski). Updated Readme
 * 0.0.1 - Dudley - Initial commit

## License
Copyright (c) 2013 Patrick Kettner
Licensed under the MIT license.
