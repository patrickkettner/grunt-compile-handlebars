/*
* grunt-compile-handlebars
* https://github.com/patrickkettner/grunt-compile-handlebars
*
* Copyright (c) 2013 Patrick Kettner, contributors
* Licensed under the MIT license.
*/

'use strict';

module.exports = function(grunt) {
  var handlebars = require('handlebars');

  /* Normalizes the input so that
   * it is always an array for the
   * forEach loop                */
  var getConfig = function(config) {
    if (grunt.util.kindOf(config) === 'array') {
      return config;
    }
    if (grunt.file.expand(config).length) {
      return grunt.file.expand(config);
    }
    return [config];
  };

  /* Guesses the file extension based on
   * the string after the last dot of the
   * of the filepath                  */
  var filetype = function(filepath) {
    var extension = filepath.split('/').pop().split('.');
    extension.shift();
    extension = extension.join('.');
    if (extension) {
      extension = '.' + extension;
    }
    return extension;
  };

  /* Gets the final representation of the
   * input, wether it be object, or string */
  var parseData = function(data) {
    /* grunt.file chokes on objects, so we
    * check for it immiedietly */
    if (grunt.util.kindOf(data) === 'object') {
      return data;
    }

    /* data isn't an object, so its probably
    * a file. */
    try {
      data = grunt.file.read(data);
      data = JSON.parse(data);
    }
    catch (e) {
      data = {};
    }
    return data;
  };

  /* Checks if the input is a glob
   * and if so, returns the unglobbed
   * version of the filename       */
  var isGlob = function(filename) {
    var match = filename.match(/[^\*]*/);
    if (match[0] !== filename) {
      return match.pop();
    }
  };

  /* Figures out the name of the file before
   * any globs are used, so the globbed outputs
   * can be generated                        */
  var getBasename = function(filename, template) {
    var glob = isGlob(template);
    var basename;
    if (glob) {
      basename = filename.slice(glob.length, filename.length).split('.');
      basename.pop();
    }
    else {
      basename = filename.split('/').pop().split('.');
      basename.pop();
    }
    return basename.toString();
  };

  var getName = function(filename, basename) {
    if (grunt.util.kindOf(filename) === 'object') {
      return filename;
    }
    if (grunt.file.exists(filename)) {
      return filename;
    }
    if (isGlob(filename)) {
      return isGlob(filename) + basename + filetype(filename);
    }
    return filename;
  };

  grunt.registerMultiTask('compile-handlebars', 'Compile Handlebars templates ', function() {
    var config = this.data;
    var templates = getConfig(config.template);
    var templateData = config.templateData;
    var helpers = config.helper ? getConfig(config.helper): [];
    
    helpers.forEach(function (helper) {
      var basename = getBasename(helper, config.helper);
      handlebars.registerHelper(basename, require(require("path").resolve(helper)));
    });

    templates.forEach(function(template) {
      var compiledTemplate = handlebars.compile(parseData(template));
      var basename = getBasename(template, config.template);
      var html = '';

      handlebars.registerPartial(basename, parseData(template));

      if (config.preHTML) {
        html += parseData(getName(config.preHTML, basename));
      }

      html += compiledTemplate(parseData(getName(templateData, basename)));

      if (config.postHTML) {
        html += parseData(getName(config.postHTML, basename));
      }

      grunt.file.write(getName(config.output, basename), html);
    });

  });
};
