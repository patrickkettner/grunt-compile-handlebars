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

  /* Batch compiles handlebars templates statically using filename patterns, supports directives and inline JSON
  * @author Arne G Strout, arne.strout@icrossing.com
  *
  * Template with inline JSON example: (will be used instead of looking for file with same name)
  * {{! *** Handlebars Context Inline Configuration **** }}
  * {{! 
  *     json:{
  *         "page":"<json:hbr-json/index.json>",
  *         "topnav":"<json:common/hbr-json/topnav.json>"
  *     }
  * !}}
  * 
  * config example:
  * 'compile-handlebars-pattern': {
  *    development:{
  *      partials: 'app/*.hbt' // pattern to look for, will be compiled to a partial with the same name for reference from .hbt files
  *                 (folder delimiter is an underscore eg: / becomes _ )
  *      files: 'app/*.hbr', // pattern to look for, output filename will be the same as the template filename with a .html extension
  *      data: 'hbr-context/*.json', // relative to the path of the file, not the gruntfile, * replaced by filename of matched file
  *             Will be ignored if inline JSON object is included
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
    this.data.partials=grunt.template.process(this.data.partials);

    grunt.log.write("Compile Handlebars using file pattern: "+this.data.files+"\n");
    
    var i,u,n,c,p,out,obj;
    // PREPROCESS, CREATE LIST OF PARTIALS (.HBT)
    var parts=grunt.file.expandFiles(this.data.partials);

    for(i=0;i<parts.length;i++){
      n=parts[i].substr(parts[i].lastIndexOf('/')+1).split('.')[0]; // just the filename
      p=parts[i].substr(0,parts[i].lastIndexOf('/')+1);
      grunt.helper('compile-handlebars-partials',{template:parts[i],name:p.split(this.data.replaceDir).join('').split('/').join('_')+n});
    }

    // PROCESS, ITERATE THROUGH TEMPLATES (.HBR)
    var internalJSON=false;
    var fileset=grunt.file.expandFiles(this.data.files);
    for(i=0;i<fileset.length;i++){
      internalJSON=false;
      n=fileset[i].substr(fileset[i].lastIndexOf('/')+1).split('.')[0]; // just the filename
      p=fileset[i].substr(0,fileset[i].lastIndexOf('/')+1); // just the path
      out=p.split(this.data.replaceDir).join(this.data.withDir)+n+'.html'; // the output file


      // Search the template file for embedded JSON object
      var tpl=grunt.file.read(fileset[i]);
      var ci=0,cu=0,cn=0,str='';
      while(ci>-1 && ci<tpl.length && !internalJSON){
        ci=tpl.indexOf('{{!',ci+1);
        cu=tpl.indexOf('!}}',cu);
        if(ci>-1 && cu>-1){
          cn=tpl.indexOf('json:',ci);
          if(cn>-1){
            cn+=5;
            str=tpl.substr(cn,cu-cn);
            obj=JSON.parse(str);
            internalJSON=true;
          }
        }
      }
      // If no embedded object, look for JSON file with the same name
      if(!internalJSON)obj=grunt.file.readJSON(p+this.data.data.split('*').join(n));

      var cwd=process.cwd();
      process.chdir(p);
      obj=processUnderscore(processDirectives(obj));
      process.chdir(cwd);

      grunt.log.write('Rendering template "'+n+'" to '+out+"...\n");
      c=grunt.helper('compile-handlebars', {
        template: fileset[i],
        output: out,
        templateData: obj
      });
      grunt.file.write(out,c);
    }
  });

  function processUnderscore(data){
    data= grunt.utils.recurse(data,function(value){
      if(typeof value !== 'string'){return value;}
      return grunt.template.process(value,data);
    });
    return data;
  }

  function processDirectives(data){
    var toProcess = ['config', 'json'];
    data = grunt.utils.recurse(data, function(value) {
      if (typeof value !== 'string') { return value; }
      var parts = grunt.task.getDirectiveParts(value) || [];
      return toProcess.indexOf(parts[0]) !== -1 ? grunt.task.directive(value) : value;
    });
    return data;
  }

  // ==========================================================================
  // HELPERS
  // ==========================================================================
  grunt.registerHelper('compile-handlebars-partials',function(data){
    if(data){
      grunt.log.write("Compiling partial:"+data.name+"\n");
      var handlebars = require('handlebars');
      var template=grunt.file.read(data.template);
      handlebars.registerPartial(data.name,handlebars.compile(template));
    }
  });

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
