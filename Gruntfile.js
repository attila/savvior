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
               ' */\n'
      },
      outputDir: 'dist',
      output : '<%= meta.outputDir %>/<%= pkg.name %>',
      outputMin : '<%= meta.outputDir %>/<%= pkg.name.replace("js", "min.js") %>'
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
      }
    },

    jshint: {
      options: {
        jshintrc : '.jshintrc'
      },
      files: ['Gruntfile.js', '<%= concat.dist.src %>']
    },

    jasmine: {
      dist: {
        options: {
          specs: 'tests/*Spec.js',
          outfile: 'tests/_SpecRunner.html',
          template: 'tests/templates/DefaultRunner.tmpl',
          vendor: [
            'node_modules/jquery/dist/jquery.js',
            'tests/lib/jasmine-jquery/jasmine-jquery.js',
            'src/includes/enquire.js',
            'src/includes/requestAnimationFrame.js',
            'src/includes/customEvent.js'
          ]
        },
        src: 'src/<%= pkg.name %>.js'
      }
    },

    strip_code: {
      options: {
        start_comment: 'savvior-testing-code-start',
        end_comment: 'savvior-testing-code-end',
      },
      dist: {
        src: '<%= concat.dist.dest %>'
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
  grunt.loadNpmTasks('grunt-strip-code');
  grunt.loadNpmTasks('grunt-umd');

  grunt.registerTask('test', ['jshint']);
  grunt.registerTask('default', ['test', 'concat', 'strip_code', 'umd', 'uglify']);
};
