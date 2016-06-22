export default ngModule =>
{
  var providerName = 'dialogService';

  class dialogService {
    /*@ngInject*/
    constructor($window, $log, $mdDialog) {
      this._$log = $log;
      this._$window = $window;
      this._$mdDialog = $mdDialog;
    }

    assignValue(mapObj, mapProp, dataSrc, defaultVal) {
      mapObj[mapProp] = (typeof dataSrc[mapProp] !== 'undefined' && dataSrc[mapProp] !== null) ? dataSrc[mapProp] : defaultVal;
    }

    /**
     * Returns an object containing all necessary values used as local providers that are injected into the 'partials/dialogs/DialogController'
     * @param args An argument POJO that may contain properties to override the default DialogController values
       */
    buildDialogBindings(args) {
      var returnObj = {};
      this.assignValue(returnObj, "dialogTitle", args, "XPO Logistics");
      this.assignValue(returnObj, "dialogContent", args, "");
      this.assignValue(returnObj, "dialogConfirmTxt", args, "Ok");
      this.assignValue(returnObj, "dialogCancelTxt", args, "Cancel");
      this.assignValue(returnObj, "clickOutsideToClose", args, false);
      this.assignValue(returnObj, "", args, false);
      return returnObj;
    }

    alert(localProviders, callbackFn) {
      this._$mdDialog.show({
        templateUrl: 'partials/dialogs/alert.html',
        controller: 'dialogController as vm',
        clickOutsideToClose: localProviders.clickOutsideToClose,
        locals: localProviders
      }).then(callbackFn);
    }

    confirm(localProviders, callbackFn) {
      this._$mdDialog.show({
        templateUrl: 'partials/dialogs/confirm.html',
        controller: 'dialogController as vm',
        clickOutsideToClose: localProviders.clickOutsideToClose,
        locals: localProviders
      }).then(callbackFn);
    }

    loading(localProviders) {
      this._$log.debug(`${providerName}: Showing Loading dialog...`);
      this._$mdDialog.show({
        templateUrl: 'partials/dialogs/loading.html',
        controller: 'dialogController as vm',
        locals: localProviders
      });
    }

    hide() {
      this._$log.debug(`${providerName}: Hiding dialog...`);
      this._$mdDialog.hide();
    }

    showCrashed() {
      let dialogArgs = {
        "dialogTitle":"Application Error",
        "dialogContent":`We’ve encountered an error with your application. Press "Ok” to refresh and correct the issue.`
      };
      let callbackFn = () => { container.reload() };
      let locals = this.buildDialogBindings(dialogArgs);
      this.alert(locals, callbackFn);
    }
  }
  ngModule.service(providerName, dialogService);
};
