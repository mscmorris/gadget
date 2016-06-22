'use strict';

/**
 * Serve app. For dev purpose.
 */

var gulp       = require('gulp');
var ripe       = require('ripe');
var nodemon    = require('gulp-nodemon');
var open       = require('gulp-open');
var livereload = require('gulp-livereload');

var config = require('../../server/config/environment');

var openOpts = {
  //url: 'http://74.120.176.30:' + config.port,
  //url: 'http://10.50.90.82:' + config.port,
  url: 'http://localhost:' + config.port,
  already: false
};

module.exports = {

  nodemon: function () {
    return nodemon({
        script: 'dist/server/server.js',
        ext: 'js',
        ignore: ['app', 'dist', 'node_modules', 'gulpfile.js']
      })
      .on('start', function () {
        if (!openOpts.already) {
          openOpts.already = true;
          ripe.wait(function () {
            gulp.src('./app/index.html')
              .pipe(open('', openOpts));
          });
        } else {
          ripe.wait(function () {
            livereload.changed('/');
          });
        }
      });
  }

};
