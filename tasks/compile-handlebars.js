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
  var getData = function(config) {
    var data;
    if (typeof(config) === 'object') {
      data = Array.isArray(config) ? config : [config];
    }
    else {
      data = grunt.file.expand(config);
    }
    return data;
  };

  var unglobbedName = function(wildcard, file, relative) {
    var path = file.split('/');
    var result = file;
    var filename;

    //get the shared parent path
    while (wildcard.localeCompare(result) < 0) {
      path.pop();
      result = path.join('/');
    }


    filename = file.slice(result.length, file.length).split('.');
    filename.pop();
    if (relative) {
      return result.split('/').pop() + filename.join('.');
    }
    else {
      return result += filename.join('.');
    }

  };

  var filetype = function(filepath) {
    var ext = filepath.split('/').pop().split('.');
    ext.shift();
    ext = ext.join('.');
    if (ext) ext = '.' + ext;
    return ext;
  };

  var readFile = function(file) {
    var content = grunt.file.read(file);
    try {
      content = JSON.parse(content);
    }
    catch (e) {}
    return content;
  };

  var fileOrGlob = function(path, template, read) {
    if (!grunt.file.expand(path).length) {
      //grunt.file.exists chokes on objects, so we have
      //to do this ugly check instead
      if (typeof(path) !== 'object' && grunt.file.isDir(unglobbedName(path, template))) {
        path = unglobbedName(path, template) + filetype(path);
        return read ? readFile(path) : path;
      }

      //path is not an actual file, but something non path-like
      //like a JSON object or raw HTML, so we just return it
      return path;
    }
    else if (grunt.file.exists(path)) {
      return read ? readFile(path) : path;
    }
    else {
      return path;
    }
  };

  grunt.registerMultiTask('compile-handlebars', 'Compile Handlebars templates ', function() {
    var config = this.data;
    var templates = getData(config.template);
    var templateData = config.templateData;

    templates.forEach(function(template) {
      var compiledTemplate = handlebars.compile(readFile(template));
      var html = '';

      if (config.preHTML) html += fileOrGlob(config.preHTML, template, true);

      html += compiledTemplate(fileOrGlob(templateData, template, true));

      if (config.postHTML) html += fileOrGlob(config.postHTML, template, true);

      grunt.file.write(fileOrGlob(config.output, template), html);
    });

  });
};
