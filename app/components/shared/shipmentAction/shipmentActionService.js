import Rx from "rx";

export default ngModule => {
  var providerName = 'shipmentActionService';

  class shipmentActionService {

    /*@ngInject*/
    constructor($rootScope, $log, $q, inspectionService, mappingService, cameraService, twmPhotoUploadService,
                CODE_CONSTANTS, planningListService, inspectionAutoSave, persistenceService,dimensionService) {
      // Angular Module Deps
      this._$rootScope = $rootScope;
      this._$log = $log;
      this._$q = $q;
      // IG Deps
      this._inspectionService = inspectionService;
      this._mappingService = mappingService;
      this._planningListService = planningListService;
      this._cameraService = cameraService;
      this._twmPhotoUploadService = twmPhotoUploadService;
      this._persistenceService = persistenceService;
      // Local properties
      this._inspectionContext = this._inspectionService.getInspectionContext();
      this._CODE_CONSTANTS=CODE_CONSTANTS;
      this._actionMenuItem = this.setActionMenuItem();
      this._autoSave = inspectionAutoSave;
      this._dimensionService = dimensionService;

    }


    setActionMenuItem(){
      this._actionMenuItem={};
      this._actionMenuItem["mvInsList"] = ["Y","I","X","N","E","NONE"];
      this._actionMenuItem["mvPlanList"] = ["R","I","X","N","E","NONE"];
      this._actionMenuItem["mvDismiss"] = ["Y","R","P"];
      this._actionMenuItem["mvInspNtCrcted"] = ["R","P","I"];

      return this._actionMenuItem;

    }

    displayActionMenuItem(menuItem,inspectionStatus){
      return this._actionMenuItem[menuItem].indexOf(inspectionStatus) != -1;
    }

    setInspectionStatus(status, notifyMsg, proNbr) {
      var selProNbrs = [];
      var req = {};
      if(Array.isArray(proNbr)) {
        selProNbrs = proNbr;
      } else {
        selProNbrs.push(proNbr);
      }
      req["inspectionContext"] = this._inspectionContext;
      req["actionCd"] = status;
      req["alertProNbr"] = selProNbrs;

      return this._inspectionService.setInspectionStatus(req)
        .then((response) => {
          this.handleSuccessResponse(status, notifyMsg);
          Rx.Observable.from(selProNbrs).subscribe((pro) => this.performSideEffects(status, pro));
        }, (error) => {
          this._$log.error(providerName + "[setInspectionStatus]: SETINSPECTIONSTATUS call failed!");
          return this._$q.reject(error);
        });
    }

    addToPlanningList(status, notifyMsg,proNumber){
      var  sendO = this._planningListService.add(proNumber);
      return sendO.toPromise()
        .then((response) => {
          this.handleSuccessResponse(status, notifyMsg);
        },(error) => {
          this._$log.error(providerName + "[addToPlanningList]: add to PlanningList call failed!");
          return this._$q.reject(error);
        });
    }

    addToInspectionList(status, notifyMsg, proNumber){

      // make up a request object
      var reqData = {
        inspectionContext: this._inspectionContext,
        currentShipment: {
          proNbr: proNumber
        },
        inspectionDetails: {
          inspectionNotes: {},
          inspectionStatusCd: status
        },
        inspectorPieceDimensions: []
      };
      reqData = this._mappingService.mapCreateInspectionRequest(reqData);
      return this._inspectionService.createInspection({"inspection" : reqData})
        .then((response) => {
          this.handleSuccessResponse(status, notifyMsg);
        },(error) => {
          this._$log.error(providerName + "[addToInspectionList]: add to InspectionList call failed!");
          return this._$q.reject(error);
        });
    }

    handleSuccessResponse(status, notifyMsg) {
      if(this._inspectionService.currentInspection != undefined) {
        this._inspectionService.currentInspection["inspectionStatusCd"] = status;
      }
      if(typeof notifyMsg !== 'undefined' && notifyMsg !== "") {
        this._$rootScope.toast(notifyMsg, 5);
      }
    }

    /**
     * Performs any additional logic beyond changing the status value associated with a given status
     * N (Mark Inspected Not Corrected): Retrieves data from SQLite (if any) to persist on the backend and archives any photos associated with the PRO
     * @param status
     * @param proNbr
     */
    performSideEffects(status, proNbr) {
      if(status == "N") {
        this.doSideEffectsN(proNbr);
      }
      else if(status == "X") {
        this.removeLocalData(proNbr);
      }
      // any other status specific logic would go here
    }

    doSideEffectsN(proNbr) {
      this._cameraService.listLocalPhotos(proNbr).then((imgArr) => {
        this._twmPhotoUploadService.upload(imgArr, this._inspectionService.inspectionContext.inspectorEmployeeID)
      });
      this._autoSave.retrieve(proNbr).subscribe((data) => {
        if(data) {
          var reqData={currentShipment : {}, inspectionDetails : {inspectionNotes : {}}};
          reqData.currentShipment.shipmentInstID = data.shipmentInstID;
          reqData.currentShipment.proNbr = data.proNbr;
          reqData.currentShipment.pkupDate = data.pkupDate;
          reqData.inspectionDetails.inspectionStatusCd = "N";
          reqData.inspectionDetails.totGrossVolume = data.totGrossVolume;
          reqData.inspectionDetails.totDensity = data.totDensity;
          reqData.inspectionDetails.inspectionNotes.note = data.inspectionNotes.note;
          reqData.inspectionContext = this._inspectionService.inspectionContext;
          reqData.inspectorPieceDimensions = this.getValidDimRows(data.inspectorPieceDimensions);
          reqData = this._mappingService.mapCreateInspectionRequest(reqData);
          this._inspectionService.createInspection({"inspection" : reqData})
            .then(() => {
              this.removeLocalData(proNbr);
            }, (error) => {
              this._$rootScope.toast('Failed to mark shipment inspected not corrected. Please try again or contact support.', 5);
            });
        }
      },
      (e) => {
        if(e) {
          this._$log.error(e.toString());
        }
      });
    }

    removeLocalData(proNumber){
      var vm = this;
      vm._autoSave.remove(proNumber).subscribe(() => vm._$log.info(`Auto save removed ${proNumber}`))
      vm._persistenceService.find("PRO")
        .then( response => {
          var persistedPros = response;
          if(persistedPros.indexOf(proNumber)!= -1)
          {
            persistedPros.splice(persistedPros.indexOf(proNumber),1);
            vm._$log.info(`${proNumber} removed from local persistence, Remaining Count : ${persistedPros.length} `)
          }
        });
    }

    get currentShipment() {
      var merged = this._igUtils.extend({}, this._inspectionService.getCurrentInspection(), this._inspectionService.getCurrentShipment());
      return merged;
    }

    /**
     * @returns Array containing only validated dimension rows
     */
    getValidDimRows(dimensions) {
      return this._dimensionService.getValidDimRows(dimensions);
    }
  }

  ngModule.service(providerName, shipmentActionService);
}
