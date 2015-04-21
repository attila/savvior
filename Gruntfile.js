/* jshint node: true */
module.exports = function(grunt) {
  'use strict';

  var path = require('path');

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
      output : '<%= meta.outputDir %>/<%= pkg.name %>'
    },

    concat: {
      options: {
        separator: ''
      },
      dist: {
        src: [
          'src/polyfills/*.js',
          'src/Helpers.js',
          'src/Grid.js',
          'src/GridHandler.js',
          'src/GridDispatch.js'
        ],
        dest: '<%= meta.output %>.js'
      }
    },

    uglify: {
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
      files: [
        './*.js',
        'src/**/*.js',
        '!src/polyfills/*',
        'tests/**/*Spec.js'
      ]
    },

    jasmine: {
      options: {
        specs: ['tests/*Spec.js'],
        vendor: [
          require.resolve('enquire.js'),
          require.resolve('jquery'),
          path.join(__dirname, 'node_modules', 'jasmine-jquery', 'lib', 'jasmine-jquery.js')
        ],
        keepRunner: true
      },

      coverage: {
        src: ['src/**/*.js'],
        options: {
          summary: true,
          outfile: 'tests/SpecRunner.html',
          template: require('grunt-template-jasmine-istanbul'),
          templateOptions: {
            files: ['src/**/*.js', '!src/polyfills/*'],
            report: [
              { type: 'lcov', options: { dir: 'coverage' } },
              { type: 'text-summary' }
            ],
            coverage: 'coverage/coverage.json'
          }
        }
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

    bytesize: {
      dist: {
        src: '<%= meta.output %>.min.js'
      }
    },

    watch: {
      files: ['<%= jshint.files %>', 'tests/**/*.js', 'tests/**/*.tmpl'],
      tasks: ['default']
    }
  });

  grunt.loadNpmTasks('grunt-bytesize');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-umd');

  grunt.registerTask('pre-build', [
    'jshint'
  ]);
  grunt.registerTask('build', [
    'concat',
    'umd',
    'uglify'
  ]);
  grunt.registerTask('post-build', [
    'test',
    'bytesize'
  ]);
  grunt.registerTask('test', [
    'jasmine'
  ]);

  // Meta tasks
  grunt.registerTask('default', [
    'pre-build',
    'build',
    'post-build'
  ]);
};
