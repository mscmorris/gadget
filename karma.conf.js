module.exports = function(config) {
  config.set({


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['browserify', 'jasmine'],

    // list of files / patterns to load in the browser
    files: [
    'test/**/*.js'
    ],

    reporters: ['progress'],

    preprocessors: {
      'test/**/*.js': ['browserify']
    },

    babelPreprocessor: {
      options: {
        presets: ['es2015'],
        sourceMap: 'inline'
      }
    },

    browserify: {
      debug: true,
      transform: ['babelify']
    },

    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_DEBUG,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false
  })
}