module.exports = function(grunt) {
  'use strict';

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    meta: {
      banner: {
        dist: '/*!\n'+
               ' * <%= pkg.name %> v<%= pkg.version %> - <%= pkg.description %>\n'+
               ' * <%= pkg.homepage %>\n'+
               ' * <%= pkg.repository.url %>\n'+
               ' */\n',
        lite: '/*!\n'+
               ' * <%= pkg.nameLite %> v<%= pkg.version %> - <%= pkg.description %>\n'+
               ' * <%= pkg.homepage %>\n'+
               ' * <%= pkg.repository.url %>\n'+
               ' */\n'
      },
      outputDir: 'dist',
      output : '<%= meta.outputDir %>/<%= pkg.name %>',
      outputLite : '<%= meta.outputDir %>/<%= pkg.nameLite %>',
      outputMin : '<%= meta.outputDir %>/<%= pkg.name.replace("js", "min.js") %>',
      outputLiteMin : '<%= meta.outputDir %>/<%= pkg.nameLite.replace("js", "min.js") %>'
    },

    concat: {
      options: {
        separator: ''
      },
      dist: {
        src: [
          'src/Helpers.js',
          'src/Grid.js',
          'src/GridHandler.js',
          'src/GridDispatch.js'
        ],
        dest: '<%= meta.output %>.js'
      },
      lite: {
        src: [
          'src/Helpers.js',
          'src/Grid.js',
          'src/LiteGridHandler.js',
        ],
        dest: '<%= meta.outputLite %>.js'
      }
    },

    uglify: {
      options: {
        report: 'gzip'
      },
      dist: {
        options: {
          banner: '<%= meta.banner.dist %>'
        },
        files: {
          '<%= meta.outputDir %>/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
        }
      },
      lite: {
        options: {
          banner: '<%= meta.banner.lite %>'
        },
        files: {
          '<%= meta.outputDir %>/<%= pkg.nameLite %>.min.js': ['<%= concat.lite.dest %>']
        }
      }
    },

    jshint: {
      options: {
        jshintrc : '.jshintrc'
      },
      files: ['Gruntfile.js', '<%= concat.dist.src %>', '<%= concat.lite.src %>']
    },

    jasmine: {
      dist: {
        options: {
          specs: [
            'tests/GridSpec.js',
            'tests/GridHandlerSpec.js',
            'tests/GridDispatchSpec.js',
          ],
          outfile: 'tests/_SpecRunner.html',
          template: 'tests/templates/DefaultRunner.tmpl',
          vendor: [
            'node_modules/jquery/dist/jquery.js',
            'tests/lib/jasmine-jquery/jasmine-jquery.js',
            'tests/lib/enquirejs/enquire.js'
          ]
        },
        src: 'src/*.js'
      }
    },

    umd: {
      dist: {
        src: '<%= concat.dist.dest %>',
        amdModuleId: '<%= pkg.name %>',
        objectToExport: 'new GridDispatch()',
        globalAlias: '<%= pkg.name %>',
        indent: '  ',
        deps: {
          'default': ['enquire'],
        }
      },
      lite: {
        src: '<%= concat.lite.dest %>',
        amdModuleId: '<%= pkg.nameLite %>',
        objectToExport: 'new LiteGridHandler()',
        globalAlias: '<%= pkg.nameLite %>',
        indent: '  ',
      },
    },

    watch: {
      files: ['<%= jshint.files %>', 'tests/*.js'],
      tasks: ['default']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-umd');

  grunt.registerTask('test', ['jshint', 'jasmine']);
  grunt.registerTask('default', ['test', 'concat', 'umd', 'uglify']);
};
