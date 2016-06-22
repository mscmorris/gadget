'use strict';

/**
 * Watch files, and do things when they changes.
 * Recompile scss if needed.
 * Reinject files
 */

var gulp                  = require('gulp');
var livereload            = require('gulp-livereload');
var watch                 = require('gulp-watch');
var inject                = require('gulp-inject');
var plumber               = require('gulp-plumber');
var sass                  = require('gulp-sass');
var runSequence           = require('run-sequence');

module.exports = function () {

  livereload.listen();

  var coreFiles = [
    'app/index.html',
    'app/app.js',
    'app/styles/app.scss',
    'app/utils/*.js',
    'app/components',
    'app/components/**/*.html',
    'app/components/**/*.js',
    'app/components/**/*.scss',
    '!app/components/**/*.spec.js',
    '!app/components/**/*.e2e.js',
    'app/partials/**/*.html',
    'app/partials/**/*.js',
    'app/partials/**/*.scss',
    'app/data/*.json'
  ];

  gulp.task('triggerReload', false, function() {
    livereload.reload('./dist/app/index.html');
  });

  gulp.watch(coreFiles, function() {
    runSequence('build', 'triggerReload');
  });

};
