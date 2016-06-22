export default ngModule => {
  var controllerName = 'dialogController';

  class dialogController {
    /*@ngInject*/
    constructor($rootScope, $scope, $state, $log, $mdDialog, $window, igUtils, dialogTitle, dialogContent,
      dialogConfirmTxt, dialogCancelTxt) {
      var vm = this;
      // Angular Module Deps
      this._$rootScope = $rootScope;
      this._$scope = $scope;
      this._$state = $state;
      this._$log = $log;
      this._$mdDialog = $mdDialog;
      this._$window = $window;
      this._igUtils = igUtils;
      this._dialogTitle = dialogTitle;
      this._dialogContent = dialogContent;
      this._dialogConfirmTxt = dialogConfirmTxt;
      this._dialogCancelTxt = dialogCancelTxt;
    }

    cancelDialog() {
      this._$mdDialog.cancel();
    }

    hideDialog() {
      this._$mdDialog.hide();
    }
  }

  ngModule.controller(controllerName, dialogController);
};
