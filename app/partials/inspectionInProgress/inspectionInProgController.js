var moment = require('moment');

export default ngModule => {
  var controllerName = 'inspectionInProgressController';

  class inspectionInProgController {
    /*@ngInject*/
    constructor($rootScope, $scope, $state, $log, $mdDialog, $window, $timeout, cameraService, inspectionService, dialogService,
                igUtils,CODE_CONSTANTS, mappingService, inspectionAutoSave, twmPhotoUploadService, persistenceService,
                shipmentActionService, dimensionService) {
      // Angular Module Deps
      this._$rootScope = $rootScope;
      this._$scope = $scope;
      this._$state = $state;
      this._$log = $log;
      this._$mdDialog = $mdDialog;
      this._$window = $window;
      this._$timeout = $timeout;
      this.cameraLaunching = false;
      // IG Deps
      this._inspectionService = inspectionService;
      this._cameraService = cameraService;
      this._dialogService = dialogService;
      this._igUtils = igUtils;
      this._autoSave = inspectionAutoSave
      this._persistenceService=persistenceService;
      this._dimensionService = dimensionService;
      // Local properties
      this._cameraAvailable = this._cameraService.getCameraAvailablity();
      this._currentShipment = this._inspectionService.getCurrentShipment();
      this._currentInspection = this._inspectionService.getCurrentInspection();
      if(this._currentInspection && this._currentInspection.inspectorPieceDimensions) {
        delete this._currentInspection.inspectorPieceDimensions; // We don't want to use any dimensions from the backend for this screen
      }
      this._inspectionContext = this._inspectionService.getInspectionContext();
      //this._gallery_images = require("./../../utils/gallery_img_proto_list"); // Can be used for testing outside of container
      this._CODE_CONSTANTS=CODE_CONSTANTS;
      this._mappingService = mappingService;
      this._addDimRowDisabled = true;
      this._twmPhotoUploadService = twmPhotoUploadService
      this._$scope.photosLoading = false; // sensible default
      this._notesDirtyBit = false;
      this._shipmentActionService = shipmentActionService;

      cameraService.registerPhotoTakenListener((json)=>{
        // Photo was taken - set status to In Progress
        var s = this;
        if (s.shouldUpdateStatus()){
          s.setInspectionStatus("P");
        }
        s.reloadPhotos();
      });

      cameraService.registerPhotoGalleryUpdateListener(()=>{
        var s = this;
        s.reloadPhotos();
      });

      /**
       * Saves a snapshot of the inspection data to SQLite on state change
       */
      this._$state.current.onExit = () => {
        this.saveNotes();
      };

      // If the user changes their SIC while doing an inspection then take them to the Inspection List page
      this._$scope.$on('sicChanged', () => { this._$state.go('list') });

      // Make API service calls to populate model variables
      this.activate();
    }

    viewImage(id) {
      var s = this;
      s._cameraService.showPhotoGallery(s._currentShipment.proNbr, id);
    }

    activate() {

      if(this._currentInspection.inspectionStatusCd === 'NONE'){
        var mapData = {};
        var requestData = {};
        mapData.currentShipment = this._currentShipment;
        mapData.inspectionContext = this._inspectionContext;
        mapData.inspectionDetails = this._currentInspection;
        mapData.inspectionDetails.inspectionNotes.note="";
        mapData.inspectionDetails.inspectionStatusCd="R";
        mapData.inspectorPieceDimensions = [];
        requestData.inspection = this._mappingService.mapCreateInspectionRequest(mapData);
        this._inspectionService.createInspection(requestData);
      }
      this.initializeFromAutoSave();
      this.reloadPhotos();
    }

    initializeFromAutoSave() {
      var s = this;
      var setNote = note => { s._currentInspection.inspectionNotes.note = note };
      var setDims = dimensions =>
      {
        s._currentInspection.inspectorPieceDimensions = dimensions;
        s.initializeDimRows();
      };
      var error = () => {};
      s._autoSave
        .retrieveNotes(s._currentShipment.proNbr)
        .subscribe(setNote, error);
      s._autoSave
        .retrieveDimensions(s._currentShipment.proNbr)
        .subscribe(setDims, s.initializeDimRows.bind(s));
    }


    initializeDimRows() {
      var s = this;
      if (s._currentInspection != undefined && s._currentInspection.inspectorPieceDimensions != undefined) {
        s._dimensions = s._currentInspection.inspectorPieceDimensions;
      }
      if (s._dimensions == undefined){
        s._dimensions = [];
      }
      if(s._dimensions.length < 3) {
        s.addNewDimRows(3 - s._dimensions.length);
      }
      s.calculateDimDerivatives();
      s._addDimRowDisabled = !s.isDimRowAdditionAllowed();
    }

    shouldUpdateStatus(status) {
      var s = this
      var currentStatus = s._currentInspection.inspectionStatusCd

      if(currentStatus !== "N" && currentStatus !== "I" && currentStatus !== "P") {
        return true
      }

      return false
    }

    setInspectionStatus(status) {
      this._notesDirtyBit = false;
      this._shipmentActionService.setInspectionStatus(status, "", this._currentShipment.proNbr);
    }

    launchCamera() {
      var s = this;
      try {
        s.cameraLaunching = true;
        var response = s._cameraService.launchCamera(s._currentShipment.proNbr, s._currentInspection.inspectionStatusCd);
        if (response && response.length > 0) {
          s._$mdDialog.show(
            s._$mdDialog.alert()
              .parent(angular.element(document.querySelector('#popupContainer')))
              .clickOutsideToClose(true)
              .title('Oops')
              .content('The camera is not available. Please reload the application, and if the error persists contact ' +
                'the support team.')
              .ariaLabel('Alert Dialog Demo')
              .ok('Close')
          );
        }
      }finally {
        s._$timeout(()=>{
          s.cameraLaunching = false;
        },2000);

      }

    }

    reloadPhotos(){
      var s = this;
      this._$scope.photosLoading = true
      s._gallery_images = undefined;
      s._cameraService.listLocalThumbnails(s._currentShipment.proNbr).then(
        (value)=>
        {
          s._gallery_images = value;
        })
        .finally(() => {
          this._$scope.photosLoading = false
        });
    }

    openFileBrowser(selector) {
      this._$log.debug("Opening file browser...");
      var element = angular.element(selector);
      $(element).trigger('click');
    }

    selectPhotoManually(element) {
      var s = this;
      var loadedPhotos = element.files;
      if (loadedPhotos && loadedPhotos.length > 0) {
        s._$log.debug(`${controllerName}[selectPhotoManually]: Importing ${loadedPhotos.length} external photos!`);
        angular.forEach(loadedPhotos,  (photo, index) => {
          var reader = new FileReader();
          reader.onload = ()=> {
            s._$log.debug(`${controllerName}[selectPhotoManually]: OnLoad of index: ${index}`);
            var img=reader.result.slice(reader.result.indexOf(',')+1);
            s._cameraService.insertPhoto(s._currentShipment.proNbr,img);
            s.reloadPhotos();
          };
          s._$log.debug(`${controllerName}[selectPhotoManually]: Reading of index: ${index}`);
          reader.readAsDataURL(photo);
        });
      }
    }

    cancelDialog() {
      this._$mdDialog.cancel();
    }

    /**
     * Prompts the user asking if they would like to Submit the inspection or continue inspecting
     * @param event
     */
    openSubmitDialog(event) {
      var vm = this;
      var contentString;
      var locals;
      var minNumPhotos = 3;
      var dialogArgs = { "dialogTitle" : "Submit Inspection" };
      // ENSURE ONE FULL DIMENSION ROW IS PRESENT
      var validDimFound = false;
      for(var i = 0; i < this._dimensions.length; i++) {
        var dimRow = this._dimensions[i];
        if(this._dimensionService.validateDimRow(dimRow)) {
          validDimFound = true;
          break;
        }
      }
      if(validDimFound == false) {
        // NO DIMENSIONS
        this._$rootScope.toast(`You cannot submit an inspection without at least one line of dimensions.`, 3);
      } else if(this._dimensions.length > this._CODE_CONSTANTS.MAX_INSPECT_DIMS) {
        // TOO MANY DIMENSIONS
        this._$rootScope.toast(`No more than ${this._CODE_CONSTANTS.MAX_INSPECT_DIMS} dimensions may be provided.`, 3);
      } else if(this._gallery_images.length < minNumPhotos) {
        // LESS PHOTOS THAN RECOMMENDED
        contentString = `You have fewer than ${minNumPhotos} photos for this inspection. Do you want to proceed anyway?`;
        dialogArgs.dialogContent = contentString;
        dialogArgs.dialogConfirmTxt = "Yes, submit";
        dialogArgs.dialogCancelTxt = "No";
        locals = vm._dialogService.buildDialogBindings(dialogArgs);
        this._dialogService.confirm(locals, vm.submitInspection.bind(this));
      } else {
        contentString = `Are you sure you want to submit an inspection for <br/> Pro# ${vm._currentShipment.proNbr}`;
        dialogArgs = { "dialogTitle" : "Submit Inspection", "dialogContent" : contentString, "dialogConfirmTxt" : "Submit Inspection" };
        locals = vm._dialogService.buildDialogBindings(dialogArgs);
        vm._dialogService.confirm(locals, vm.submitInspection.bind(this));
      }
    }

    /**
     * Performs the remote service call to submit an inspection (assumes the form has passed validation)
     */
    submitInspection() {
      var vm = this;
      vm._notesDirtyBit = false;
      vm._dialogService.hide();
      var initialStatus = this._currentInspection.inspectionStatusCd;
      var reqData={};
      var proNumber = this._currentShipment.proNbr;
      reqData.currentShipment = this._currentShipment;
      reqData.inspectionContext = this._inspectionContext;
      reqData.inspectionDetails = this._currentInspection;
      reqData.inspectionDetails.inspectionDateTime = moment().format();
      reqData.inspectionDetails.inspectionStatusCd = "I";
      reqData.inspectorPieceDimensions = this.getValidDimRows();
      reqData = this._mappingService.mapCreateInspectionRequest(reqData);
      vm._inspectionService.createInspection({"inspection" : reqData})
        .then(() => {
          vm.removeLocalData(proNumber);
          vm._$rootScope.toast('Inspection submitted.', 5);
          vm._cameraService.listLocalPhotos(vm._currentShipment.proNbr).then((imgArr) => {
            vm._twmPhotoUploadService.upload(imgArr, vm._inspectionService.inspectionContext.inspectorEmployeeID)
          })

          vm._$state.go("list");
        },(error) => {
          this._currentInspection.inspectionStatusCd = initialStatus;
          if(error.status !== vm._CODE_CONSTANTS.NO_NETWORK_CONN) {
            vm._$rootScope.toast('Failed to submit inspection. Please try again or contact support.', 5);
          }
        });
    }

    addNewDimRows(rowCount) {
      var iRowCnt = parseInt(rowCount, 10);
      if(typeof iRowCnt !== "number" || isNaN(iRowCnt)) {
        var locals = this._dialogService.buildDialogBindings({"dialogTitle" : "Inspection", "dialogContent" : "A valid number of rows must be provided."});
        this._dialogService.alert(locals);
      } else if(iRowCnt + this._dimensions.length > this._CODE_CONSTANTS.MAX_INSPECT_DIMS) {
        var locals = this._dialogService.buildDialogBindings({"dialogTitle" : "Inspection", "dialogContent" : `No more than ${this._CODE_CONSTANTS.MAX_INSPECT_DIMS} dimensions can be provided.`});
        this._dialogService.alert(locals);
      } else {
        // Add empty dimension fields
        this._dimensionService.addNewDimRows(rowCount, this._dimensions);
      }
      this._addDimRowDisabled = true;
    }

    /**
     * Triggered when the user leaves focus on a dimension input (pieces, width, height, length)
     * If the dimension item passes validation then it makes a service call to persist the dimension row and updates the
     * dimension sequence appropriately.
     * 02/03/2016 - bapfingsten - DE156
     * Removed the persistence to the backend as this data is now persisted locally on the Sqlite DB.
     * @param dimItem
     */
    triggerUpdateDims(dimItem) {
      if(this._dimensionService.validateDimRow(dimItem)) {
        this._$log.debug("Saving a valid dimension row...");
        // Update status to "In Progress" if necessary
        if(this.shouldUpdateStatus()) {
          this.setInspectionStatus("P");
        }
        //THE DATA IS NOW PERSISTED TO THE LOCAL SQLITE DB
        //var reqData={};
        //reqData.currentShipment = this._currentShipment;
        //reqData.inspectionContext = this._inspectionContext;
        //reqData.inspectionDetails = this._currentInspection;
        //reqData.inspectorPieceDimensions = this.getValidDimRows();
        //reqData = this._mappingService.mapUpdateInspectorDimRequest(reqData);
        //this._inspectionService.updateInspectorDimensions(reqData);
        this.autoSave();
      }
      this.calculateDimDerivatives();
      this._addDimRowDisabled = !this.isDimRowAdditionAllowed();
      this._$scope.$apply();
    }

    /**
     * Determines if a adding new dimension row entry should be allowed by checking to see if the last row index is valid
     * @returns Boolean
     */
    isDimRowAdditionAllowed() {
      return this._dimensionService.isDimRowAdditionAllowed(this._dimensions);
    }

    /**
     * @returns Array containing only validated dimension rows
     */
    getValidDimRows() {
      return this._dimensionService.getValidDimRows(this._dimensions);
    }

    notesValueChanged(){
      this._notesDirtyBit = true;
    }

    saveNotes(){
      var s = this;
      if (s._notesDirtyBit && s._currentInspection.inspectionNotes.note != undefined) {
        s.autoSave();
        s._inspectionService.updateInspectionNotes(this._currentShipment.proNbr, s._inspectionContext.inspectionSIC, s._currentInspection.inspectionNotes.note, s._inspectionContext);
        s._notesDirtyBit = false;
      }
    }

    autoSave() {
      var proNumber, details, success, error

      proNumber = this._currentShipment.proNbr
      details = this._currentInspection;
      success = () => this._$log.info("Successfully auto-saved details for " + proNumber)
      error = (e) => this._$log.error("Failed to auto-save details for " + proNumber + " : " + e.toString())

      this._autoSave
        .save(proNumber, details)
        .subscribe(success, error)

      //this._inspectionService.updateInspectionNotes(proNumber, this._inspectionContext.inspectionSIC, this._currentInspection.inspectionNotes.note, this._inspectionContext)
    }


    /**
     * Calculates the total volume in cubic feet and density for the entire shipment.
     */
    calculateDimDerivatives() {
      var result = this._dimensionService.calculateDimDerivatives(this._dimensions, this._currentShipment.totGrossWeight);
      this._currentInspection.totGrossVolume = result.volume;
      this._currentInspection.totDensity = result.density;
    }

    get _dimensions() {
      return this._currentInspection.inspectorPieceDimensions;
    }
    set _dimensions(value) {
      this._currentInspection.inspectorPieceDimensions = value;
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
            vm._$log.info(`${proNumber} removed from local persistance, Remaining Count : ${persistedPros.length} `)
          }
        });
    }
  }

  ngModule.controller(controllerName, inspectionInProgController);
};
