module.exports = function(grunt) {
  "use strict";

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        separator: ';'
      },
      dist: {
        src: [
         'src/includes/customEvent.js',
         'src/*.js'],
        dest: 'dist/<%= pkg.name %>.js'
      },
      standalone: {
        src: [
         'src/includes/media.match.js',
         'src/includes/enquire.js',
         'src/includes/requestAnimationFrame.js',
         'src/includes/customEvent.js',
         'src/*.js'],
        dest: 'dist/<%= pkg.name %>.standalone.js'
      }
    },
    uglify: {
      options: {
        banner: '/*!\n'+
                ' * Savvior v<%= pkg.version %> - A Salvattore or Masonry alternative for multiple column layouts.\n'+
                ' * http://savvior.org\n'+
                ' * <%= pkg.repository.url %>\n'+
                ' */\n'
      },
      dist: {
        files: {
          'dist/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
        }
      },
      standalone: {
        files: {
          'dist/<%= pkg.name %>.standalone.min.js': ['<%= concat.standalone.dest %>']
        },
        options: {
          banner: '/*!\n'+
                  ' * Savvior standalone v<%= pkg.version %> - A Salvattore or Masonry alternative for multiple column layouts.\n'+
                  ' * http://savvior.org\n'+
                  ' * <%= pkg.repository.url %>\n'+
                  ' */\n'
        },
      }
    },
    jshint: {
      files: ['Gruntfile.js', 'src/*.js'],
      options: {
        loopfunc: true,
        strict: true
      }
    },
    watch: {
      files: ['<%= jshint.files %>'],
      // tasks: ['jshint']
      tasks: ['jshint', 'concat', 'uglify']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');

  grunt.registerTask('test', ['jshint']);
  grunt.registerTask('default', ['jshint', 'concat', 'uglify']);
};
