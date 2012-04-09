/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    lint: {
      files: ['dist/merged.js']
    },
    qunit: {
      files: ['test/**/*.html']
    },
    concat: {
      dist: {
        src: [
            'script/intro.js',
            'script/Artist.js',
            'script/Release.js',
            'script/riaaraar.js',
            'script/outtro.js'
        ],
        dest: 'dist/merged.js'
      }
    },
    min: {
      dist: {
        src: ['dist/merged.js'],
        dest: 'dist/merged.min.js'
      }
    },
    watch: {
      files: '<config:concat.dist.src>',
      tasks: 'concat lint min'
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
      globals: {
        $: true,
        console: true,
        alert: true
      }
    },
    uglify: {}
  });

  // Default task.
  grunt.registerTask('default', 'concat lint min');

};
