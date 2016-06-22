export default ngModule => {

  var providerName = 'inspectionService';

  class inspectionService {

    /* @ngInject */
    constructor($http, $log, $window,$filter, mappingService, igUtils, INSPECTIONS_END_POINT,$q) {
      var s = this;
      s.$http = $http;
      s.$window = $window;
      s._INSPECTIONS_END_POINT = INSPECTIONS_END_POINT;
      s._$log = $log;
      s.$filter=$filter;
      s.mappingService = mappingService;
      s.igUtils = igUtils;
      s.currInspection = {};
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
      var config={
        params:{"format":"JSON","statuscd":["R","P"]},
        headers:{withCredentials :true}};
      //var url = `${ s._INSPECTIONS_END_POINT}/${s.inspectionContext.inspectionSIC}/${s.mappingService.transShiftValToCode(s.inspectionContext.shiftCd)}/shipments`;

      var url = "data/inspectionShipments.json";

      return s.$http.get(url, config)

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
      var config={
        params:{"format":"JSON"},
        headers:{"withCredentials" :true}};
      var url = `${s._INSPECTIONS_END_POINT}/${s.inspectionContext.inspectionSIC}/shipments/${proNbr}/current`;
      //var url = "data/inspectionDtls.json";

      return s.$http.get(url, config)

        .then(response => {
          s._$log.debug(providerName + "[getInspectionDetails]: GET call complete");
          var mappedObj = s.mappingService.mapInspectionDetails(response.data.inspection);
          return mappedObj;
        },
          error => {
          s._$log.error(providerName + "[getInspectionDetails]: GET call failed!");
          return s._$q.reject(error);
        });

    }

    /* Call RestAPI to get the Shipment Details for a PRO*/

    getInspectionShipmentDetails(proNbr) {

      var s = this;
      var config={
        params:{"format":"JSON"},
        headers:{"withCredentials" :true}};
      var url = `${s._INSPECTIONS_END_POINT}/${s.inspectionContext.inspectionSIC}/shipments/${proNbr}`;
      //var url = "data/shmDtls.json";

      return s.$http.get(url, config)

        .then(response => {
          s._$log.debug(providerName + "[getInspectionShipmentDetails]: GET call complete");
          var mappedObj = s.mappingService.mapShipmentDetails(response.data.shipmentDetails);
          return mappedObj;
        },
          error => {
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
      var url = "data/prevInspectionDetails.json";

      return s.$http.get(url)
        .then(response => {
            s._$log.debug(providerName + "[getPrevInspectionDetails]: GET call complete");
            var mappedObj = s.mappingService.mapPrevInspectionDetails(response.data.prevInspectionDetails);
            return mappedObj;
          },
          error => {
            s._$log.error(providerName + "[getPrevInspectionDetails]: GET call failed!");
            return s._$q.reject(error);
          });
    }

    /* Call RestAPI to  list inspectionShipments on SHIFT Change*/
    listInspectionShipmentsForShiftChange(request) {

      var s = this;
      var config={
        params:{"format":"JSON","statuscd":["R","P"]},
        headers:{withCredentials :true}};
      var url = `${s._INSPECTIONS_END_POINT}/${s.inspectionContext.inspectionSIC}/${s.mappingService.transShiftValToCode(s.inspectionContext.shiftCd)}/shipments`;
      //var url = "data/inspectionShipments-NMP.json";

      return s.$http.get(url,config)

        .then(response => {
          s._$log.debug(providerName + "[listInspectionShipmentsForShiftChange]: GET call complete");
          return angular.fromJson(response);
        },
          error => {
          s._$log.error(providerName + "[listInspectionShipmentsForShiftChange]: GET call failed!");
          return s._$q.reject(error);
        });

    }

    /* Call RestAPI to POST the Shipment Details for a PRO*/

    createInspection(request) {

      var s = this;
      var url = s._INSPECTIONS_END_POINT + "/createInspection";

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

    /* Call RestAPI to POST the Shipment Details for a PRO*/

    updateInspection(request) {
      var s = this;
      //var url = s._INSPECTIONS_END_POINT + "/updateInspection";
      var url = "data/shmDtls.json";

      return s.$http.get(url) //TODO: change to match proper REST API
        .then(response => {
            s._$log.debug(providerName + "[updateInspection]: POST call complete");
            return response.data;
          },
          error => {
            s._$log.error(providerName + "[updateInspection]: POST call failed!");
          });
    }

    /* Call RestAPI to POST the DIMENSIONS for a PRO WHILE DOING INSPECTION*/

    updateInspectorDimensions(request) {

      var s = this;
      var config={
        params:{"format":"JSON"},
        headers:{withCredentials :true}};
      var url = `${s._INSPECTIONS_END_POINT}/${s.inspectionContext.inspectionSIC}/shipments/${request.proNbr}/dimensions`;

      return s.$http.post(url, request, config)

        .then(response => {
          s._$log.debug(providerName + "[updateInspectorDimensions]: POST call complete");
          return angular.fromJson(response);
        },
          error => {
          s._$log.error(providerName + "[updateInspectorDimensions]: POST call failed!");
        });

    }


    /* Call RestAPI to POST the status for a PRO */

    setInspectionStatus(request) {

      var s = this;
      var config={
        params:{"format":"JSON"},
        headers:{"withCredentials" :true}};
      var url = `${ s._INSPECTIONS_END_POINT}/${s.inspectionContext.inspectionSIC}/shipments/status`;

      return s.$http.post(url, request,config)

        .then(response => {
            s._$log.debug(providerName + "[setInspectionStatus]: POST call complete");
            return angular.fromJson(response);
        },
          error => {
          s._$log.error(providerName + "[setInspectionStatus]: POST call failed!");
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
     * Setter for the currInspection property
     */
    setCurrInspection(data) {
      var s= this;
      s.currInspection = data;
    }

    /**
     * Getter for the currInspection property
     */
    getCurrInspection() {
      var s= this;
      return s.currInspection;
    }

    setInspectionContext(dataSrc){

      var s= this;
      if(typeof dataSrc["shiftCd"] !== 'undefined' && dataSrc["shiftCd"] !== null && dataSrc["shiftCd"] !== "") {
        s.inspectionContext = dataSrc;

        s.inspectionContext["shiftCd"] = s.mappingService.transShiftCodeToValue(dataSrc["shiftCd"].toUpperCase());
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
      return s.$filter('date')(new Date(),"'(updated at 'hh:mm on MM/dd)");
    }

    getInspectionShipmentLocationDetails(proNbr, SIC) {

      var s = this;
      //var url = s._INSPECTIONS_END_POINT + "/{sic}/{shiftcd}/shipments/{pro}/location";
      //var config={params:{"format":"JSON"}};
      var url = "data/shmLocationDtls.json";

      return s.$http.get(url)

        .then(response => {
            s._$log.debug(providerName + "[getInspectionShipmentLocationDetails]: GET call complete");
            var mappedObj = s.mappingService.mapShipmentLocationDtls(response.data.shipmentDetails);
            return mappedObj;
          },
          error => {
            s._$log.error(providerName + "[getInspectionShipmentDetails]: GET call failed!");
          });
    }

    getTrailerManifestDetails(trailerNbr) {

      var vm = this;
      /*var config={
        params:{"format":"JSON"},
        headers:{"withCredentials" :true}};
      var url = `${ vm._INSPECTIONS_END_POINT}/${vm.inspectionContext.inspectionSIC}/shipments/${proNbr}`;*/
      var url = "data/manifestDtls.json";

      return vm.$http.get(url)

        .then(response => {
            vm._$log.debug(providerName + "[getTrailerManifestDetails]: GET call complete");
            //var mappedObj = vm.mappingService.mapShipmentDetails(response.data.manifestDetails);
            return response.data.manifestDetails;
          },
          error => {
            vm._$log.error(providerName + "[getTrailerManifestDetails]: GET call failed!");
          });
    }



  }

  ngModule.service(providerName, inspectionService);
}
