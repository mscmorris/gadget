export default ngModule => {
  var controllerName = 'sideNavController';

  class sideNavController {
    /*@ngInject*/
    constructor($scope, $log, $mdDialog) {
      this._$scope = $scope;
      this._$log = $log;
      this._$mdDialog = $mdDialog;
      this._findInput="";

    }
    add(ev) {
      this._$mdDialog.show({
        controller: 'sideNavController as nav',
        templateUrl: 'partials/nav/add.html',
        parent: angular.element(document.body),
        targetEvent: ev,
      }).then(function (answer) {
        this._$log.debug("AddProCall " + answer);
      });
    };

    onSubmitDialog(sicChanger) {
      this._$mdDialog.hide(sicChanger);
    }

  }

  ngModule.controller(controllerName, sideNavController);
}
