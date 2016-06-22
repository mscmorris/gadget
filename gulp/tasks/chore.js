'use strict';

/**
 * Git versioning and bump
 */

var gulp    = require('gulp');
var fs      = require('fs');
var bump    = require('gulp-bump');
var git     = require('gulp-git');
var argv    = require('yargs').argv;
var gulpif  = require('gulp-if');

module.exports = {

  version: function () {
    var _tag = argv.tag || "patch";
    var _version = argv.version || "0.0.0";
    console.log("tag: "+_tag+" version: "+_version);
    return gulp.src(['./package.json', './bower.json'])
      .pipe(gulpif(_tag === "patch", bump({
        tag: "patch",
        version: _version
      })))
      .pipe(gulpif(_tag !== "", bump({
        tag: _tag,
        version: _version
      })))
      .pipe(gulp.dest('./'));

  },

  bump: function () {
    var branch = argv.branch;
    fs.readFile('./package.json', function (err, data) {
      if (err) { return ; }
      return gulp.src(['./package.json', './bower.json'])
        .pipe(gulpif(JSON.parse(data).tag !== "patch",   git.add()))
        .pipe(gulpif(JSON.parse(data).tag !== "patch", git.commit('chore(core): bump to ' + JSON.parse(data).version)))
        .pipe(gulp.dest('dist/app/'))
        .on('end', function() {
          if(JSON.parse(data).tag !== "patch" && branch !== undefined && branch !== "") {
            git.push('origin', branch, function(err) {
              if(err) throw (err);
           });
          }
        });
    });
  }

};
