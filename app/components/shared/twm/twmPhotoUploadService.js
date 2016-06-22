"use strict"

import Rx from "rx"
import angular from "angular"
import _ from "lodash"

var moduleName = "twmPhotoUploadService";

class twmPhotoUploadService {

  /* @ngInject */
  constructor($rootScope, $log, igUtils, twmService, inspectionService, cameraService) {
    this.$rootScope = $rootScope;
    this.$log = $log;
    this.igUtils = igUtils;
    this.twmService = twmService;
    this.cameraService = cameraService;
    this.inspectionService = inspectionService;

    this.PENDING = "P";
    this.COMPLETE = "C";
    this.SENDING = "S";

    this.uploadQueue = [];
    this.maxPhotoSetLength = 20;
    this.isProcessingPhotoSet = false;
    this.initObservation();

    this.$rootScope.$on('twmTransmitFailed', () => {
      this.$log.debug(`${moduleName}: twmTransmitFailed event received.`);
      // TODO: reimplement this logic after we've figured out why the IllegalStateException is being thrown
      //if(this.uploadQueue.length > 0) {
      //  this.$log.debug(`${moduleName}: Resetting photos' state to ${this.PENDING}.`);
      //  var readyPhotos = this.readyToSend(new Rx.Observable.from(this.uploadQueue[0]));
      //  readyPhotos
      //    .doOnCompleted(() => {
      //      this.uploadQueue = [];
      //      this.doCleanup();
      //    })
      //    .subscribe((photo) => {
      //      this.updateStatus(this.PENDING).call(this, photo)
      //    })
      //} else {
      //  this.doCleanup();
      //}
      this.doCleanup();
    });

    this.$rootScope.$on('twmTransmitCompleted', () => {
      this.$log.debug(`${moduleName}: twmTransmitCompleted event received.`);
      this.uploadQueue.splice(0, 1);
      this.doCleanup();
    });
  }

  initUpload() {
    this.isProcessingPhotoSet = true;
  }

  initObservation() {
    this.$log.debug(`[${moduleName}]: Initializing TWM Observation...`);
    this.uploadObserver = new Rx.Observer.create(
      (array) => {
        this.$log.debug(`[${moduleName}]: Sending next photo set to be uploaded.`);
        this.uploadPhotosToDms(new Rx.Observable.from(array));
      },
      (e) => {
        this.$log.error(`${moduleName}: ${e.toString()}`);
        this.uploadQueue = [];
        this.doCleanup();
      });
    this.uploadObservable = new Rx.Subject();
    this.uploadObservable.subscribe(this.uploadObserver);
  }

  doCleanup() {
    this.$log.debug(`[${moduleName}]: Performing TWM cleanup...`);
    this.isProcessingPhotoSet = false;
    this.twmService.disconnect(() => {
      if(this.uploadQueue.length !== 0) {
        this.uploadObservable.onNext(this.uploadQueue[0]);
      }
    });
  }

  /**
   * Entry point to the service. The function will add only photos that should be uploaded to the queue and update their status to S(SENDING)
   * If the size of the array is greater than the maximum size for a photo set, it will be broken up into subsets of the max length.
   * @param array - An array of Photo records
   */
  upload(array) {
    if(array && Array.isArray(array) && array.length > 0) {
      this.$log.debug(`${moduleName}[upload]: Adding a photo set to the TWM Queue`);

      var processPhotos = () => {
        if(this.uploadQueue.length > 0) {
          if(this.isProcessingPhotoSet == false) {
            this.$log.debug(`${moduleName}[upload]: First item entered the queue; triggering upload process.`)
            this.uploadObservable.onNext(this.uploadQueue[0]);
          } else {
            this.$log.debug(`${moduleName}[upload]: Number of photo sets queued is ${this.uploadQueue.length}.`)
          }
        }
      };

      var readyPhotos = this.readyToSend(new Rx.Observable.from(array));

      readyPhotos.subscribe((photo) => {
        this.updateStatus(this.SENDING).call(this, photo)
      });

      readyPhotos.toArray()
        .doOnCompleted(processPhotos.bind(this))
        .subscribe((filteredArray) => {
          angular.forEach(this.photoSetLimiter(filteredArray), (subset) => {
            if(subset.length > 0) {
              this.uploadQueue.push(subset);
            }
          });
        });
    }
  }

  photoSetLimiter(srcArray) {
    if(srcArray && Array.isArray(srcArray) && srcArray.length > 0) {
      let loopCount = parseInt(srcArray.length / this.maxPhotoSetLength, 10);
      let remainder = srcArray.length % this.maxPhotoSetLength;
      let returnArray = [];
      this.$log.debug(`${moduleName}[photoSetLimiter]: loopCount is ${loopCount}; remainder is ${remainder}; srcArray length is ${srcArray.length}`);
      if(loopCount > 0) {
        for(var i = 0; i < loopCount; i++) {
          returnArray.push(srcArray.slice(i * this.maxPhotoSetLength, (i * this.maxPhotoSetLength) + this.maxPhotoSetLength))
        }
      }
      if(remainder > 0) {
        let startIndex = loopCount * this.maxPhotoSetLength;
        returnArray.push(srcArray.slice(startIndex, srcArray.length))
      }
      this.$log.debug(`${moduleName}[photoSetLimiter]: srcArray was split into ${returnArray.length} subset(s)`);
      return returnArray;
    }
    this.$log.debug(`${moduleName}[photoSetLimiter]: returning default array`);
    return [];
  }

  uploadPhotosToDms(photos) {
    var readyPhotos, ret, sent, received;

    this.initUpload();

    // Send
    ret = this.twmService.sendMessage(photos, this.sessionUploadProperties(), this.toDmsRequest(), this.inspectionService.inspectorEmployeeID())
    sent = ret[1];
    received = ret[0];

    this.handleReply(sent, received)

  }

  updateStatus(status) {
    return (photo) => {
      var id = photo.Id;
      this.$log.debug(`Setting status on ${id} to ${status}`);
      photo.DmsOpCode = status;
      this.cameraService.updateLocalDmsOpCode(id, status);
    }
  }

  toDmsRequest() {
    return (photoData) => {
      if(angular.isUndefined(photoData.PhotoBytes) || photoData.PhotoBytes === null) {
        return Rx.Observable.fromPromise(this.cameraService.getPhoto(photoData.Id))
          .map((data) => {
            var DMSRequest = {};
            DMSRequest.ProNumber = photoData.ProNumber;
            DMSRequest.InspectorPhoto = [ data.PhotoBytes ];
            return angular.toJson(DMSRequest)
          });
      } else {
        var DMSRequest = {};
        DMSRequest.ProNumber = photoData.ProNumber;
        DMSRequest.InspectorPhoto = [ photoData.PhotoBytes ];
        return Rx.Observable.just(angular.toJson(DMSRequest));
      }
    }
  }

  sessionUploadProperties() {
    return (photoData) => {
      return {
        OperationName: "UPLOADDMS",
        EmployeeId: this.inspectionService.inspectorEmployeeID(),
        PhotoType: photoData.PhotoSource,
        Compressed: "true"
      }
    }
  }

  readyToSend(photos) {
    var shouldUpload = (photo) => { return photo.DmsOpCode != this.COMPLETE }
    return photos.filter(shouldUpload)
  }

  handleReply(sent, received) {
    var successful
    var extractEid = (m) => m.getStringProperty("EventId")
    var wasSuccessful = (m) => m.getBooleanProperty("SuccessInd")
    var updateToComplete = this.updateStatus(this.COMPLETE);

    successful = received
    .filter(wasSuccessful)
    .map(extractEid)

    successful.zip(sent, (eid, m) => { return { Id: m[0] }})
    .subscribe((photo) => {
        this.$log.debug(`Sending photoId ${photo.Id} to update status to complete`)
        updateToComplete(photo);
      }
    )
  }
}

twmPhotoUploadService.$inject = ["$rootScope","$log", "igUtils", "twmService", "inspectionService", "cameraService"]

angular.module(moduleName, []).service(moduleName, twmPhotoUploadService)

export default moduleName
