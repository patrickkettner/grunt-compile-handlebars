/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: '<json:package.json>',
    lint: {
      files: ['Gruntfile.js']
    },
    watch: {
      files: '<config:pkg.hbrwatch>',
      tasks: 'lint requirejs compile-handlebars-pattern sass'
    },
    sass: {
      development:{
        files: {
          '<%= pkg.distpath %>css/main.css':'<%= pkg.srcpath %>css/main.scss'
        }
      }
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        browser: true
      },
      globals: {}
    },
    uglify: {},
    'compile-handlebars-pattern': {
      development:{
        partials: '<%= pkg.hbrpartials %>',
        files: '<%= pkg.hbrfiles %>',
        data: '<%= pkg.hbrtemplates %>',
        replaceDir: '<%= pkg.srcpath %>',
        withDir: '<%= pkg.distpath %>'
      }
    },
    requirejs:{
      std: {
        options:{
          removeCombined: true,
          fileExclusionRegExp: /^\.|\.hbr|\.hbt|\.scss|hbr-json/,
          appDir: "app/",
          dir: "dist/",
          modules:[
            {
              name:"js/main"
            }
          ],
          baseUrl:'./'
        }
      }
    },
    min:{
      development:{
        src:['dist/main.css'],
        dest:'dist/main.min.css'
      }
    },
    clean:{
      folder:'dist/'
    }
  });

  grunt.loadNpmTasks('grunt-compile-handlebars');
  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-clean');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  // Default task.
  grunt.registerTask('default','clean lint requirejs compile-handlebars-pattern sass');
  grunt.registerTask('watch','clean lint requirejs compile-handlebars-pattern sass watch');
};