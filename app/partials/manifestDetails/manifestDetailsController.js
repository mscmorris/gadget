export default ngModule => {
  var controllerName = 'manifestDetailsController';

  class manifestDetailsController {
    /*@ngInject*/
    constructor($scope, $state, $log,inspectionService, igUtils, mappingService,CODE_CONSTANTS) {
      // Angular Module Deps
      this._$scope = $scope;
      this._$state = $state;
      this._$log = $log;
      // IG Deps
      this._inspectionService = inspectionService;
      this._igUtils = igUtils;
      this._mappingService = mappingService;
      this._CODE_CONSTANTS=CODE_CONSTANTS;
      // Local properties
      this._currInspection = this._inspectionService.getCurrInspection();
      this._inspectionContext = this._inspectionService.getInspectionContext();
      this._manifestDtls = this.getTrailerManifestDetails();
    }



    getTrailerManifestDetails() {
      this._inspectionService.getTrailerManifestDetails(this._currInspection.proNbr)
        .then((data) => {
          this._manifestDtls = data;
          return this._manifestDtls;
        });
    }
  }


  ngModule.controller(controllerName, manifestDetailsController);
};
