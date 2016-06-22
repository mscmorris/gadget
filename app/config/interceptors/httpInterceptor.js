export default /* @ngInject */ function($q, $rootScope, igLoggerService, SERVER_ERROR, CODE_CONSTANTS, $timeout) {

  let logRequestSuccess = (config) => {
    igLoggerService.logMessage(`Request - Url: ${config.url}, Method: ${config.method}`,igLoggerService.InformationLogLevel);
  };

  let logResponseSuccess = (config) => {
    igLoggerService.logMessage(`Response - Url: ${config.config.url}, Method: ${config.config.method}, Status: ${config.status}, Status Text: ${config.statusText}`,igLoggerService.InformationLogLevel);
  };

  let logRequestError = (rejection) => {
    igLoggerService.logMessage(`Request Error - Url: ${rejection.config.url}, Method: ${rejection.config.method}, Status: ${rejection.status}, Status Text: ${rejection.statusText}`, igLoggerService.ErrorLogLevel);
  };

  let logResponseError = (rejection) => {
    igLoggerService.logMessage(`Response Error - Url: ${rejection.config.url}, Method: ${rejection.config.method}, Status: ${rejection.status}, Status Text: ${rejection.statusText}`, igLoggerService.ErrorLogLevel);
    if(rejection.data != undefined && rejection.data.message) {
      igLoggerService.logMessage(`Response Error Message: ${rejection.data.message}`);
    }
  };

  let defaultError = {"status" : 500, "data": { "message" : "System error. Please contact support."} };

  return {
    'request': function(config) {
      logRequestSuccess(config);
      return config;
    },
    'response': function(response) {
      let headers = response.headers();
      if(typeof response.data == "string" && response.data.includes(SERVER_ERROR.HTML_CONTENTS)) {
        logResponseError(response);
        igLoggerService.logMessage(`(Response Error above was caught from IIS default 500 HTML page)`);
        return $q.reject(defaultError);
      } else if(headers[SERVER_ERROR.HEADER.toLowerCase()] !== undefined && headers[SERVER_ERROR.HEADER.toLowerCase()] == "true") {
        response.data.message = `System error. Please contact support. (${response.data.message})`;
        logResponseError(response);
        return $q.reject(response);
      } else {
        logResponseSuccess(response);
        return response;
      }
    },
    'requestError': function(rejection) {
      logRequestError(rejection);
      return $q.reject(rejection);
    },
    'responseError': function(rejection) {
      logResponseError(rejection);
      if(rejection.status == CODE_CONSTANTS.NO_NETWORK_CONN && (angular.isUndefined(rejection.config.igRetryCount) || rejection.config.igRetryCount == 0)) {
        // The "-1" value is Angular's way of indicating there's no network connection
        $timeout(()=> {
          $rootScope.toast(`No network connection detected. Please connect and try again.`);
        },200);
        return $q.reject(rejection);
      } else if(!angular.isObject(rejection.data) || rejection.data.message === undefined) {
        return $q.reject(defaultError);
      } else {
        return $q.reject(rejection);
      }
    }
  };
}
