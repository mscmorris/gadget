'use strict';

var gulp = require('gulp-help')(require('gulp'));
//var gulp = require('gulp');
var tasksRoot = './gulp/tasks/';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

gulp.task('default', false,   ['serve']);
gulp.task('serve', 'Launch a local development server', ['watch'], require(tasksRoot + 'serve').nodemon);
gulp.task('watch', false,                   require(tasksRoot + 'watch'));
gulp.task('preview', false,   ['build'],    require(tasksRoot + 'preview'));
gulp.task('build', 'Build the dist files', require(tasksRoot + 'build'), { options: { 'env=production':'run extra build steps for production' }});
gulp.task('bump', false,      ['version'],  require(tasksRoot + 'chore').bump);
gulp.task('version', false,                  require(tasksRoot + 'chore').version);
gulp.task('control', false,                 require(tasksRoot + 'control'));
gulp.task('e2e:update', false,              require(tasksRoot + 'test').e2eUpdate);
gulp.task('e2e', false,       ['serve'],    require(tasksRoot + 'test').e2eTests);
gulp.task('test', false,                    require(tasksRoot + 'test').test);
gulp.task('sassdoc', false,                 require(tasksRoot + 'doc').sassdoc);
gulp.task('apidoc', false,                  require(tasksRoot + 'doc').apidoc);
