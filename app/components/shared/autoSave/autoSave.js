"use strict"

import Rx from "rx"
import angular from "angular"

var moduleName = "inspectionAutoSave"

//var fromPromise = Rx.Observable.fromPromise

class InspectionAutoSave {

  /* @ngInject */
  constructor(shipmentDetailsService, $log)
  {
    this.storage = shipmentDetailsService
    this.$log = $log;
  }

  handleError(e) {
    if(e) {
      this.$log.error(e.toString());
    }
    return e;
  }

  save(proNumber, shipment)
  {
    this.storage.createShipmentData(proNumber, angular.toJson(shipment))
    return Rx.Observable.return(true)
  }

  remove(proNumber)
  {
    this.storage.deleteShipmentData(proNumber)
    return Rx.Observable.return(true)
  }

  retrieve(proNumber)
  {
    return Rx.Observable.fromPromise(this.storage.getShipmentData(proNumber))
      .share()
  }

  retrieveNotes(proNumber)
  {
    return this
      .retrieve(proNumber)
      .map((s) => s.inspectionNotes.note)
  }
  retrieveDimensions(proNumber){
    return this
    .retrieve(proNumber)
    .map((s)=>angular.fromJson(s.inspectorPieceDimensions));
  }
}

angular.module(moduleName, []).service(moduleName, InspectionAutoSave)

export default moduleName
