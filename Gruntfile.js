/*
 * grunt-compile-handlebars
 * http://gruntjs.com/
 *
 * Copyright (c) 2012 Patrick Kettner, contributors
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        '<%= nodeunit.tests %>'
      ],
      options: {
        jshintrc: '.jshintrc'
      },
    },

    clean: {
      test: ['tmp']
    },

    // Configuration to be run (and then tested).
    'compile-handlebars': {
      dev: {
        preHTML: 'test/fixtures/pre-dev.html',
        postHTML: 'test/fixtures/post-dev.html',
        template: 'test/fixtures/template.handlebars',
        templateData: {
          "salutation": "Hallo",
          "punctuation": ",",
          "location": "Welt"
        },
        output: 'tmp/dev.html'
      },
      prod: {
        template: 'test/fixtures/template.handlebars',
        templateData: grunt.file.readJSON('test/fixtures/data.json'),
        output: 'tmp/prod.html'
      }
    },

    // Unit tests.
    nodeunit: {
      tests: ['test/*_test.js'],
    },
  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  // Whenever the 'test' task is run, first create some files to be cleaned,
  // then run this plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean', 'compile-handlebars', 'nodeunit']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);
};
