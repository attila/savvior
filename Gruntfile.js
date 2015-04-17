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
      files: [
        './*.js',
        'src/*.js',
        'tests/*Spec.js'
      ]
    },

    jasmine: {
      options: {
        specs: ['tests/*Spec.js'],
        vendor: [
          'node_modules/jquery/dist/jquery.js',
          'tests/lib/jasmine-jquery/jasmine-jquery.js',
          'tests/lib/enquirejs/enquire.js'
        ],
        keepRunner: true
      },

      coverage: {
        src: ['src/*.js'],
        options: {
          display: 'short',
          summary: true,
          outfile: 'tests/SpecRunner.html',
          template: require('grunt-template-jasmine-istanbul'),
          templateOptions: {
            files: ['src/**.js', '!src/Helpers.js'],
            report: [
              { type: 'html', options: { dir: 'coverage' } },
              { type: 'text-summary' },
            ],
            coverage: 'bin/coverage/coverage.json'
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
        src: 'dist/*'
      }
    },

    watch: {
      files: ['<%= jshint.files %>', 'tests/**/*.js', 'tests/**/*.tmpl'],
      tasks: ['test']
    }
  });

  grunt.loadNpmTasks('grunt-bytesize');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-umd');

  grunt.registerTask('test', [
    'jshint',
    'jasmine'
  ]);
  grunt.registerTask('default', [
    'test',
    'concat',
    'umd',
    'uglify',
    'bytesize'
  ]);
  grunt.registerTask('test:coverage', ['jasmine:coverage']);
};
