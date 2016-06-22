export default ngModule => {
  var providerName = 'cameraService';

  class cameraService {
    /* @ngInject */
    constructor($http, $window, $log, DMS_END_POINT, igUtils, $q) {
      this.$http = $http;
      this.$window = $window;
      this._$log = $log;
      this.dmsEndPoint = DMS_END_POINT; // Example of how to use 'igApp.constants' values
      this.igUtils = igUtils;
      this.currPhotoID = "";
      this.currPhotoSource = "";
      this.currPhotoOrigin = "";
      this._$q = $q;
    }

    getPhotoImages() {
      var s = this; // Avoid naming collisions instead of using 'this'
      s.$http.get(s.dmsEndPoint)
        .then(response => {
          s._$log.debug(providerName + "[getPhotoImages]: Images call complete");
          return response;
        },
          error => {
          s._$log.error(providerName + "[getPhotoImages]: Images call failed!");
        });
    }

    /**
     * Checks for the existence of the external camera by determining the existence of the 'LaunchCamera' external function
     * @returns {Boolean}
     */
    getCameraAvailablity() {
      return this.igUtils.isExternalFunc('launchCamera');
    }

    /**
     * Accesses the inter comm app and performs the 'LaunchCamera' function to open the camera UI
     */
    launchCamera(proNumber, inspectionStatus) {
      var s = this;
      if (s.igUtils.isExternalFunc("launchCamera")) {
        container.writeLogEntry("Web App is launching the camera", "Warning");
        s._$log.info("Launching camera app...");
        container.launchCamera(proNumber, inspectionStatus);
      } else {
        var errorMsg = "[ERROR]: External Function 'LaunchCamera' is not available - camera launch failed.";
        s._$log.error(errorMsg);
        return errorMsg;
      }
    }

    /**
     * Setter function for currPhotoID
     */
    setCurrPhotoID(idVal) {
      var vm = this;
      vm.currPhotoID = idVal;
    }

    /**
     * Getter function for currPhotoID
     */
    getCurrPhotoID() {
      var vm = this;
      return vm.currPhotoID;
    }

    /**
     * Setter function for currPhotoSource
     */
    setCurrPhotoSource(sourceVal) {
      this.currPhotoSource = sourceVal;
    }

    /**
     * Getter function for currPhotoSource
     */
    getCurrPhotoSource() {
      return this.currPhotoSource;
    }

    /**
     * Setter function for currPhotoOrigin
     */
    setCurrPhotoOrigin(origin) {
      this.currPhotoOrigin = origin;
    }

    /**
     * Getter function for currPhotoOrigin
     */
    getCurrPhotoOrigin() {
      return this.currPhotoOrigin;
    }

    updateLocalDmsMessageId(id, messageId){
      var s =this;
      if (typeof id != "undefined" && typeof messageId != "undefined"){
        if (s.igUtils.isExternalFunc("updateDmsMessageIdForPhoto")) {
          container.updateDmsMessageIdForPhoto(id, messageId);
        }
      }
    }

    updateLocalDmsOpCode(id, code){
      var s =this;
      if (typeof id != "undefined" && typeof code != "undefined" && (code === "N" || code === "P" || code === "C")){
        if (s.igUtils.isExternalFunc("updateDmsOpCode")) {
          container.updateDmsOpCode(id, code);
        }
      }
    }

    deleteLocalPhoto(id){
      var s =this;
      if (s.igUtils.isExternalFunc("deletePhoto") && typeof id != "undefined") {
        s._$log.debug("Calling deletePhoto");
        container.deletePhoto(id);
      }
    }

    listLocalPhotos(proNum) {
      var s =this;
      var defer = s._$q.defer();
      var promise = defer.promise;
      if (s.igUtils.isExternalFunc("listPhotos") && typeof proNum != "undefined"){
        s._$log.debug("Making Call");
        container.listPhotos(proNum, function(value) {
          s._$log.debug("Returned!");
          s._$log.debug(value);

          if (value == ""){
            defer.reject();
          }else {
            defer.resolve(angular.fromJson(value));
          }
        });
      } else {
        s._$log.error("Call to listPhotos was rejected!");
        defer.reject();
      }
      return promise;
    }

    listLocalThumbnails(proNum) {
      var s =this;
      var defer = s._$q.defer();
      var promise = defer.promise;
      if (s.igUtils.isExternalFunc("listThumbs") && typeof proNum != "undefined"){
        s._$log.debug("Making call to listThumbs");
        container.listThumbs(proNum, function(value) {
          s._$log.debug("Returned!");
          s._$log.debug(value);

          if (value == ""){
            defer.reject();
          }else {
            defer.resolve(angular.fromJson(value));
          }
        });
      } else {
        s._$log.error("Call to listThumbs was rejected!");
        defer.reject();
      }
      return promise;
    }

    /**
     * Accesses the inter comm app to Insert the External Image imported in WEB
     *
     */
    insertPhoto(proNum, images)
    {
      var s = this;
      if (s.igUtils.isExternalFunc("insertPhoto")) {
        s.igUtils.logToContainer("Inserting Manually Uploaded Photos for a PRO number: " + proNum, "Debug");
        s._$log.debug("Inserting Manually Uploaded Photos for a PRO number: " + proNum);
        container.insertPhoto(proNum, images);
      } else {
        var errorMsg = "[ERROR]: External Function 'InsertPhoto' is not available - Inserting Photos failed.";
        s._$log.error(errorMsg);
        return errorMsg;
      }

    }

    registerPhotoTakenListener(){
      var defer = this._$q.defer();
      var promise = defer.promise;

      var s = this;
      if (s.igUtils.isExternalFunc("registerPhotoTakenListener")) {
        container.registerPhotoTakenListener((photoJson)=>{
          defer.resolve(angular.fromJson(photoJson));
        });
      }else{
        defer.reject();
      }
      return promise;
    }

    registerPreviewPhotoListener(){
      var defer = this._$q.defer();
      var promise = defer.promise;

      var s = this;
      if (s.igUtils.isExternalFunc("registerPreviewPhotoListener")) {
        container.registerPreviewPhotoListener((photoJson)=>{
          defer.resolve(angular.fromJson(photoJson));
        });
      }else{
        defer.reject();
      }
      return promise;
    }

    registerPendingPhotosListener(){
      var defer = this._$q.defer();
      var promise = defer.promise;

      var s = this;
      if (s.igUtils.isExternalFunc("registerPendingPhotosListener")) {
        container.registerPendingPhotosListener((photoJson)=>{
          defer.resolve(angular.fromJson(photoJson));
        });
      }else{
        defer.reject("container not available");
      }
      return promise;
    }
  }
  ngModule.service(providerName, cameraService);
};
