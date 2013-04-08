/*
* grunt-compile-handlebars
* https://github.com/patrickkettner/grunt-compile-handlebars
*
* Copyright (c) 2012 Patrick Kettner, contributors
* Licensed under the MIT license.
*/

'use strict';

module.exports = function(grunt) {
  var handlebars = require('handlebars');

  grunt.registerMultiTask('compile-handlebars', 'Compile Handlebars templates ', function() {

    var config = this.data;
    var template = grunt.file.read(config.template);
    var compiledTemplate = handlebars.compile(template);
    var html = '';

    if (config.preHTML) html += grunt.file.read(config.preHTML);

    html += compiledTemplate(config.templateData);

    if (config.postHTML) html += grunt.file.read(config.postHTML);

    grunt.file.write(this.data.output, html);
  });
};
