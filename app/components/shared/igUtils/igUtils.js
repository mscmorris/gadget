export default ngModule =>
{
  var providerName = 'igUtils';

  class igUtils {
    /*@ngInject*/
    constructor($log, $q, $location, $timeout) {
      this._$log = $log;
      this._$q = $q;
      this._$location = $location
      this._commBridgeOpen = false;
      this.timer = undefined;
      this._$timeout = $timeout;

    }

    isExternalFunc(func) {
      if (typeof container != 'undefined' && (func in container)) {
        return true;
      }
      else {
        return false;
      }
    }

    inObjectArray(srcArr, property, searchFor) {
      var retVal = -1;
      for(var index=0; index < srcArr.length; index++){
        var item = srcArr[index];
        if (item.hasOwnProperty(property)) {
          if (item[property].toString().toLowerCase() === searchFor.toLowerCase()) {
            retVal = index;
            return retVal;
          }
        }
      }
      return retVal;
    }

    setCommBridgeOpen(val) {
      if (val === true || val === false) {
        this._commBridgeOpen = val;
      }
    }
    showVirtualKeyboard(show){
      if (this.isExternalFunc("showVirtualKeyboard")) {
        if (!show){
          this.timer = this._$timeout(function () {
            container.showVirtualKeyboard(show);
          }, 100);

        }else {
          if (this.timer != undefined) {
            this._$timeout.cancel(this.timer);
            this.timer = undefined;
          }
          container.showVirtualKeyboard(show);
        }
      }
    }

    sendFeedback(category, comments, context){
      if (this.isExternalFunc("sendFeedback")) {
        container.sendFeedback(category, comments, context);
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
    getAppVersionInformation() {
      var defer = this._$q.defer();
      var promise = defer.promise;
      if (this.isExternalFunc("getAppVersionInformation")){
        container.getAppVersionInformation(function(value) {
          if (value == ""){
            defer.reject();
          }else {
            defer.resolve(angular.fromJson(value));
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

    extend(target) {
      var sources = [].slice.call(arguments, 1);
      sources.forEach(function (source) {
        for (var prop in source) {
          target[prop] = source[prop];
        }
      });
      return target;
    }
  }
  ngModule.service(providerName, igUtils);
};
