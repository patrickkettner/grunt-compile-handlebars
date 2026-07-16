/*
 * grunt-compile-handlebars
 * http://gruntjs.com/
 *
 * Copyright (c) 2014 Patrick Kettner, contributors
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({

    clean: {
      test: ['tmp']
    },

    // Configuration to be run (and then tested).
    'compile-handlebars': {
      allStatic: {
        files: [{
          src: 'test/fixtures/template.handlebars',
          dest: 'tmp/allStatic.html'
        }],
        preHTML: 'test/fixtures/pre-dev.html',
        postHTML: 'test/fixtures/post-dev.html',
        templateData: 'test/fixtures/data.json'
      },
      dynamicHandlebars: {
        files: [{
            src: '<h1></h1>',
            dest: 'tmp/dynamicHandlebars.html'
        }],
        templateData: {},
        handlebars: 'node_modules/handlebars'
      },
      jsonHandlebars: {
        files: [{
          src: 'test/fixtures/sweedishTemplate.json',
          dest: 'tmp/sweedish.json'
        }],
        templateData: 'test/fixtures/sweedishData.json'
      },
      dynamicTemplate: {
        files: [{
            src: '<h1>{{salutation}}{{punctuation}} {{location}}</h1>',
            dest: 'tmp/dynamicTemplate.html'
        }],
        template: '<h1>{{salutation}}{{punctuation}} {{location}}</h1>',
        templateData: 'test/fixtures/data.json'
      },
      templateDataFunction: {
        files: [{
          src: 'test/fixtures/template.handlebars',
          dest: 'tmp/templateDataFunction.html'
        }],
        templateData: function() {
          return {
            "salutation": "Hallo",
            "punctuation": ",",
            "location": "Welt"
          };
        }
      },
      dynamicTemplateData: {
        files: [{
          src: 'test/fixtures/template.handlebars',
          dest: 'tmp/dynamicTemplateData.html'
        }],
        templateData: {
          "salutation": "Hallo",
          "punctuation": ",",
          "location": "Welt"
        }
      },
      dynamicPre: {
        files: [{
          src: 'test/fixtures/template.handlebars',
          dest: 'tmp/dynamicPre.html'
        }],
        preHTML: '<header>INLINE HEADER</header>',
        templateData: 'test/fixtures/data.json'
      },
      dynamicPost: {
        files: [{
          src: 'test/fixtures/template.handlebars',
          dest: 'tmp/dynamicPost.html'
        }],
        postHTML: '<footer>INLINE FOOTER</footer>',
        templateData: 'test/fixtures/data.json'
      },
      anyArray: {
        files: [{
          src: ['test/fixtures/deep/romanian.handlebars', 'test/fixtures/deep/german.handlebars'],
          dest: ['tmp/deep/romanian.html','tmp/deep/german.html']
        }],
        templateData: ['test/fixtures/deep/romanian.json', 'test/fixtures/deep/german.json'],
        helpers: ['test/helpers/super_helper.js'],
        partials: ['test/fixtures/deep/shared/foo.handlebars']
      },
      globbedTemplateAndOutput: {
        files: [{
            expand: true,
            cwd: 'test/fixtures/',
            src: 'deep/**/*.handlebars',
            dest: 'tmp/',
            ext: '.html'
        }],
        templateData: 'test/fixtures/deep/**/*.json',
        helpers: 'test/helpers/**/*.js',
        partials: 'test/fixtures/deep/shared/**/*.handlebars'
      },
      globalJsonGlobbedTemplate: {
        files: [{
            expand: true,
            cwd: 'test/fixtures/',
            src: 'deep/**/*.handlebars',
            dest: 'tmp/',
            ext: '.html'
        }],
        templateData: 'test/fixtures/deep/**/*.json',
        helpers: 'test/helpers/**/*.js',
        partials: 'test/fixtures/deep/shared/**/*.handlebars',
        globals: [
          'test/globals/info.json',
          'test/globals/textspec.json',
          {
            textspec: {
              "ps": "P.S. from Gruntfile.js"
            }
          }
        ]
      },
      globalJsonGlobbedTemplateSeparateLocations: {
        files: [{
            expand: true,
            cwd: 'test/fixtures/',
            src: 'deepSeparateHbs/**/*.handlebars',
            dest: 'tmp/',
            ext: '.html'
        }],
        templateData: 'test/fixtures/deepSeparateJson/**/*.json',
        helpers: 'test/helpers/**/*.js',
        partials: 'test/fixtures/deep/shared/**/*.handlebars',
        globals: [
          'test/globals/info.json',
          'test/globals/textspec.json',
          {
            textspec: {
              "ps": "P.S. from Gruntfile.js"
            }
          }
        ]
      },
      cwdWithoutTrailingSlash: {
        files: [{
            expand: true,
            cwd: 'test/fixtures/deep',
            src: '*.handlebars',
            dest: 'tmp/cwdWithoutTrailingSlash/',
            ext: '.html'
        }],
        templateData: 'test/fixtures/deep/*.json'
      },
      cwdWithDotSlash: {
        files: [{
            expand: true,
            cwd: './test/fixtures/deep/',
            src: '*.handlebars',
            dest: 'tmp/cwdWithDotSlash/',
            ext: '.html'
        }],
        templateData: 'test/fixtures/deep/*.json'
      },
      nonGlobSrcGlobbedData: {
        files: [{
          src: 'test/fixtures/template.handlebars',
          dest: 'tmp/nonGlobSrcGlobbedData.html'
        }],
        templateData: 'test/fixtures/*.json'
      },
      helperIsolationA: {
        files: [{
          src: '<i>{{leaked}}</i>',
          dest: 'tmp/helperIsolationA.html'
        }],
        templateData: {},
        helpers: ['test/probe-helpers/leaked.js']
      },
      helperIsolationB: {
        files: [{
          src: '<i>{{leaked}}</i>',
          dest: 'tmp/helperIsolationB.html'
        }],
        templateData: {},
        isolated: true
      },
      helperIsolationC: {
        files: [{
          src: '<i>{{leaked}}</i>',
          dest: 'tmp/helperIsolationC.html'
        }],
        templateData: {}
      },
      registerFullPath: {
        files: [{
            src: '<h1>{{salutation}}{{punctuation}} {{location}}</h1>{{> test/fixtures/deep/shared/pathTest}}',
            dest: 'tmp/fullPath.html'
        }],
        templateData: {
          "salutation": "Hallo",
          "punctuation": ",",
          "location": "Welt"
        },
        partials: 'test/fixtures/deep/shared/**/*.handlebars',
        registerFullPath: true
      },
      concatGlobbed: {
        files: [{
          src: 'test/fixtures/deep/**/*.handlebars',
          dest: 'tmp/concatGlobbed.html'
        }],
        templateData: 'test/fixtures/deep/**/*.json'
      },
      parentWithChild: {
        files: [{
          src: 'test/fixtures/blog.html',
          dest: 'tmp/blog.html'
        }],
        templateData: 'test/globals/blog.json'
      },
      parentWithChildChildren: {
        files: [{
          src: 'test/fixtures/blog-post.html',
          dest: 'tmp/blog/blog-{{key}}.html'
        }],
        templateData: 'test/globals/blog.json',
        iterate: 'posts'
      },
      iterateArray: {
        files: [{
          src: '<li>{{name}}</li>',
          dest: 'tmp/iterateArray/item-{{key}}.html'
        }],
        templateData: {
          items: [
            { "name": "first" },
            { "name": "second" }
          ]
        },
        iterate: 'items'
      },
      iterateGlobals: {
        files: [{
          src: '<p>{{siteTitle}}|{{fromGlobal}}|{{title}}</p>',
          dest: 'tmp/iterateGlobals/{{key}}.html'
        }],
        templateData: 'test/globals/blog.json',
        iterate: 'posts',
        globals: [{
          fromGlobal: 'from the globals',
          siteTitle: 'the globals should not win'
        }]
      },
      oneTemplateToManyOutputs: {
        files: [{
          src: 'test/fixtures/template.handlebars',
          dest: ['tmp/oneTemplateToManyOutputs1.html', 'tmp/oneTemplateToManyOutputs2.html']
        }],
        templateData: ['test/fixtures/oneTemplateToManyOutputs1.json', 'test/fixtures/oneTemplateToManyOutputs2.json']
      }
    }
  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-clean');

  // Lint everything with eslint (see eslint.config.js).
  grunt.registerTask('lint', 'Lint the task, tests, and Gruntfile', function() {
    var done = this.async();
    var ESLint = require('eslint').ESLint;

    new ESLint().lintFiles(['Gruntfile.js', 'eslint.config.js', 'tasks/*.js', 'test/*_test.js']).then(function(results) {
      var problems = 0;

      results.forEach(function(result) {
        result.messages.forEach(function(message) {
          problems++;
          grunt.log.error(result.filePath + ':' + message.line + ' ' + message.message + ' (' + (message.ruleId || 'parse error') + ')');
        });
      });

      done(problems === 0);
    }, function(err) {
      grunt.log.error(err.message);
      done(false);
    });
  });

  // Run the nodeunit-style suite in test/ against plain assert.
  grunt.registerTask('run-tests', 'Run the test suite', function() {
    var assert = require('assert');
    var path = require('path');
    var failures = [];
    var assertions = 0;

    var runTest = function(testName, fn) {
      var expected;
      var ran = 0;
      var finished = false;
      var test = {
        expect: function(count) {
          expected = count;
        },
        equal: function(actual, wanted, message) {
          ran++;
          assertions++;
          try {
            assert.equal(actual, wanted, message);
          } catch (err) {
            failures.push(testName + ': ' + err.message);
          }
        },
        done: function() {
          finished = true;
          if (expected !== undefined && ran !== expected) {
            failures.push(testName + ': expected ' + expected + ' assertions, but ' + ran + ' ran');
          }
        }
      };

      try {
        fn(test);
        if (!finished) {
          failures.push(testName + ': never called test.done()');
        }
      } catch (err) {
        failures.push(testName + ': ' + err.message);
      }
    };

    grunt.file.expand('test/*_test.js').forEach(function(file) {
      var suites = require(path.resolve(file));

      Object.keys(suites).forEach(function(suiteName) {
        var suite = suites[suiteName];

        if (typeof suite === 'function') {
          runTest(suiteName, suite);
          return;
        }

        Object.keys(suite).forEach(function(testName) {
          runTest(testName, suite[testName]);
        });
      });
    });

    failures.forEach(function(failure) {
      grunt.log.error(failure);
    });

    if (failures.length) {
      grunt.fail.warn(failures.length + ' test(s) failed');
    }

    grunt.log.ok(assertions + ' assertions passed');
  });

  // Whenever the 'test' task is run, first create some files to be cleaned,
  // then run this plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean', 'compile-handlebars', 'run-tests']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['lint', 'test']);
};
