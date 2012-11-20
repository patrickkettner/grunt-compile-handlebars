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
    grunt.file.write(this.data.output, compiledHTML);

  });

  /* Batch compiles handlebars templates statically using filename patterns
  * @author Arne G Strout, arne.strout@icrossing.com
  * config example:
  * 'compile-handlebars-pattern': {
  *    development:{
  *      files: 'app/*.hbr', // pattern to look for, output filename will be the same as the template filename with a .html extension
  *      data: 'hbr-context/*.json', // relative to the path of the file, not the gruntfile, * replaced by filename of matched file
  *      replaceDir: 'app/', // Replace this within the file path with the withDir value
  *      withDir: 'dist/' // Replaces the replaceDir value 
  *    }
  *  }
  */
  grunt.registerMultiTask('compile-handlebars-pattern','Compile Handlebars templates based on pattern',function(){
    
    this.data.files=grunt.template.process(this.data.files);
    this.data.withDir=grunt.template.process(this.data.withDir);
    this.data.replaceDir=grunt.template.process(this.data.replaceDir);
    this.data.data=grunt.template.process(this.data.data);
    grunt.log.write("Compile Handlebars using file pattern: "+this.data.files+"\n");

    var fileset=grunt.file.expandFiles(this.data.files);
    var i=0,n,c,p,out;
    for(i=0;i<fileset.length;i++){
      n=fileset[i].substr(fileset[i].lastIndexOf('/')+1).split('.')[0]; // just the filename
      p=fileset[i].substr(0,fileset[i].lastIndexOf('/')+1); // just the path
      out=p.split(this.data.replaceDir).join(this.data.withDir)+n+'.html'; // the output file

      grunt.log.write('Rendering template "'+n+'" to '+out+"...\n");
      c=grunt.helper('compile-handlebars', {
        template: fileset[i],
        output: out,
        templateData: grunt.file.readJSON(p+this.data.data.split('*').join(n))
      });
      grunt.file.write(out,c);
    }
  });

  // ==========================================================================
  // HELPERS
  // ==========================================================================

  grunt.registerHelper('compile-handlebars', function(data) {
    if (data) {
      var handlebars = require('handlebars');
      var template = grunt.file.read(data.template);
      var compiledTemplate = handlebars.compile(template);
      var html = '';

      if (data.preHTML) {
        html += grunt.file.read(data.preHTML);
      }

      html += compiledTemplate(data.templateData);

      if (data.postHTML) {
        html += grunt.file.read(data.postHTML);
      }

      return html;

    }
  });

};
