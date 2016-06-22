export default ngModule => {
  var providerName = 'httpSessionService';

  function _invokeHttpService(httpMethod, recurseFn) {
    var s = this;
    return (url, config, retries, promise, data) => {
      s._$log.debug(`Starting request for URL: ${url} retry count: ${retries}`);
      config.igRetryCount = retries;
      var serverResponse;
      if(!angular.isUndefined(data)) {
        serverResponse = httpMethod(url, data, config);
      } else {
        serverResponse = httpMethod(url, config);
      }
      serverResponse.then(
          response => {
            s._$log.info(`Successful response for URL: ${url}`);
            s._$rootScope.$emit('retryRequest', {noRetry: true});
            promise.resolve(response);
          },
          error => {
            s._$log.info(`Error Status: ${error.status}, retries: ${retries}`)
            if (s.isErrorStatus(error.status) && retries > 0) {
              s._$log.warn(`Retrying request for URL: ${url}`);
              s._$timeout(()=>{
                s._$rootScope.$emit('retryRequest', {message: `Request failed. Retrying request, attempts remaining ${retries-1}`});
                s._$log.warn(`Retrying request for URL: ${url}`);
                recurseFn.call(s, url, config, --retries, promise, data);
              },s._retryDelay);
              return;
            } else {
              s._$rootScope.$emit('retryRequest', {noRetry: true});
            }
            s._$log.error(`Request for URL: ${url} failed.`);
            promise.reject(error)
          });
    }
  }

  function _get(url, config, retries, promise) {
    _invokeHttpService.call(this, this._$http.get, _get).apply(this, [url, config, retries, promise, undefined]);
  }

  function _post(url, config, retries, promise, data) {
    _invokeHttpService.call(this, this._$http.post, _post).apply(this, [url, config, retries, promise, data]);
  }

  class httpSessionService {
    /*@ngInject*/
    constructor($log, $http, $q, $timeout, CODE_CONSTANTS, $rootScope) {
      this._$log = $log;
      this._$http = $http;
      this._$q = $q;
      this._$timeout = $timeout;
      this._$rootScope = $rootScope;
      this._CODE_CONSTANTS = CODE_CONSTANTS;
      this._retryDelay = 2000; //delay between retries in milliseconds
    }

    get(url, config, retries = 5) {
      var s = this;
      var deferred = s._$q.defer();
      _get.apply(s, [url, config, retries, deferred]);
      return deferred.promise;
    }

    post(url, data, config, retries = 5) {
      var s = this;
      var deferred = s._$q.defer();
      _post.apply(this,[url, config, retries, deferred, data]);
      return deferred.promise;
    }

    isErrorStatus(status){
      var s = this;
      return (status == s._CODE_CONSTANTS.NO_NETWORK_CONN || status == 500);
    }

  }
  ngModule.service(providerName, httpSessionService);
}
