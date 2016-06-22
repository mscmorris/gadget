export default ngModule => {
  var controllerName = 'viewPhotoController';

  class viewPhotoController {
    /*@ngInject*/
    constructor($rootScope, $scope, $log, $mdDialog, $state, cameraService, inspectionService) {
      // Angular Module Deps
      this.$rootScope = $rootScope;
      this.$scope = $scope;
      this._$log = $log;
      this.$mdDialog = $mdDialog;
      this.$state = $state;
      // IG Deps
      this.inspectionService = inspectionService;
      this.cameraService = cameraService;
      // Local properties
      this.photoContents = this.cameraService.getCurrPhotoSource();
      this.photoID = this.cameraService.getCurrPhotoID();
      this.photoOrigin = this.cameraService.getCurrPhotoOrigin();
      this.currInspection = this.inspectionService.getCurrInspection();
    }
  }
  ngModule.controller(controllerName, viewPhotoController);
};
