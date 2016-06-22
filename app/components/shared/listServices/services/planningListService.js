"use strict"

import angular from "angular"

import send from "./send.js"

var moduleName = "planningListService"

class planningListService {

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

  context()
  {
    return this
      .mappingService
      .mapInspectionContextToRemoteRequest(this.inspectionService.inspectionContext)
  }

  sic()
  {
    return this
      .context()
      .inspectionSIC
  }

  add(proNumber)
  {
    var url, payload, _proNumber

    _proNumber = this.conditioningService.condition(proNumber, 11)

    url = `${this.ENDPOINT}/${this.sic()}/shipments/${_proNumber}/plan?format=JSON`

    payload = {
      inspectionContext: this.context(),
      sic: this.sic(),
      proNbr: _proNumber
    }

    return send(this.$http, payload, this.endPointLocatorService.getInspectionEndPoint([this.sic(),"shipments",_proNumber,"plan"],["format=JSON"]))
  }
}

angular.module(moduleName, []).service(moduleName, planningListService)
