var moment = require('moment');
import _ from 'lodash';

export default ngModule => {
  var providerName = 'mappingService';

  class mappingService {
    /*@ngInject*/
    constructor($filter, CODE_CONSTANTS) {
      var vm = this;
      // Angular Module Deps
      vm.$filter = $filter;
      // injected IG dependencies here
      vm.CODE_CONSTANTS = CODE_CONSTANTS;
    }

    /**
     * Transfers a property from one object to another. If the property is not found in the source object, the default
     * value will be assigned.
     * @param mapObj Object the property should be assigned to
     * @param dataSrc Object the property is read from
     * @param mappedKey Property name that will be assigned to the mapObj param
     * @param srcKey Property name to be referenced from the dataSrc param
     * @param defaultVal
     */
    mapProp(mapObj, dataSrc, mappedKey, srcKey, defaultVal) {
      mapObj[mappedKey] = (typeof dataSrc[srcKey] !== 'undefined' && dataSrc[srcKey] !== null && dataSrc[srcKey] !== "") ? dataSrc[srcKey] : defaultVal;
    }

    /**
     *
     * @param dataSrc Object with server properties
     * @returns Object with properties coupled to business logic and UI display
     */
    mapShipmentDetails(dataSrc) {
      var vm = this;
      var mapObj = {};
      vm.mapProp(mapObj, dataSrc, "proNbr", "proNbr", "");
      vm.mapProp(mapObj, dataSrc, "shipmentInstID", "shipmentInstID", "");
      vm.mapProp(mapObj, dataSrc, "pkupDate", "pkupDate", "");
      vm.mapProp(mapObj, dataSrc, "shipperInstID", "shipperInstID", "");
      vm.mapProp(mapObj, dataSrc, "shipperMadCd", "shipperMadCd", "");
      vm.mapProp(mapObj, dataSrc, "shipperName", "shipperName", "");
      vm.mapProp(mapObj, dataSrc, "shipperIsDebtor", "shipperIsDebtor", "");
      vm.mapProp(mapObj, dataSrc, "consigneeInstID", "consigneeInstID", "");
      vm.mapProp(mapObj, dataSrc, "consigneeMadCd", "consigneeMadCd", "");
      vm.mapProp(mapObj, dataSrc, "consigneeName", "consigneeName", "");
      vm.mapProp(mapObj, dataSrc, "consigneeIsDebtor", "consigneeIsDebtor", "");
      vm.mapProp(mapObj, dataSrc, "thirdPartyInstID", "thirdPartyInstID", "");
      vm.mapProp(mapObj, dataSrc, "thirdPartyMadCd", "thirdPartyMadCd", "");
      vm.mapProp(mapObj, dataSrc, "thirdPartyName", "thirdPartyName", "");
      vm.mapProp(mapObj, dataSrc, "thirdPartyIsDebtor", "thirdPartyIsDebtor", "");
      vm.mapProp(mapObj, dataSrc, "bil2InstID", "bil2InstID", "");
      vm.mapProp(mapObj, dataSrc, "bil2MadCd", "bil2MadCd", "");
      vm.mapProp(mapObj, dataSrc, "bil2Name", "bil2Name", "");
      vm.mapProp(mapObj, dataSrc, "totGrossWeight", "totGrossWeight", "");
      mapObj.driverDimensions = []; // Array
      if(dataSrc.driverDimensions) {
        angular.forEach(dataSrc.driverDimensions, (val, idx) => {
          var dim = {};
          vm.mapProp(dim, val, "seq", "seq", "");
          vm.mapProp(dim, val, "length", "length", "");
          vm.mapProp(dim, val, "width", "width", "");
          vm.mapProp(dim, val, "height", "height", "");
          mapObj.driverDimensions.push(dim);
        });
      }
      mapObj.commodity = []; // Array
      if(dataSrc.commodity) {
        angular.forEach(dataSrc.commodity, (val, idx) => {
          var comm = {};
          vm.mapProp(comm, val, "seq", "seq", "");
          vm.mapProp(comm, val, "nmfcClass", "nmfcClass", "");
          vm.mapProp(comm, val, "nmfcItemCd", "nmfcItemCd", "");
          vm.mapProp(comm, val, "desc", "desc", "");
          vm.mapProp(comm, val, "packageCd", "packageCd", "");
          vm.mapProp(comm, val, "pieceCnt", "pieceCnt", "");
          vm.mapProp(comm, val, "totGrossWeight", "totGrossWeight", "");
          mapObj.commodity.push(comm);
        });
      }
      vm.mapProp(mapObj, dataSrc, "appliedAgreementID", "appliedAgreementID", "");
      vm.mapProp(mapObj, dataSrc, "appliedRulesetNbr", "appliedRulesetNbr", "");
      mapObj.agreementFAKText = []; // Array
      if(dataSrc.agreementFAKText) {
        angular.forEach(dataSrc.agreementFAKText, (val, idx) => {
          mapObj.agreementFAKText.push(val);
        });
      }
      vm.mapProp(mapObj, dataSrc, "item15Exempt", "item15Exempt", "N");
      vm.mapProp(mapObj, dataSrc, "elsExempt", "elsExempt", "N");
      vm.mapProp(mapObj, dataSrc, "linealFootEligibility", "linealFootEligibility", "Y");
      mapObj.linealFootRange = []; // Array
      if(dataSrc.linealFootRange) {
        angular.forEach(dataSrc.linealFootRange, (val, idx) => {
          mapObj.linealFootRange.push(val);
        });
      }else{
        mapObj.linealFootRange.push('14-99');
      }
      vm.mapProp(mapObj, dataSrc, "specialCapacityRuleInd", "specialCapacityRuleInd", "N");
      vm.mapProp(mapObj, dataSrc, "eta", "eta", "");
      vm.mapProp(mapObj, dataSrc, "trailerNbr", "trailerNbr", "");
      vm.mapProp(mapObj, dataSrc, "billClassCd", "billClassCd", "");
      vm.mapProp(mapObj, dataSrc, "adminStatusCd", "adminStatusCd", "");
      mapObj.accessorialChargeCd = []; // Array
      if(dataSrc.accessorialChargeCd) {
        angular.forEach(dataSrc.accessorialChargeCd, (val, idx) => {
          mapObj.accessorialChargeCd.push(val);
        });
      }
      vm.mapProp(mapObj, dataSrc, "accessorialChargeCd", "accessorialChargeCd", "");
      vm.mapProp(mapObj, dataSrc, "totChargeAmt", "totChargeAmt", "");
      vm.mapProp(mapObj, dataSrc, "totPieceCnt", "totPieceCnt", "");
      vm.mapProp(mapObj, dataSrc, "loosePiecesCnt", "loosePiecesCnt", "");
      vm.mapProp(mapObj, dataSrc, "motorizedPiecesCnt", "motorizedPiecesCnt", "");
      vm.mapProp(mapObj, dataSrc, "deliveryStatusCd", "deliveryStatusCd", "");
      vm.mapProp(mapObj, dataSrc, "cshInd", "cshInd", "");
      mapObj.remarks = []; // Array
      if(dataSrc.remarks) {
        angular.forEach(dataSrc.remarks, (val, idx) => {
          var rmk = {};
          vm.mapProp(rmk, val, "note", "note", "");
          vm.mapProp(rmk, val, "enteredByID", "enteredByID", "");
          vm.mapProp(rmk, val, "enteredDateTime", "enteredDateTime", "");
          mapObj.remarks.push(rmk);
        });
      }

      return mapObj;
    }

    /**
     * mapping layer to abstract json names from the application
     * @param dataSrc
     * @returns {{}}
     */
    mapPrevInspectionDetails(dataSrc) {
      var vm = this;
      var mapObj = {};
      if (dataSrc === undefined || dataSrc.length <= 0) {
        return mapObj;
      }

      dataSrc = dataSrc[0];

      vm.mapProp(mapObj, dataSrc, "sourceOfRecommendation", "sourceOfRecommendation", "");
      vm.mapProp(mapObj, dataSrc, "shipmentInstID", "shipmentInstID", "");
      vm.mapProp(mapObj, dataSrc, "proNbr", "proNbr", "");
      vm.mapProp(mapObj, dataSrc, "totGrossVolume", "totGrossVolume", "");
      vm.mapProp(mapObj, dataSrc, "totDensity", "totDensity", "");
      vm.mapProp(mapObj, dataSrc, "inspectionStatusCd", "inspectionStatusCd", "NONE");
      vm.mapProp(mapObj, dataSrc, "inspectionDateTime", "inspectionDateTime", "");

      mapObj.inspectionContext = vm.mapInspectionContext(dataSrc.inspectionContext); // Nested Object
      mapObj.inspectionNotes = vm.mapInspectionNotes(dataSrc.inspectionNotes); // Nested Object


      mapObj.inspectorPieceDimensions = [];
      mapObj.inspectorPieceDimensions = vm.mapInspectorPieceDimensions(dataSrc); // Array

      return mapObj;
    }

    /**
     *
     * @param dataSrc Object with server properties
     * @returns Object with properties coupled to business logic and UI display
     */
    mapInspectionDetails(dataSrc)
    {
      var vm = this;
      var mapObj = [];
      if (dataSrc.length <= 0) {
        return mapObj;
      }
      if (dataSrc.constructor !== Array) {
        dataSrc = [dataSrc];
      }
        angular.forEach(dataSrc, (currDataSrc) => {
          var inspection = {};
          vm.mapProp(inspection, currDataSrc, "sourceOfRecommendation", "sourceOfRecommendation", "");
          vm.mapProp(inspection, currDataSrc, "shipmentInstID", "shipmentInstID", "");
          vm.mapProp(inspection, currDataSrc, "proNbr", "proNbr", "");
          vm.mapProp(inspection, currDataSrc, "pkupDate", "pkupDate", "");

          inspection.inspectorPieceDimensions = [];
          inspection.inspectorPieceDimensions = vm.mapInspectorPieceDimensions(currDataSrc); // Array

          vm.mapProp(inspection, currDataSrc, "totGrossVolume", "totGrossVolume", "");
          vm.mapProp(inspection, currDataSrc, "totDensity", "totDensity", "");
          vm.mapProp(inspection, currDataSrc, "totGrossWeight", "totGrossWeight", "");
          vm.mapProp(inspection, currDataSrc, "inspectionStatusCd", "inspectionStatusCd", "NONE");
          vm.mapProp(inspection, currDataSrc, "inspectionDateTime", "inspectionDateTime", "");

          inspection.inspectionContext = vm.mapInspectionContext(currDataSrc.inspectionContext); // Nested Object
          inspection.inspectionNotes = vm.mapInspectionNotes(currDataSrc.inspectionNotes); // Nested Object
          mapObj.push(inspection);
        })


      return mapObj;
    }

    /**
     *
     * @param dataSrc Object with server properties
     * @returns Object with properties coupled to business logic and UI display
     */
    mapInspectionContext(dataSrc)
    {
      var vm = this;
      var mapObj = {};
      if(typeof dataSrc != "undefined") {
        vm.mapProp(mapObj, dataSrc, "inspectionSIC", "inspectionSIC","");
        vm.mapProp(mapObj, dataSrc, "shiftCd", "shiftCd","");
        vm.mapProp(mapObj, dataSrc, "inspectorFirstName", "inspectorFirstName","");
        vm.mapProp(mapObj, dataSrc, "inspectorLastName", "inspectorLastName","");
        vm.mapProp(mapObj, dataSrc, "inspectorEmployeeID", "inspectorEmployeeID","");
      }
      return mapObj;
    }

    /**
     *
     * @param dataSrc Object with server properties
     * @returns Object with properties coupled to business logic and UI display
     */
    mapInspectionContextFromDomainUser(dataSrc)
    {
      var vm = this;
      var mapObj = {};
      if(typeof dataSrc != "undefined") {
        vm.mapProp(mapObj, dataSrc, "inspectionSIC", "requestingSic","");
        vm.mapProp(mapObj, dataSrc, "shiftCd", "shiftCode","");
        vm.mapProp(mapObj, dataSrc, "inspectorFirstName", "firstName","");
        vm.mapProp(mapObj, dataSrc, "inspectorLastName", "lastName","");
        vm.mapProp(mapObj, dataSrc, "inspectorEmployeeID", "employeeId","");
      }
      return mapObj;
    }

    /**
     *
     * @param dataSrc Object with server properties
     * @returns Object with properties coupled to business logic and UI display
     */
    mapInspectionNotes(dataSrc)
    {
      var vm = this;
      var mapObj = {};
      if(typeof dataSrc != "undefined") {
        vm.mapProp(mapObj, dataSrc, "note", "note","");
        vm.mapProp(mapObj, dataSrc, "enteredByID", "enteredByID","");
        vm.mapProp(mapObj, dataSrc, "enteredDateTime", "enteredDateTime","");
      }
      return mapObj;
    }

    mapCustomerGuideLines(dataSrc)
    {
      var vm = this;
      var mapObj = [];
      if(typeof dataSrc != "undefined") {
        angular.forEach(dataSrc.custSpecificInspGuidelines, (val) => {
          var guideLines ={};
          guideLines.customerID = {};
          guideLines.customerGuidelines ={};

          if(val && val.customerID) {
            vm.mapProp(guideLines.customerID, val.customerID, "custName", "custName","");
            vm.mapProp(guideLines.customerGuidelines, val.customerGuidelines, "note", "note","");
            mapObj.push(guideLines);
          }

        });

      }
      return mapObj;
    }

    /**
     *
     * @param dataSrc Object with server properties
     * @returns Object with properties coupled to business logic and UI display
     */
    mapInspectorPieceDimensions(dataSrc)
    {
      var vm = this;
      var mapObj = [];
      if(typeof dataSrc != "undefined" && dataSrc.inspectorPieceDimensions) {
        angular.forEach(dataSrc.inspectorPieceDimensions, (val) => {
          var dims = {};
          vm.mapProp(dims, val, "seq", "seq", "");
          vm.mapProp(dims, val, "pieceCnt", "pieceCnt", "");

          dims.inspectorDimensions = {}; // Nested Object
          vm.mapProp(dims.inspectorDimensions, val.inspectorDimensions, "seq", "seq", "");
          vm.mapProp(dims.inspectorDimensions, val.inspectorDimensions, "length", "length", "");
          vm.mapProp(dims.inspectorDimensions, val.inspectorDimensions, "width", "width", "");
          vm.mapProp(dims.inspectorDimensions, val.inspectorDimensions, "height", "height", "");

          mapObj.push(dims);
        });
      }
      return mapObj;
    }

    mapInspectionShipments(dataSrc) {
      var vm = this;
      var mapObj = {};
      vm.mapProp(mapObj, dataSrc, "sourceOfRecommendation", "sourceOfRecommendation", "");
      vm.mapProp(mapObj, dataSrc, "shipmentInstID", "shipmentInstID", "");
      vm.mapProp(mapObj, dataSrc, "proNbr", "proNbr", "");
      vm.mapProp(mapObj, dataSrc, "pkupDate", "pkupDate", "");
      vm.mapProp(mapObj, dataSrc, "originSIC", "originSIC", "");
      vm.mapProp(mapObj, dataSrc, "destSIC", "destSIC", "");
      vm.mapProp(mapObj, dataSrc, "totPieceCnt", "totPieceCnt", "");
      vm.mapProp(mapObj, dataSrc, "totGrossWeight", "totGrossWeight", "");
      vm.mapProp(mapObj, dataSrc, "inspectionStatusCd", "inspectionStatusCd", "NONE");
      vm.mapProp(mapObj, dataSrc, "shipperName", "shipperName", "");
      vm.mapProp(mapObj, dataSrc, "consigneeName", "consigneeName", "");
      vm.mapProp(mapObj, dataSrc, "dockLocation", "dockLocation", "");
      vm.mapProp(mapObj, dataSrc, "loadDoor", "loadDoor", "");
      vm.mapProp(mapObj, dataSrc, "breakDoor", "breakDoor", "");
      vm.mapProp(mapObj, dataSrc, "eta", "eta", "");
      vm.mapProp(mapObj, dataSrc, "location", "location", "");
      mapObj.inspectionContext = vm.mapInspectionContext(dataSrc.inspectionContext); // Nested Object
      return mapObj;
    }

    /**
     * HELPER METHODS FOR ASSIGNING DISPLAY VALUES
     */
    transBoolToYorN(bVal) {
      if(bVal == true || bVal == "true" || bVal == "T" || bVal == 1|| bVal == "Y" ) {
        return "Yes";
      } else {
        return "No";
      }
    }

    /**
     * HELPER METHODS FOR ASSIGNING DISPLAY VALUES
     */
    transInvertBoolToYorN(bVal) {
      if(bVal == true || bVal == "true" || bVal == "T" || bVal == 1|| bVal == "Y" ) {
        return "No";
      } else {
        return "Yes";
      }
    }

    /**
     * HELPER METHODS TO CONVERT INSPECTION CODES TO STRINGS
     */
    transInspCodeToStatus(code){
      return this.CODE_CONSTANTS.INSPECT_STATUS[code];
    }

    transInspStatusToCode(statusVal){
      return _.invert(this.CODE_CONSTANTS.INSPECT_STATUS)[statusVal];
    }

    /**
     * HELPER METHODS TO CONVERT SHIFT CODES TO STRINGS
     */
    transShiftCodeToValue(code){
      return this.CODE_CONSTANTS.SHIFT_CODE[code];
    }

    /**
     * HELPER METHODS TO CONVERT SHIFT value TO Codes
     */
    transShiftValToCode(val){
      return _.invert(this.CODE_CONSTANTS.SHIFT_CODE)[val];
    }

    mapShipmentLocationDtls(dataSrc)
    {
      var vm = this;
      var mapObj = {};
      vm.mapProp(mapObj, dataSrc, "originSIC", "originSIC","");
      vm.mapProp(mapObj, dataSrc, "destSIC", "destSIC", "");
      vm.mapProp(mapObj, dataSrc, "loadDestSIC", "loadDestSIC", "");
      vm.mapProp(mapObj, dataSrc, "dockLocation", "dockLocation", "");
      return mapObj;
    }

    /** BEGIN BACKEND SERVER REQUEST MAPPINGS */

    mapCreateInspectionRequest(dataSrc)
    {
      var vm = this;
      var mapObj = {};
      vm.mapProp(mapObj, dataSrc.currentShipment, "shipmentInstID", "shipmentInstID", "");
      vm.mapProp(mapObj, dataSrc.currentShipment, "proNbr", "proNbr", "");
      vm.mapProp(mapObj, dataSrc.currentShipment, "pkupDate", "pkupDate", "");
      vm.mapProp(mapObj, dataSrc.currentShipment, "totGrossWeight", "totGrossWeight", "");
      vm.mapProp(mapObj, dataSrc.inspectionDetails, "inspectionStatusCd", "inspectionStatusCd", "");
      vm.mapProp(mapObj, dataSrc.inspectionDetails, "inspectionDateTime", "inspectionDateTime",  moment().format());
      vm.mapProp(mapObj, dataSrc.inspectionDetails, "totGrossVolume", "totGrossVolume", "");
      vm.mapProp(mapObj, dataSrc.inspectionDetails, "totDensity", "totDensity", "");
      mapObj.inspectionContext = vm.mapInspectionContext(dataSrc.inspectionContext);
      mapObj.inspectorPieceDimensions = dataSrc.inspectorPieceDimensions;
      mapObj.inspectionNotes = {}; // Nested Object
      mapObj.inspectionNotes.note = (dataSrc.inspectionDetails.inspectionNotes) ? dataSrc.inspectionDetails.inspectionNotes.note : "";
      mapObj.inspectionNotes.enteredByID = dataSrc.inspectionContext.inspectorEmployeeID;
      mapObj.inspectionNotes.enteredDateTime = moment().format();
      mapObj.custSpecificInspGuidelines = []; // Nested Object
      return mapObj;
    }

    mapUpdateInspectorDimRequest(dataSrc)
    {
      var vm = this;
      var mapObj = {};
      vm.mapProp(mapObj, dataSrc.currentShipment, "shipmentInstID", "shipmentInstID","");
      vm.mapProp(mapObj, dataSrc.currentShipment, "proNbr", "proNbr","");
      vm.mapProp(mapObj, dataSrc.currentShipment, "pkupDate", "pkupDate", "");
      mapObj.inspectionContext = vm.mapInspectionContext(dataSrc.inspectionContext);
      mapObj.inspectionContext.shiftCd = vm.transShiftValToCode(mapObj.inspectionContext.shiftCd);
      mapObj.inspectionPieceDimensions = []; // REST API expects "inspectionPieceDimensions" as a param name instead of "inspector"
      mapObj.inspectionPieceDimensions = dataSrc.inspectorPieceDimensions; // Array
      return mapObj;
    }

    mapInspectionContextToRemoteRequest(ctx)
    {
      var mapObj

      mapObj = {}
      Object.keys(ctx).forEach(key => {
        if(key === "shiftCd") {
          mapObj[key] = this.transShiftValToCode(ctx[key])
        } else {
          mapObj[key] = ctx[key]
        }
      })

      return mapObj
    }

    mapCreateReqForManifest(dataSrc){
      var vm = this;
      var mapObj = {};

      // todo : Need to figure planDate and loadDoor default values
      vm.mapProp(mapObj, dataSrc, "equipmentPrefixSuffix","trailer", "");
      vm.mapProp(mapObj, dataSrc, "planInstID", "planInstID", "1");
      vm.mapProp(mapObj, dataSrc, "planDate", "planDate",vm.$filter('date')(new Date(),"yyyy-MM-dd"));
      vm.mapProp(mapObj, dataSrc.inspectionContext, "planSIC", "inspectionSIC", "");
      vm.mapProp(mapObj, dataSrc.inspectionContext, "planShiftCd", "shiftCd", "");
      vm.mapProp(mapObj, dataSrc, "loadDoor","door", "0");
      return mapObj;

    }


  mapManifestDetails(dataSrc) {

      var vm = this;
      var mapObj = {};
      mapObj.loadedTrailer = vm.mapLoadedTrailer(dataSrc.loadedTrailer); // Nested Object
      mapObj.loadedShipments = vm.mapLoadedShipments(dataSrc); // Nested ARRAY

    return mapObj;
  }

    mapLoadedTrailer(dataSrc){

      var vm = this;
      var mapObj={};

      vm.mapProp(mapObj, dataSrc, "equipmentPrefixSuffix", "equipmentPrefixSuffix", "");
      vm.mapProp(mapObj, dataSrc, "trailerStatusCd", "trailerStatusCd", "");
      vm.mapProp(mapObj, dataSrc, "trailerLoadingStatus", "trailerLoadingStatus", "");
      vm.mapProp(mapObj, dataSrc, "dockLocation", "dockLocation", "");
      vm.mapProp(mapObj, dataSrc, "headloadDest", "headloadDest", "N/A");
      vm.mapProp(mapObj, dataSrc, "headloadLength", "headloadLength", "");

      return mapObj;
    }

    mapLoadedShipments(dataSrc){
      var vm = this;
      var resArray = [];

      if(dataSrc.loadedShipments){
        angular.forEach(dataSrc.loadedShipments,(val) => {
          var loadedShm = {};

          vm.mapProp(loadedShm, val, "seq", "seq", "");
          vm.mapProp(loadedShm, val, "proNbr", "proNbr", "");
          vm.mapProp(loadedShm, val, "motorizedPiecesCount", "motorizedPiecesCount", "");
          vm.mapProp(loadedShm, val, "totPiecesCount", "totPiecesCount", "");
          vm.mapProp(loadedShm, val, "totGrossVolume", "totGrossVolume", "");
          vm.mapProp(loadedShm, val, "totWeight", "totWeight", "");
          vm.mapProp(loadedShm, val, "shipperName", "shipperName", "");
          vm.mapProp(loadedShm, val, "hazmatInd", "hazmatInd", "");
          vm.mapProp(loadedShm, val, "rateSaverInd", "rateSaverInd", "");
          vm.mapProp(loadedShm, val, "garntdInd", "garntdInd", "");
          vm.mapProp(loadedShm, val, "freezableInd", "freezableInd", "");
          vm.mapProp(loadedShm, val, "foodInd", "foodInd", "");
          vm.mapProp(loadedShm, val, "poisonInd", "poisonInd", "");
          vm.mapProp(loadedShm, val, "headloadInd", "headloadInd", "");
          vm.mapProp(loadedShm, val, "loadToDoor", "loadToDoor", "");
          vm.mapProp(loadedShm, val, "destSIC", "destSIC", "");
          vm.mapProp(loadedShm, val, "inspectionStatusCd", "inspectionStatusCd", "NONE");

          resArray.push(loadedShm);

        });
      }

      return resArray;

    }

    /** END BACKEND SERVER REQUEST MAPPINGS */

  }
  ngModule.service(providerName, mappingService);
};
