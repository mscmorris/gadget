export default ngModule => {
  var providerName = 'cameraService';

  class cameraService {
    /* @ngInject */
    constructor($http, $window, $log, igUtils, $q, igLoggerService) {
      this.$http = $http;
      this.$window = $window;
      this._$log = $log;
      this.igUtils = igUtils;
      this.igLoggerService = igLoggerService;
      this.currPhotoID = "";
      this.currPhotoSource = "";
      this.currPhotoOrigin = "";
      this._$q = $q;
      this.photoGalleryUpdatedCallback = undefined;
      this.photoTakenCallback = undefined;

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
      if (typeof id != "undefined" && typeof code != "undefined" && ["N","P","C","S"].includes(code.toUpperCase())){
        if (s.igUtils.isExternalFunc("updateDmsOpCode")) {
          container.updateDmsOpCode(id, code);
        }
      }
    }
    showPhotoGallery(proNumber, photoId) {
      var s = this;
      if (typeof proNumber != "undefined") {
        if (s.igUtils.isExternalFunc("showPhotoGallery")) {
          container.showPhotoGallery(proNumber, photoId);
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
        container.listPhotos(proNum, false, function(value) {
          s._$log.debug("Returned!");
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

    listPhotosNotSentToDms(){
      var s =this;
      var defer = s._$q.defer();
      var promise = defer.promise;
      if (s.igUtils.isExternalFunc("listPhotosNotSentToDms")){
        s._$log.debug("Making Call");
        container.listPhotosNotSentToDms(function(value) {
          s._$log.debug("Returned!");
          if (value === ""){
            defer.reject();
          }else {
            defer.resolve(angular.fromJson(value));
          }
        });
      } else {
        s._$log.error("Call to ListPhotosNotSentToDms was rejected!");
        defer.reject();
      }
      return promise;
    }
    getPendingPhotoCount(){
      var s =this;
      var defer = s._$q.defer();
      var promise = defer.promise;
      if (s.igUtils.isExternalFunc("getPendingPhotoCount")){
        s._$log.debug("Making Call");
        container.getPendingPhotoCount(function(value) {
          s._$log.debug("Returned!");
          if (value === ""){
            defer.reject(0);
          }else {
            defer.resolve(angular.fromJson(value));
          }
        });
      } else {
        s._$log.error("Call to ListPhotosNotSentToDms was rejected!");
        defer.reject(0);
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
        s.igLoggerService.logMessage("Inserting Manually Uploaded Photos for a PRO number: " + proNum, s.igLoggerService.DebugLogLevel);
        s._$log.debug("Inserting Manually Uploaded Photos for a PRO number: " + proNum);
        container.insertPhoto(proNum, images);
      } else {
        var errorMsg = "[ERROR]: External Function 'InsertPhoto' is not available - Inserting Photos failed.";
        s._$log.error(errorMsg);
        return errorMsg;
      }

    }

    /**
     * Requests a photo record from SQLite by accessing the container app and returns the record in JSON format as a promise
     * Returns 'undefined' if no record was found.
     * @param photoId - The identifier associated with the photo record
     */
    getPhoto(photoId) {
      var s = this;
      var defer = s._$q.defer();
      var promise = defer.promise;
      if (s.igUtils.isExternalFunc("getPhoto") && angular.isDefined(photoId)){
        container.getPhoto(photoId, true, function(value) {
          if(angular.isUndefined(value) || value === null){
            defer.reject(undefined);
          }else {
            defer.resolve(angular.fromJson(value));
          }
        });
      } else {
        s._$log.error("Call to getPhoto was rejected!");
        defer.reject(undefined);
      }
      return promise;
    }

    registerPhotoGalleryUpdateListener(callback){
      var s = this;
      s.photoGalleryUpdateCallback = callback;
      if (s.igUtils.isExternalFunc("registerPhotoGalleryUpdatedListener")) {
        container.registerPhotoGalleryUpdatedListener(()=>{
          if (s.photoGalleryUpdateCallback != undefined){
            var defer = this._$q.defer();
            var promise = defer.promise;
            promise.then(()=>{
              s.photoGalleryUpdateCallback();
            });
            defer.resolve();
          }
        });
      }
    }
    registerPhotoTakenListener(callback){
      var s = this;

      s.photoTakenCallback = callback;
      if (s.igUtils.isExternalFunc("registerPhotoTakenListener")) {
        var defer = this._$q.defer();
        var promise = defer.promise;
        container.registerPhotoTakenListener((photoJson)=>{
          if (s.photoTakenCallback != undefined){
            promise.then(()=>{
              s.photoTakenCallback(angular.fromJson(photoJson));
            });
            defer.resolve();
          }
        });
      }

    }

    /**
      Not being used right now
     */
    //registerPreviewPhotoListener(callback){
    //  var s = this;
    //
    //  s.photoPreviewCallback = callback;
    //  if (s.igUtils.isExternalFunc("registerPreviewPhotoListener")) {
    //    var defer = s._$q.defer();
    //    var promise = defer.promise;
    //    container.registerPreviewPhotoListener((photoJson)=>{
    //      if (s.photoPreviewCallback != undefined){
    //        promise.then(()=>{
    //          s.photoPreviewCallback(angular.fromJson(photoJson));
    //        });
    //        defer.resolve();
    //      }
    //    });
    //  }
    //}

    registerPendingPhotosListener(callback){
      var s = this;
      s.pendingPhotosListener = callback;
      if (s.igUtils.isExternalFunc("registerPendingPhotosListener")) {
        container.registerPendingPhotosListener((photoJson)=>{
          if (s.pendingPhotosListener != undefined){
            s.pendingPhotosListener(angular.fromJson(photoJson));
          }
        });
      }
    }
  }
  ngModule.service(providerName, cameraService);
};
