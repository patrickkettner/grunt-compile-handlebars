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
    catch (e) {}
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

  var mergeJson = function(source, globals) {
      var json, fragment;

      globals.forEach(function (globals) {
          if (!grunt.file.exists(globals))
              grunt.log.error("JSON file " + globals + " not found.");
          else {
              try { fragment = grunt.file.readJSON(globals); }
              catch (e) { grunt.fail.warn(e); }

              if (typeof(source) !== 'object') { 
                  source = fragment;
              } 

              json = grunt.util._.extend(source, fragment);
          }
      });
      return json;
  };

  grunt.registerMultiTask('compile-handlebars', 'Compile Handlebars templates ', function() {
    var path = require('path');
    var config = this.data;
    var templates = getConfig(config.template);
    var templateData = config.templateData;
    var helpers = config.helpers ? getConfig(config.helpers): [];
    var partials = config.partials ? getConfig(config.partials) : [];
    var basename, compiledTemplate, html, json;
    
    helpers.forEach(function (helper) {
      basename = getBasename(helper, config.helpers);
      handlebars.registerHelper(basename, require(path.resolve(helper)));
    });

    partials.forEach(function (partial) {
      basename = getBasename(partial, config.partials);
      handlebars.registerPartial(basename, require(path.resolve(partial)));
    });

    templates.forEach(function(template) {
      compiledTemplate = handlebars.compile(parseData(template));
      basename = getBasename(template, config.template);
      html = '';

      if (config.preHTML) {
        html += parseData(getName(config.preHTML, basename));
      }

      if (config.globals) {
        json = mergeJson(parseData(getName(templateData, basename)), config.globals);
      } else {
        json = parseData(getName(templateData, basename));
      }

      html += compiledTemplate(json);

      if (config.postHTML) {
        html += parseData(getName(config.postHTML, basename));
      }

      if (basename.indexOf('_') === 0) return; // don't convert partials!

      grunt.file.write(getName(config.output, basename), html);
    });

  });
};
