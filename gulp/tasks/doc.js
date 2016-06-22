'use strict';

/**
 * Documentation tasks
 */

var gulp    = require('gulp');
var sassdoc = require('sassdoc');
var exec    = require('child_process').exec;

exports.sassdoc = function () {
  gulp.src('app/styles/**/*.scss')
    .pipe(sassdoc({
      dest: 'docs/sass'
    }));
};

exports.apidoc = function (done) {
  exec('npm run apidoc', done);
};
