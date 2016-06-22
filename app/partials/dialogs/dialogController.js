export default ngModule => {
  var controllerName = 'dialogController';

  class dialogController {
    /*@ngInject*/
    constructor($rootScope, $scope, $state, $log, $mdDialog, $window, igUtils, dialogTitle, dialogContent,
      dialogConfirmTxt, dialogCancelTxt,navigationService) {
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
      this.navigationService = navigationService;
    }

    cancelDialog() {
      this._$mdDialog.cancel();
    }

    cancelLoading(){
      var s = this;
      s._$log.debug(`${controllerName}: Cancelling Loading dialog...`);
      s._$mdDialog.cancel();
      s.navigationService.prevState();
    }

    hideDialog() {
      this._$mdDialog.hide();
    }
  }

  ngModule.controller(controllerName, dialogController);
};
