/*
* grunt-compile-handlebars
* https://github.com/patrickkettner/grunt-compile-handlebars
*
* Copyright (c) 2014 Patrick Kettner, contributors
* Licensed under the MIT license.
*/

'use strict';

module.exports = function(grunt) {
  var _merge = require('lodash.merge');
  var _toArray = require('lodash.toarray');
  var alce = require('alce');
  var path = require('path');
  var handlebarsPath;
  var handlebars;
  var usedPartials = [];
  var usedHelpers = [];

  // Normalizes the input so that it is always an array for the forEach loop
  var getConfig = function(config) {
    if (!config) {
      return [];
    }

    var files = grunt.file.expand(config);

    if (files.length) {
      return files;
    }

    return [config];
  };

  // Gets the final representation of the input, whether it be object, or string
  var parseData = function(data, dontParse) {
    // grunt.file chokes on objects, so we check for it immiedietly
    if (typeof data === 'object') {
      return data;
    }

    // `data` isn't an object, so its probably a file
    try {
      // alce allows us to parse single-quote JSON (which is tehcnically invalid, and thereby chokes JSON.parse)
      data = grunt.file.read(data);
      if (!dontParse) {
        data = alce.parse(data);
      }
    }
    catch (e) {}

    return data;
  };

  // Checks if the input is a glob and if so, returns the unglobbed version of the filename
  var isGlob = function(filename) {
    if (!filename || typeof filename === 'object') {
      return;
    }

    var match = filename.match(/[^\*]*/);

    if (match[0] !== filename) {
      return match.pop();
    }
  };

  // Figures out the name of the file before any globs are used, so the globbed outputs can be generated
  var getBasename = function(filename, template, outputInInput) {
    var basename;
    var glob;

    template = Array.isArray(template) ? filename : template;
    glob = isGlob(template);
    if (outputInInput) {
      basename = _toArray(filename.split('.').pop()) ;
    } else if (glob) {
      basename = filename.slice(glob.length, filename.length).split('.');
      basename.pop();
    } else {
      basename = filename.split('/').pop().split('.');
      basename.pop();
    }
    return basename.join('.');
  };

  var mergeJson = function(source, globals) {
    var json = {};
    var fragment;

    globals.forEach(function(global) {
      if (grunt.util.kindOf(global) === 'object') {
        fragment = global;
      } else {
        if (!grunt.file.exists(global)) {
          return grunt.log.error('JSON file ' + global + ' not found.');
        } else {
          try {
            fragment = grunt.file.readJSON(global);
          }
          catch (e) {
            return grunt.fail.warn(e);
          }
        }
      }
      _merge(json, fragment);
    });

    if (typeof source === 'object') {
      _merge(json, source);
    }

    return json;
  };

  var shouldRegisterFullPaths = function(itShould, type) {

    if (itShould && typeof itShould === 'string') {
      itShould = itShould.toLowerCase().indexOf(type) === 0;
    }

    return itShould;
  };

  var getTemplateData = function(templateData, filepath, index, file) {
    var data;
    if (templateData === undefined) {
      return {};
    }
    if (typeof templateData === 'function') {
      return getTemplateData(templateData(), filepath, index, file);
    }
    if (Array.isArray(templateData)) {
      data = templateData[index];
      if (data) {
        return data;
      }

      grunt.log.error('You need to assign the same number of data files as source files when using array notation.');

      return;
    }
    if (typeof templateData === 'object') {
      return templateData;
    }
    if (grunt.file.exists(templateData)) {
      return templateData;
    }
    if (isGlob(templateData) !== undefined) {
      var templateExt = path.extname(filepath);
      var hbsPath;

      (file.orig.src || []).some(function(src) {
        var globRoot = isGlob(path.join(file.orig.cwd || '', src));

        if (globRoot === undefined) {
          return false;
        }

        var normalizedPath = path.normalize(filepath);
        globRoot = path.normalize(globRoot);

        if (normalizedPath.indexOf(globRoot) === 0) {
          hbsPath = normalizedPath.slice(globRoot.length, normalizedPath.length - templateExt.length);
          return true;
        }

        return false;
      });

      if (hbsPath !== undefined) {
        grunt.file.expand(templateData).forEach(function(d) {
          var jsonPath = path.normalize(d).replace(path.normalize(isGlob(templateData)), '');
          jsonPath = jsonPath.slice(0, jsonPath.length - path.extname(d).length);

          if (hbsPath === jsonPath) {
            data = d;
          }
        });
      }

      if (data) {
        return data;
      }

      // no glob match, so fall back to swapping the extension, as before v2.1
      data = filepath.replace(path.extname(filepath), path.extname(templateData));
      if (data) {
        return data;
      }
    }

    return templateData;
  };

  var getDest = function(destConfig, index) {
    var dest;
    if (Array.isArray(destConfig)) {
      dest = destConfig[index];
      if (dest) {
        return dest;
      }
      grunt.log.error('You need to assign the same number of destination files as source files when using array notation.');
      return;
    }
    if (isGlob(destConfig) !== undefined) {
      dest = grunt.file.expand(destConfig)[index];
      if (dest) {
        return dest;
      }
      grunt.log.error('You need to assign the same number of destination files as source files when using glob notation.');
      return;
    }
    return destConfig;
  };

  grunt.registerMultiTask('compile-handlebars', 'Compile Handlebars templates ', function() {
    var fs = require('fs');
    var path = require('path');
    var files = this.files;
    var config = this.data;
    var helpers = getConfig(config.helpers);
    var partials = getConfig(config.partials);
    var options = this.options();
    var done = this.async();

    handlebarsPath = config.handlebars ? path.resolve(config.handlebars) : 'handlebars';
    handlebars = require(handlebarsPath);

    if (config.isolated) {
      if (typeof handlebars.create !== 'function') {
        grunt.log.error('`isolated` needs a handlebars with .create() (1.0.9 or newer), continuing with the shared environment');
      } else {
        // give this target its own handlebars environment, so partials and
        // helpers registered by earlier targets are not visible to it, and
        // whatever it registers is not visible to later targets
        handlebars = handlebars.create();
      }
    }

    helpers.forEach(function(helper) {
      var fullPath = helper.replace(/\.[^/.]+$/, '');
      var name = shouldRegisterFullPaths(config.registerFullPath, 'helpers') ?
        // full path, minus extention
        fullPath :
        // just the file's name
        getBasename(helper, config.helpers);

      if (handlebars.helpers[name] && usedHelpers.indexOf(fullPath) === -1) {
        grunt.log.error(name + ' is already registered, clobbering with the new value. Consider setting `registerFullPath` to true');
      } else if (!config.isolated) {
        usedHelpers.push(fullPath);
      }

      handlebars.registerHelper(name, require(fs.realpathSync(helper)));
    });

    partials.forEach(function(partial) {
      var fullPath = partial.replace(/\.[^/.]+$/, '');
      var name = shouldRegisterFullPaths(config.registerFullPath, 'partials') ?
        // full path, minus extention
        fullPath :
        // just the file's name
        getBasename(partial, config.partials);

      if (handlebars.partials[name] && usedPartials.indexOf(fullPath) === -1) {
        grunt.log.error(name + ' is already registered, clobbering with the new value. Consider setting `registerFullPath` to true');
      } else if (!config.isolated) {
        usedPartials.push(fullPath);
      }

      handlebars.registerPartial(name, fs.readFileSync(fs.realpathSync(partial), 'utf8'));
    });

    var compile = function(file, filepath, index) {
      var dest = file.dest || '';
      var template = filepath;
      var compiledTemplate = handlebars.compile(parseData(template, true), options);
      var templateData = getTemplateData(config.templateData, filepath, index, file);
      var outputPath = getDest(dest, index);
      var appendToFile = (outputPath === file.orig.dest && grunt.file.exists(outputPath));
      var operation = appendToFile ? 'appendFileSync' : 'writeFileSync';
      var html = '';
      var json;

      if (config.preHTML) {
        html += parseData(config.preHTML);
      }

      json = mergeJson(parseData(templateData), config.globals || []);

      html += compiledTemplate(json);

      if (config.postHTML) {
        html += parseData(config.postHTML);
      }

      // shamefully copied straight out of grunt's file command, to allow for appending
      // http://git.io/ZYGLEw
      grunt.file.mkdir(path.dirname(outputPath));

      try {
        fs[operation](outputPath, html);
        grunt.verbose.ok();
        return true;
      } catch (e) {
        grunt.verbose.error();
        throw grunt.util.error('Unable to write "' + outputPath + '" file (Error code: ' + e.code + ').', e);
      }

    };


    // Compiles one template once per entry of the object or array that
    // `iterate` points to inside the templateData, writing each render to a
    // dest resolved as a handlebars template of the entry (plus its `key`)
    var compileIterated = function(file) {
      if (file.src && file.src.length > 1) {
        grunt.log.error('`iterate` only supports a single source template per files entry.');
        return;
      }
      if (Array.isArray(config.templateData)) {
        grunt.log.error('`iterate` does not support array templateData.');
        return;
      }

      var template = (file.src && file.src.length) ? file.src[0] : file.orig.src[0];
      var compiledTemplate = handlebars.compile(parseData(template, true), options);
      // filenames are not HTML, so do not escape the interpolated values
      var compiledDest = handlebars.compile(file.dest || file.orig.dest, { noEscape: true });
      var templateData = parseData(getTemplateData(config.templateData, template, 0, file));
      var entries = templateData;

      config.iterate.split('.').forEach(function(key) {
        entries = (entries || {})[key];
      });

      if (grunt.util.kindOf(entries) !== 'object' && grunt.util.kindOf(entries) !== 'array') {
        grunt.log.error('`iterate` ("' + config.iterate + '") does not resolve to an object or array in the templateData');
        return;
      }

      // each entry renders with the full templateData (and any globals,
      // which the templateData wins over, as usual) as its base context,
      // with the entry's own fields merged on top
      var base = mergeJson(templateData, config.globals || []);
      var preHTML = config.preHTML ? parseData(config.preHTML) : '';
      var postHTML = config.postHTML ? parseData(config.postHTML) : '';
      var writtenPaths = {};

      Object.keys(entries).forEach(function(key) {
        var json = _merge({}, base, entries[key]);
        var outputPath = compiledDest(_merge({}, json, { key: key }));
        var html = preHTML + compiledTemplate(json) + postHTML;

        if (writtenPaths[outputPath]) {
          grunt.log.error('`iterate` rendered "' + outputPath + '" more than once. Does your dest include {{key}}?');
        }
        writtenPaths[outputPath] = true;

        grunt.file.mkdir(path.dirname(outputPath));

        try {
          fs.writeFileSync(outputPath, html);
          grunt.verbose.ok();
        } catch (e) {
          grunt.verbose.error();
          throw grunt.util.error('Unable to write "' + outputPath + '" file (Error code: ' + e.code + ').', e);
        }
      });
    };

    files.forEach(function(file) {
      if (config.iterate) {
        compileIterated(file);
        return;
      }

      if (Array.isArray(file.dest) && file.dest.length > file.src.length) {
        if (file.src.length > 1) {
          grunt.log.error('You may only have one source file when there are more destination files than source files.');
          return;
        } else {
          file.dest.forEach(function(destpath, index) {
            compile(file, file.src[0], index);
          });
        }
      } else {
        if (file.src.length > 0) {
          file.src.forEach(function(filepath, index) {
            compile(file, filepath, index);
          });
        } else {
          file.orig.src.forEach(function(template, index) {
            compile(file, template, index);
          });
        }
      }
    });

    process.nextTick(done);
  });
};
