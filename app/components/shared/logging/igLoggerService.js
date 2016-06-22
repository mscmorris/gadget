export default ngModule => {
  var providerName = 'igLoggerService';
  class igLoggerService {
    /*@ngInject*/
    constructor() {
      this.DebugLogLevel = "Debug";
      this.ErrorLogLevel = "Error";
      this.FatalLogLevel = "Fatal";
      this.InformationLogLevel = "Information";
      this.VerboseLogLevel = "Verbose";
      this.WarningLogLevel = "Warning";
    }
    isExternalFunc(func) {
      if (typeof container != 'undefined' && (func in container)) {
        return true;
      }
      else {
        return false;
      }
    }
    logMessage(message, logLevel){
      var s = this;
      if (s.isExternalFunc("writeLogEntry")) {
        if (typeof logLevel === 'undefined' || logLevel === ''){
          logLevel = this.InformationLogLevel;
        }
        container.writeLogEntry(`[Message from Web App]: ${message}`, logLevel);
      }
    }
  }
  ngModule.service(providerName, igLoggerService);
};
