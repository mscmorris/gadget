"use strict"

import Rx from "rx"
import angular from "angular"

var moduleName = "twmPhotoUploadService";

class twmPhotoUploadService {

  constructor($log, igUtils, twmService, inspectionService, cameraService) 
  {

    this.$log = $log
    this.igUtils = igUtils
    this.twmService = twmService
    this.cameraService = cameraService
    this.inspectionService = inspectionService

    this.PENDING = "P"
    this.COMPLETE = "C"
  }

  upload(array)
  {
    this.uploadPhotosToDms(new Rx.Observable.from(array))
  }

  uploadPhotosToDms(photos)
  {
    var readyPhotos, ret, sent, received

    readyPhotos = this.readyToSend(photos)
    readyPhotos.subscribe(this.updateStatus(this.COMPLETE))

    ret = this.twmService.sendMessage(readyPhotos, this.sessionUploadProperties(), this.toDmsRequest())
    sent = ret[1]
    received = ret[0]

    this.handleReply(sent, received)
  }

  updateStatus(status)
  {
    return function(photo) {
      var id = photo.Id
      this.igUtils.logToContainer("Setting status on " + id + " to " + status)
      this.cameraService.updateLocalDmsOpCode(id, status)
    }
  }

  toDmsRequest()
  {
    return function(photoData) {
      var DMSRequest = {}

      DMSRequest.ProNumber = photoData.ProNumber
      DMSRequest.InspectorPhoto = [ photoData.PhotoBytes ]

      return angular.toJson(DMSRequest)
    }
  }

  sessionUploadProperties()
  {
    return {
      OperationName: "UPLOADDMS",
      EmployeeId: this.inspectionService.inspectorEmployeeID(),
      PersistInd: "C",
      PhotoType: "E"
    }
  }

  readyToSend(photos)
  {
    var shouldUpload = (photo) => { return photo.DmsOpCode !== this.COMPLETE }
    return photos.filter(shouldUpload)
  }

  handleReply(sent, received)
  {
    var successful

    var extractEid = (m) => m.getStringProperty("EventId")
    var wasSuccessful = (m) => m.getBooleanProperty("SuccessInd")

    successful = received
    .filter(wasSuccessful)
    .map(extractEid)

    successful.zip(sent, (eid, a) => { return { Id: a[0] }})
    .subscribe(this.updateStatus(this.COMPLETE))
  }
}

twmPhotoUploadService.$inject = ["$log", "igUtils", "twmService", "inspectionService", "cameraService"]

angular.module(moduleName, []).service(moduleName, twmPhotoUploadService)

export default moduleName
