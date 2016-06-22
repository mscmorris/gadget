export default ngModule =>
{
  var providerName = 'igUtils';

  class igUtils {
    /*@ngInject*/
    constructor($http, $window, $log, $q) {
      this._$http = $http;
      this._$log = $log;
      this._$window = $window;
      this._$q = $q;
      this._commBridgeOpen = false;

    }

    isExternalFunc(func) {
      if (typeof container != 'undefined' && (func in container)) {
        return true;
      }
      else {
        return false;
      }
    }

    setCommBridgeOpen(val) {
      if (val === true || val === false) {
        this._commBridgeOpen = val;
      }
    }

    logToContainer(message, logLevel) {
      if (this.isExternalFunc("writeLogEntry")) {
        var _level = (logLevel !== undefined) ? logLevel : "Debug";
        container.writeLogEntry("[Message from Web App]: " + message, _level);
      }
    }

    setPreference(prefName, prefVal) {
      var defer = this._$q.defer();
      var promise = defer.promise;
      if (this.isExternalFunc("setPreference") && typeof prefName != "undefined" && typeof prefVal != "undefined") {
        container.setPreference(prefName, prefVal);
        defer.resolve();
      }else{
        defer.reject();
      }
      return promise;
    }

    getPreference(prefName) {
      var defer = this._$q.defer();
      var promise = defer.promise;
      if (this.isExternalFunc("getPreferenceAsync") && typeof prefName != "undefined"){
        container.getPreferenceAsync(prefName, function(key, value) {
          if (value == ""){
            defer.reject();
          }else {
            defer.resolve(value);
          }
        });
      } else {
        defer.reject();
      }
      return promise;
    }
    deletePreference(prefName) {
      var s = this;
      if (this.isExternalFunc("deletePreference") && typeof prefName != "undefined") {
        container.deletePreference(prefName);
      } else {
        s._$log.warn("deletePreference not executed due to invalid parameters");
      }
    }
    launchExternalBrowser(targetUrl){
      var s = this;
      if (this.isExternalFunc("launchExternalBrowser") && typeof targetUrl != "undefined") {
        container.launchExternalBrowser(targetUrl);
      } else {
        s._$log.warn("launchExternalBrowser not executed due to invalid parameters");
      }
    }
    convertBase64TiffToPng(base64Tiff){
      var defer = this._$q.defer();
      var promise = defer.promise;
      if (this.isExternalFunc("convertTiffToPng") && typeof base64Tiff != "undefined"){
        container.convertTiffToPng(base64Tiff, function(value) {
          if (value == ""){
            defer.reject();
          }else {
            defer.resolve(value);
          }
        });
      } else {
        defer.reject();
      }
      return promise;
    }
  }
  ngModule.service(providerName, igUtils);
};
