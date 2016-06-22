export default /*@ngInject*/ function logDecorator($provide) {
  $provide.decorator('$log', function ($delegate, igLoggerService) {
    // Keep track of the original debug method, we'll need it later.
    var origDebug = $delegate.debug;
    var origLog = $delegate.log;
    var origInfo = $delegate.info;
    var origWarn = $delegate.warn;
    var origError = $delegate.error;

    $delegate.log = function(message){
      igLoggerService.logMessage(message,igLoggerService.InformationLogLevel);
      origLog.apply(null, arguments);
    };
    $delegate.info = function(message){
      igLoggerService.logMessage(message,igLoggerService.InformationLogLevel);
      origInfo.apply(null, arguments);
    };
    $delegate.warn = function(message){
      igLoggerService.logMessage(message,igLoggerService.WarningLogLevel);
      origWarn.apply(null, arguments);
    };
    $delegate.error = function(message){
      igLoggerService.logMessage(message,igLoggerService.ErrorLogLevel);
      origError.apply(null, arguments);
    };
    $delegate.debug = function (message) {
      igLoggerService.logMessage(message,igLoggerService.InformationLogLevel);
      origDebug.apply(null, arguments);
    };
    return $delegate;
  });
}
