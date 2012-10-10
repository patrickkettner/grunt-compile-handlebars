/*
* grunt-compile-handlebars
* https://github.com/patrickkettner/grunt-compile-handlebars
*
* Copyright (c) 2012 Patrick Kettner
* Licensed under the MIT license.
*/

module.exports = function(grunt) {

  // Please see the grunt documentation for more information regarding task and
  // helper creation: https://github.com/cowboy/grunt/blob/master/docs/toc.md

  // ==========================================================================
  // TASKS
  // ==========================================================================

  grunt.registerMultiTask('compile-handlebars', 'Compile Handlebars templates ', function() {
    grunt.log.write(grunt.helper('compile-handlebars'));

    compiledHTML = grunt.helper('compile-handlebars',  this.data);
    grunt.file.write(this.data.output, compiledHTML)

  });

  // ==========================================================================
  // HELPERS
  // ==========================================================================

  grunt.registerHelper('compile-handlebars', function(data) {
    if (data) {
      var handlebars = require('handlebars');
      var template = grunt.file.read(data.template);
      var templateData = eval(grunt.file.read(data.templateData));
      var compiledTemplate = handlebars.compile(template);
      var html = '';

      if (data.preHTML) {
        html += grunt.file.read(data.preHTML)
      }

      html += compiledTemplate(templateData);

      if (data.postHTML) {
        html += grunt.file.read(data.postHTML)
      }

      return html

    };
  });

};
