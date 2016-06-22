"use strict"

import angular from "angular"

import send from "./send.js"

var moduleName = "inspectionListService"

class inspectionListService {

  /** [constructor description] */
  /* @ngInject */
  constructor($http, inspectionService, mappingService, conditioningService, endPointLocatorService)
  {
    this.$http = $http
    this.mappingService = mappingService
    this.endPointLocatorService = endPointLocatorService
    this.inspectionService = inspectionService
    this.conditioningService = conditioningService
  }

  /** [context description] */
  context()
  {
    return this
      .mappingService
      .mapInspectionContextToRemoteRequest(this.inspectionService.inspectionContext)
  }

  add(proNumber)
  {
    var rawData, payload, _proNumber

    _proNumber = this.conditioningService.condition(proNumber, 11)

    rawData = {
      inspectionContext: this.context(),
      currentShipment: {
        proNbr: _proNumber
      },
      inspectionDetails: {
        inspectionNotes: {},
        inspectionStatusCd: "R"
      },
      inspectorPieceDimensions: []
    }

    payload = this.mappingService.mapCreateInspectionRequest(rawData)


    return send(this.$http, {inspection: payload}, this.endPointLocatorService.getInspectionEndPoint(["create"],["format=JSON"]))
  }
}

angular.module(moduleName, []).service(moduleName, inspectionListService)
