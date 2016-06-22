'use strict';

var notify               = require('gulp-notify');
var argv                 = require('yargs').argv;

module.exports = function(error) {
  var isProd = argv.env && argv.env == 'production' ? true : false;
  if( !isProd ) {

    var args = Array.prototype.slice.call(arguments);

    // Send error to notification center with gulp-notify
    notify.onError({
      title: 'Compile Error',
      message: '<%= error.message %>'
    }).apply(this, args);

    // Keep gulp from hanging on this task
    this.emit('end');

  } else {
    // Log the error and stop the process
    // to prevent broken code from building
    console.log(error);
    process.exit(1);
  }

};
