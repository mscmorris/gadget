"use strict"

import Rx from "rx"

/* @ngInject */
export default function($log, cameraService, twmPhotoUploadService) {

  var callback = function(photos){
    $log.info("Beginning background process for uploading pending photos to DMS.");
    twmPhotoUploadService.upload(photos)
  };
  cameraService.registerPendingPhotosListener(callback);
  return callback;
}
