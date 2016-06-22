export default ngModule => {

  var providerName = 'inspectionService';

  class inspectionService {

    /* @ngInject */
    constructor($http, $log, $window,$filter, mappingService, igUtils, endPointLocatorService,$q, persistenceService, $timeout, conditioningService, httpSessionService) {
      var s = this;
      s.persistenceService = persistenceService;
      s.$http = $http;
      s.$window = $window;
      s._$log = $log;
      s._$timeout = $timeout;
      s.$filter=$filter;
      s._httpSessionService = httpSessionService;
      s.mappingService = mappingService;
      s.igUtils = igUtils;
      s.shipmentDetailsTimeoutToken = undefined;
      s.inspectionDetailsTimeoutToken = undefined;
      s.conditioningService = conditioningService;
      s.currentShipment = {};
      s.currentInspection = {};
      s.endPointLocatorService = endPointLocatorService;
      s.inspectionContext={
        "inspectionSIC" :"",
        "shiftCd":"",
        "inspectorFirstName":"",
        "inspectorLastName":"",
        "inspectorEmployeeID":""
      };
      s.insRefreshTimeStmp="";
      s._$q=$q;
    }// end of Constructor



    /* Call RestAPI to get the inspectionList of SHIPMENTS WHICH ARE IN READYFORINSPECTION AND IN-PROGRESS STATE*/

    listInspectionShipments(inspectionContext) {
      var s = this;
      s.currentShipment = undefined;
      s.currentInspection = undefined;

      var config={
        params:{"format":"JSON","statuscd":["R","P"]},
        headers:{withCredentials :true}};
      var url = s.endPointLocatorService.getInspectionEndPoint([s.inspectionContext.inspectionSIC,s.inspectionContext.shiftCd,"shipments"]);

      //return s.$http.get(url, config)
      return s._httpSessionService.get(url,config,5)
        .then((response) => {
          s._$log.debug(providerName + "[listInspectionShipments]: GET call complete");
          return response;
        },
          (error) => {
            s._$log.error(providerName + "[listInspectionShipments]: GET call failed!");
            return s._$q.reject(error);
        });

    }



    inspectorEmployeeID() {
      return this.inspectionContext.inspectorEmployeeID
    }

    /* Call RestAPI to get the InspectionDetails for a PRO*/

    getInspectionDetails(proNbr) {
      var s = this;
      if (s.inspectionDetailsTimeoutToken != undefined){
        s._$timeout.cancel(this.inspectionDetailsTimeoutToken);
        s.inspectionDetailsTimeoutToken = undefined;
      }

      var retVal = s.getCurrentInspection();
      if (retVal != undefined && s.conditioningService.condition(retVal.proNbr) === s.conditioningService.condition(proNbr)){
        var deferred = s._$q.defer();
        deferred.resolve(retVal);
        return deferred.promise;
      }


      var config={
        params:{"format":"JSON"},
        headers:{"withCredentials" :true}};
      var url = s.endPointLocatorService.getInspectionEndPoint([s.inspectionContext.inspectionSIC,"shipments",proNbr,"current"]);

      return s._httpSessionService.get(url, config, 5)
        .then(response => {
          s._$log.debug(providerName + "[getInspectionDetails]: GET call complete");
          var dataSrc = (response.data && response.data.inspection) ? response.data.inspection : {};
          var mappedObj = s.mappingService.mapInspectionDetails(dataSrc);
          s.setCurrentInspection(mappedObj[0]);
          s.setPrevInspectionStatus((mappedObj.length > 1) ? mappedObj[1].inspectionStatusCd : "");
          return mappedObj[0];
        },
        error => {
          s._$log.error(providerName + "[getInspectionDetails]: GET call failed!");
          var mappedObj = s.mappingService.mapInspectionDetails({});
          s.setCurrentInspection(mappedObj[0]);
          s.setPrevInspectionStatus("");
          return s._$q.reject(error);
        });
    }

    /* Call RestAPI to get the Shipment Details for a PRO*/

    getInspectionShipmentDetails(proNbr) {
      var s = this;
      if (s.shipmentDetailsTimeoutToken != undefined){
        s._$timeout.cancel(s.shipmentDetailsTimeoutToken);
        s.shipmentDetailsTimeoutToken = undefined;
      }

      var retVal = s.getCurrentShipment();
      if (retVal != undefined && s.conditioningService.condition(retVal.proNbr) === s.conditioningService.condition(proNbr)){
        var deferred = s._$q.defer();
        deferred.resolve(retVal);
        return deferred.promise;
      }


      var config = {
        params: {"format": "JSON"},
        headers: {"withCredentials": true}
      };
      var url = s.endPointLocatorService.getInspectionEndPoint([s.inspectionContext.inspectionSIC,"shipments",proNbr]);

      return s._httpSessionService.get(url, config, 5)
        .then(response => {
          s._$log.debug(providerName + "[getInspectionShipmentDetails]: GET call complete");
          var mappedObj = s.mappingService.mapShipmentDetails(response.data.shipmentDetails);
          if(response.data.hasOwnProperty('currentInspectionDetails')){
            mappedObj.custSpecificInspGuidelines = s.mappingService.mapCustomerGuideLines(response.data.currentInspectionDetails);
          }
          s.setCurrentShipment(mappedObj);
          return mappedObj;
        },
        error => {
          s.setCurrentShipment({}); // set the currentShipment Scope variable to empty
          s._$log.error(providerName + "[getInspectionShipmentDetails]: GET call failed!");
          return s._$q.reject(error);
        });
    }


    /**
     * Call REST API to get Previous Inspection Details
     * @param proNbr
     * @param SIC
     * @returns {*}
       */
    getPrevInspectionDetails(proNbr, SIC) {
      var s = this;
      var config={
        params:{"format":"JSON"},
        headers:{"withCredentials" :true}};
      var url = s.endPointLocatorService.getInspectionEndPoint([SIC,"shipments",proNbr,"history"]);

      return s._httpSessionService.get(url, config, 5)
        .then(response => {
            s._$log.debug(providerName + "[getPrevInspectionDetails]: GET call complete");
            var dataSrc = (response.data && response.data.inspection) ? response.data.inspection : {};
            var mappedObj = s.mappingService.mapPrevInspectionDetails(dataSrc);
            return mappedObj;
          },
          error => {
            s._$log.error(providerName + "[getPrevInspectionDetails]: GET call failed!");
            return s._$q.reject(error);
          });
    }

    /* Call RestAPI to  list inspectionShipments on SHIFT Change*/
    //listInspectionShipmentsForShiftChange(request) {
    //  var s = this;
    //  s.currentShipment = undefined;
    //  s.currentInspection = undefined;
    //  var config={
    //    params:{"format":"JSON","statuscd":["R","P"]},
    //    headers:{withCredentials :true}};
    //  var url = `${s._INSPECTIONS_END_POINT}/${s.inspectionContext.inspectionSIC}/${s.inspectionContext.shiftCd}/shipments`;
    //
    //  return s.$http.get(url,config)
    //
    //    .then(response => {setCurr
    //      s._$log.debug(providerName + "[listInspectionShipmentsForShiftChange]: GET call complete");
    //      return angular.fromJson(response);
    //    },
    //      error => {
    //      s._$log.error(providerName + "[listInspectionShipmentsForShiftChange]: GET call failed!");
    //      return s._$q.reject(error);
    //    });
    //
    //}

    /* Call RestAPI to POST the Shipment Details for a PRO*/

    createInspection(request) {

      var s = this;
      var url = s.endPointLocatorService.getInspectionEndPoint(["create"]);
      return s.$http.post(url, request)
        .then(response => {
          s._$log.debug(providerName + "[createInspection]: POST call complete");
          return angular.fromJson(response);
        },
          error => {
          s._$log.error(providerName + "[createInspection]: POST call failed!");
          return s._$q.reject(error);
        });

    }

    /* Call RestAPI to POST the DIMENSIONS for a PRO WHILE DOING INSPECTION*/

    updateInspectorDimensions(request) {

      var s = this;
      var config={
        params:{"format":"JSON"},
        headers:{withCredentials :true}};
      var url = s.endPointLocatorService.getInspectionEndPoint([s.inspectionContext.inspectionSIC,"shipments",request.proNbr,"dimensions"]);

      return s.$http.post(url, request, config)

        .then(response => {
          s._$log.debug(providerName + "[updateInspectorDimensions]: POST call complete");
          return angular.fromJson(response);
        },
        error => {
          s._$log.error(providerName + "[updateInspectorDimensions]: POST call failed!");
          return s._$q.reject(error);
        });

    }


    /* Call RestAPI to POST the status for a PRO */

    setInspectionStatus(request) {

      var s = this;
      var config={
        params:{"format":"JSON"},
        headers:{"withCredentials" :true}};
      var url = s.endPointLocatorService.getInspectionEndPoint([s.inspectionContext.inspectionSIC,"shipments","status"]);

      return s.$http.post(url, request,config)

        .then(response => {
            s._$log.debug(providerName + "[setInspectionStatus]: POST call complete");
            return angular.fromJson(response);
        },
        error => {
          s._$log.error(providerName + "[setInspectionStatus]: POST call failed!");
          return s._$q.reject(error);
        });

    }

    /**
     * Accesses the inter comm app and sets the current PRO number
     * @param proNum: The PRO number to be assigned
     */
    setProOnExternal(proNum,status) {
      var s = this;
      if (s.igUtils.isExternalFunc("setSelectedProNumber")) {
        container.writeLogEntry("Web App is assigning a new PRO number: " + proNum + " Status: " + status, "Debug");
        s._$log.info("Assigning PRO number ${proNum} to external container...");
        container.setSelectedProNumber(proNum,status);
      } else {
        var errorMsg = "[ERROR]: External Function 'SetSelectedProNumber' is not available - assignment of PRO number failed.";
        s._$log.error(errorMsg);
        return errorMsg;
      }
    }

    /**
     * Setter for the CurrentShipment property
     */
    setCurrentShipment(dataSrc) {
      var s = this;
      s._$log.debug(`[${providerName}] setCurrentShipment - Started`);
      if (s.shipmentDetailsTimeoutToken != undefined){
        s._$timeout.cancel(s.shipmentDetailsTimeoutToken);
        s.shipmentDetailsTimeoutToken = undefined;
      }
      s.currentShipment = dataSrc;

      s.shipmentDetailsTimeoutToken = s._$timeout(
        ()=>{
          if (s.currentShipment != undefined && s.currentShipment.proNbr != undefined) {
            s._$log.debug(`[${providerName}] Starting - Resetting state of current shipment details.`);
            let pro = s.currentShipment.proNbr;
            s.currentShipment = undefined
            s.getInspectionShipmentDetails(pro);
            s._$log.debug(`[${providerName}] Finished - Resetting state of current shipment details.`);
          }
        },60*1000*5
      );
      s._$log.debug(`[${providerName}] setCurrentShipment - Finished`);
    }

    /**
     * Getter for the CurrentShipment property
     */
    getCurrentShipment() {
      return this.currentShipment;
    }

    /**
     * Setter for the currentInspection property
     */
    setCurrentInspection(dataSrc) {
      var s = this;
      s._$log.debug(`[${providerName}] setCurrentInspction - Started`);
      if (s.inspectionDetailsTimeoutToken != undefined){
        s._$timeout.cancel(this.inspectionDetailsTimeoutToken);
        s.inspectionDetailsTimeoutToken = undefined;
      }
      s.currentInspection = dataSrc;

      s.inspectionDetailsTimeoutToken = s._$timeout(
        ()=>{
          if (s.currentInspection != undefined && s.currentInspection.proNbr != undefined) {
            s._$log.debug(`[${providerName}] Starting - Resetting state of current inspection.`);
            let pro = s.currentInspection.proNbr;
            s.currentInspection = undefined;
            s.setPrevInspectionStatus("");//TODO: WHY?
            s.getInspectionDetails(pro)
            s._$log.debug(`[${providerName}] Finished - Resetting state of current inspection.`);
          }
        },60*1000*5
      );
      s._$log.debug(`[${providerName}] setCurrentInspction - Finished`);
    }

    /**
     * Getter for the currentInspection property
     */
    getCurrentInspection() {
      return this.currentInspection;
    }

    /**
     * Setter for the prevInspectionStatus property that's associated with the current inspection
     */
    setPrevInspectionStatus(dataSrc) {
      this.prevInspectionStatus = dataSrc;
    }

    /**
     * Getter for the prevInspectionStatus property that's associated with the current inspection
     */
    getPrevInspectionStatus() {
      return this.prevInspectionStatus;
    }

    setInspectionContext(dataSrc){
      var s= this;
      if(typeof dataSrc["shiftCd"] !== 'undefined' && dataSrc["shiftCd"] !== null && dataSrc["shiftCd"] !== "") {
        s.inspectionContext = dataSrc;
      }
    }

    getInspectionContext() {
      var s= this;
      return s.inspectionContext;
    }


    /**
     * @param state name
     * For RELEASE-1 set inspectionTimeStamp.
     */
    setRefreshTimeStmp(state) {
      var s = this;
      if (state == "Inspection") {
        s.insRefreshTimeStmp =s.formatTimeStmp();
        return s.insRefreshTimeStmp;
      }
    }

    getRefreshTimeStmp() {
      var s= this;
      return s.insRefreshTimeStmp;
    }

    formatTimeStmp() {
      var s = this;
      return s.$filter('date')(new Date(),"'(updated at 'H:mm on MM/dd)");
    }

    getInspectionShipmentLocationDetails(proNbr, SIC, shiftCd) {

      var s = this;
      var url = s.endPointLocatorService.getInspectionEndPoint([SIC,shiftCd,"shipments",proNbr,"location"]);
      var config={params:{"format":"JSON"}};

      return s._httpSessionService.get(url, config, 5)

        .then(response => {
            s._$log.debug(providerName + "[getInspectionShipmentLocationDetails]: GET call complete");
            var mappedObj = s.mappingService.mapShipmentLocationDtls(response.data.shipmentDetails);
            return mappedObj;
          },
          error => {
            s._$log.error(providerName + "[getInspectionShipmentDetails]: GET call failed!");
            return s._$q.reject(error);
          });
    }

    getManifest(request) {

      var vm = this;
      var config={
        params:{"format":"JSON"},
        headers:{"withCredentials" :true}};
      var url = vm.endPointLocatorService.getInspectionEndPoint(["trailer","manifest"]);

      return vm._httpSessionService.post(url,request,config)

        .then(response => {
            vm._$log.debug(providerName + "[getManifest]: POST call complete");
            var mappedObj = vm.mappingService.mapManifestDetails(response.data);
            return mappedObj;
          },
          error => {
            vm._$log.error(providerName + "[getManifest]: Error : " + error.data.message + " with status : " +error.status);
            vm._$log.error(providerName + "[getManifest]: POST call failed!");
            return vm._$q.reject(error);
          });
    }

    /* Call RestAPI to  validate the SIC user Entered*/
    validateSic(SIC) {

      var s = this;
      var config={
        params:{"format":"JSON"},
        headers:{withCredentials :true}};
      var url = s.endPointLocatorService.getInspectionEndPoint([SIC,"validate"]);

      return s.$http.get(url,config)
        .then(response => {
          s._$log.debug(providerName + "[validateSic]: GET call complete");
          return angular.fromJson(response.data);
        },
        error => {
          s._$log.error(providerName + "[validateSic]: GET call failed!");
          return s._$q.reject(error);
        });
    }
    setCurrentArchiveDoc(doc){
      this._currentArchiveDoc = doc;
    }

    getCurrentArchiveDoc(){
      return this._currentArchiveDoc;
    }
    /**
     * REST API for updating an inspection's notes
     * /services/inspection/UOA/shipments/note
     {
       "inspectionContext" : {
         "inspectionSIC" : "UOA",
         "shiftCd" : "O",
         "inspectorFirstName" : "First",
         "inspectorLastName" : "Last",
         "inspectorEmployeeID" : "A1234"
       },
       "proNbr" : "08400285250",
       "sic" : "UOA",
       "note": "test note from rest service."
     }
     */
    updateInspectionNotes(proNbr, SIC, noteTxt, iContext) {
      var s = this;
      var params = {
        inspectionContext: iContext,
        proNbr: proNbr,
        sic: SIC,
        note: noteTxt.trim()
      };
      var url = s.endPointLocatorService.getInspectionEndPoint([SIC,"shipments","note"]);

      return s.$http.post(url,params)
        .then(response => {
          s._$log.debug(providerName + "[updateInspectionNotes]: POST call complete");
          return angular.fromJson(response.data);
        },
        error => {
          s._$log.error(providerName + "[updateInspectionNotes]: POST call failed!");
          return s._$q.reject(error);
        });
    }
  }

  ngModule.service(providerName, inspectionService);
}
