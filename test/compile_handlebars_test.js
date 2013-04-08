'use strict';

var grunt = require('grunt');

exports.clean = {
  dev: function(test) {
      test.expect(1);

      var actual   = grunt.file.read('tmp/dev.html');
      var expected = grunt.file.read('test/expected/dev.html');

      test.equal(actual, expected, 'should be equal to premade static file with pre and post files');

      test.done();
    },
  prod: function(test) {
      test.expect(1);

      var actual   = grunt.file.read('tmp/prod.html');
      var expected = grunt.file.read('test/expected/prod.html');

      test.equal(actual, expected, 'should be equal to premade static file');

      test.done();
    }
};
