export default ngModule => {
  var controllerName = 'manifestDetailsController';

  class manifestDetailsController {
    /*@ngInject*/
    constructor($scope, $state,$stateParams, $log,$mdDialog,$timeout,inspectionService, igUtils, mappingService,CODE_CONSTANTS,
                navigationService,dialogService, persistenceService, conditioningService) {
      // Angular Module Deps
      this._$scope = $scope;
      this._$state = $state;
      this._$stateParams = $stateParams;
      this._$log = $log;
      this._$mdDialog = $mdDialog;
      this._$timeout=$timeout;
      // IG Deps
      this._inspectionService = inspectionService;
      this._igUtils = igUtils;
      this._mappingService = mappingService;
      this._CODE_CONSTANTS=CODE_CONSTANTS;
      this.navigationService=navigationService;
      this._dialogService = dialogService;
      // Local properties
      this._inspectionContext = this._inspectionService.getInspectionContext();
      this._manifestDtls ={};
      this._totalShipmentsWeight = 0;
      this._totalHeadLoadPro = 0;
      this._inspectionService = inspectionService;
      this._persistenceService = persistenceService;
      this._conditioningService = conditioningService;
      this.activate();

    }

    activate(){

      var dialogArgs={};

      dialogArgs.dialogTitle = "Looking Up The Trailer Manifest";
      var locals = this._dialogService.buildDialogBindings(dialogArgs);
      this._dialogService.loading(locals);
      this.getTrailerManifestDetails(this._$stateParams);

      /*this._$timeout( () => {

        console.log('update with timeout fired');
      }, 6000, false);*/
    }


    getTrailerManifestDetails(params) {
      var s = this;
      var reqData= {};
      if(s._$stateParams.lookupType == 'trailer'){
        reqData.trailer = s._$stateParams.lookupNumber;
      }else{
        reqData.door = s._$stateParams.lookupNumber;
      }
      reqData.inspectionContext = s._inspectionContext;

      reqData =  s._mappingService.mapCreateReqForManifest(reqData);

      this._inspectionService.getManifest(reqData)
        .then( data => {
          s._dialogService.hide();
          s._manifestDtls = data;
          if(s._loadedShipments.length > 0){
            s.calculateSummaryForOverView(s._loadedShipments);
          }

        },error =>{
          s._dialogService.hide();
          /* PopOut the last state from stack , lookUp */
          s.navigationService.popState();
          let notifyObj = {
            message: this._conditioningService.sliceError(error.data.message),
            type: "inline"
          };
          s._persistenceService.insert("NOTIFY_ON_LOAD", notifyObj);
          s._$state.go('lookup');
        });
    }

    get _loadedTrailer(){
        return this._manifestDtls.loadedTrailer;
    }

    get _loadedShipments(){
        return this._manifestDtls.loadedShipments;
    }

    calculateSummaryForOverView(loadedShipments) {
      var s = this;
      angular.forEach(loadedShipments,(shm, idx) => {
        s._totalShipmentsWeight += shm.totWeight;
        if(shm.headloadInd){
          s._totalHeadLoadPro ++;
        }
      })
    }
  }


  ngModule.controller(controllerName, manifestDetailsController);
};
