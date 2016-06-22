'use strict';

/**
 * Build task
 */

var gulp                 = require('gulp');
var path                 = require('path');
var sq                   = require('streamqueue');
var runSequence          = require('run-sequence');
var del                  = require('del');
var browserify           = require('browserify');
var ngAnnotate           = require('browserify-ngannotate');
var watchify             = require('watchify');
var babelify             = require('babelify');
var streamify            = require('gulp-streamify');
var gutil                = require('gulp-util');
var plumber              = require('gulp-plumber');
var usemin               = require('gulp-usemin');
var cssRebaseUrls        = require('gulp-css-url-rebase');
var autoprefixer         = require('gulp-autoprefixer');
var minifyCss            = require('gulp-minify-css');
var concat               = require('gulp-concat');
var ngConstant           = require('gulp-ng-constant');
var gulpif               = require('gulp-if');
var uglify               = require('gulp-uglify');
var replace              = require('gulp-replace');
var revAll               = require('gulp-rev-all');
var sass                 = require('gulp-sass');
var srcMaps              = require('gulp-sourcemaps');
var buffer               = require('vinyl-buffer');
var source               = require('vinyl-source-stream');
var browserSync          = require('browser-sync');
var argv                 = require('yargs').argv;
var revToExclude         = require('./config/revFilesToExclude');
var errorHandler         = require('../util/handleErrors');

var toDelete = [];

// Environment flags
var environment = argv.env || 'development';
var isProd = environment == 'development' ? false : true;

function extend(target) {
  var sources = [].slice.call(arguments, 1);
  sources.forEach(function (source) {
    for (var prop in source) {
      target[prop] = source[prop];
    }
  });
  return target;
}

module.exports = function (done) {
  //npm package to run tasks in a particular order
  runSequence(
    ['clean:dist', 'sass', 'constants'],
    ['usemin', 'copy:dist'],
    ['replace', 'scripts', 'cssmin'],
    'rev',
    'clean:finish',
    done);
};

gulp.task('sass', false, function () {
  return gulp.src('app/styles/app.scss')
    .pipe(plumber())
    .pipe(sass())
    .pipe(gulp.dest('app/styles/css'));
});


gulp.task('clean:dist', false, function (done) {
  del(['dist/*', '!dist', '!dist/.git{,/**}'], done);
});

gulp.task('clean:finish', false, function (done) {

  if(isProd) {
    del([
      '.tmp/**',
      'dist/app/app.{css,js}',
      'dist/app/vendor.{css,js}'
    ].concat(toDelete), done);
  } else {
    del([
      '.tmp/**'
    ].concat(toDelete), done);
  }

});

gulp.task('copy:dist', false, function () {
  var main = gulp.src(['server/**/*', 'package.json'], { base: './' });
  var images = gulp.src('app/images/**/*', { base: './' });
  var views = gulp.src('app/partials/**/*', { base: './' });
  var componentUIs = gulp.src('app/components/**/*.html', { base: './' });
  var data = gulp.src('app/data/*.json', { base: './' });

  return sq({ objectMode: true }, main, images, views, componentUIs, data)
    .pipe(gulp.dest('dist/'));
});

gulp.task('constants', false, function () {
  var environment = argv.env || 'development';
  var myConfig = require('./config/constantsConfig');
  var envConfig = myConfig[environment];
  var envIndependent = myConfig["env_independent"];

  var mergedConstants = extend({}, envConfig, envIndependent);
  return ngConstant({
      name: "igApp.constants",
      constants: mergedConstants,
      wrap: "commonjs",
      stream: true
    })
    .pipe(gulp.dest('./app/config/'));
});

gulp.task('usemin', false, function () {
  return gulp.src('app/index.html')
    .pipe(plumber())
    .pipe(usemin({ css: ['concat'] }))
    .pipe(gulp.dest('dist/app/'));
});

gulp.task('cssmin', false, function () {
  return gulp.src('dist/app/styles/*.css')
    .pipe(autoprefixer())
    .pipe(minifyCss())
    .pipe(gulp.dest('dist/app/'));
});

function bundleScript(entryPoint, file) {

  var bundler = browserify({
    entries: entryPoint,
    debug: true,
    cache: {},
    packageCache: {},
    fullPaths: !isProd
  });

  var transforms = [
    { 'name':babelify, 'options': {}},
    { 'name':ngAnnotate, 'options': {}}
  ];

  //bundler.transform(babelify.configure({
  //  externalHelpers: true,
  //  modules: 'common'
  //}));

  transforms.forEach(function(transform) {
    bundler.transform(transform.name, transform.options);
  });

  function rebundle() {
    var stream = bundler.bundle();

    gutil.log('Rebundle...');

    return stream.on('error', errorHandler)
      .pipe(source(file))
      .pipe(gulpif(isProd, buffer()))
      .pipe(gulpif(isProd, srcMaps.init()))
      .pipe(gulpif(isProd, streamify(uglify({
        compress: { drop_console: true }
      }))))
      .pipe(gulpif(isProd, srcMaps.write('./')))
      .pipe(gulp.dest("./dist/"))
      .pipe(browserSync.stream({ once: true }));
  }

  // NOTE: The build process is ran by the 'watch' task every time a relevant file change is made.
  //       If the app is no longer rebuilt by the 'watch' task, then use the 'watchify' code below to
  //       rebundle the scripts automatically.
  // if ( !isProd ) {
  //   bundler = watchify(bundler);
  //   bundler.on('update', function() {
  //     rebundle();
  //   });
  // }

  return rebundle();
}

gulp.task('scripts', false, function () {
  var combinedEntries = ['./app/app.js'];
  return bundleScript(combinedEntries, './app/app.js'); // Path is relative to the gulp.dest location for the bundle
});

gulp.task('replace', false, function () {
  return gulp.src('dist/app/index.html')
    .pipe(replace(/\s*<script.*livereload.*><\/script>/, ''))
    .pipe(gulp.dest('dist/app'));
});

gulp.task('rev', false, function () {

  if(isProd) {
    var rev = new revAll({
      transformFilename: function (file, hash) {
        var filename = path.basename(file.path);
        if (revToExclude.indexOf(filename) !== -1) {
          return filename;
        }
        toDelete.push(path.resolve(file.path));
        var ext = path.extname(file.path);
        return path.basename(file.path, ext) + '.' + hash.substr(0, 8) + ext;
      }
    });

    return gulp.src('dist/app/**')
      .pipe(rev.revision())
      .pipe(gulp.dest('dist/app/'));
  } else {
    return 'done';
  }
});
