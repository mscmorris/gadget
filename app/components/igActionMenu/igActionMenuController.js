export default ngModule => {
  var controllerName = 'igActionMenuController';

  class igActionMenuController {
    /*@ngInject*/
    constructor($scope, $rootScope, $log, $state, shipmentActionService, inspectionService, igUtils, persistenceService) {
      // Angular Module Deps
      this._$scope = $scope;
      this._$rootScope = $rootScope;
      this._$log = $log;
      this._$state = $state;
      // IG Deps
      this._shipmentActionService = shipmentActionService;
      this._inspectionService = inspectionService;
      this._igUtils = igUtils;
      this._persistenceService = persistenceService;
      this._manualAddStates = ["NONE"];
    }

    /**
     * Determines if an Action Menu item should be displayed for a particular shipment status
     * @param menuItem
     * @returns {*}
     */
    displayActionMenuItem(menuItem){
      return this._shipmentActionService.displayActionMenuItem(menuItem,this.currentShipment.inspectionStatusCd);
    }

    setInspectionStatus(status, notifyMsg) {
      this.filterToWebService(status).then(
        (success) => {
          var notifyObj = { message: notifyMsg, duration: 5, type: "toast" };
          this._persistenceService.insert("NOTIFY_ON_LOAD", notifyObj);
          this._$state.go('list');
        },
        (error) => {
          this._$rootScope.toast(`Failed to perform action. Please contact support if error persists.`)
        }
      );
    }

    filterToWebService(newStatus) {
      // Call add Pro manually when passed in Status is Y
      // Call add create Inspection when passed in Status is R
      if (newStatus == 'Y' && this._manualAddStates.includes(this.currentShipment.inspectionStatusCd)) {
        return this._shipmentActionService.addToPlanningList(newStatus, undefined, this.currentShipment.proNbr);
      } else if (newStatus == 'R' && this._manualAddStates.includes(this.currentShipment.inspectionStatusCd)) {
        return this._shipmentActionService.addToInspectionList(newStatus, undefined, this.currentShipment.proNbr);
      } else {
        return this._shipmentActionService.setInspectionStatus(newStatus, undefined, this.currentShipment.proNbr);
      }
    }

    get currentShipment() {
      var merged = this._igUtils.extend({}, this._inspectionService.getCurrentInspection(), this._inspectionService.getCurrentShipment());
      return merged;
    }

    showActionMenu($mdOpenMenu){
      if(this._inspectionService.currentShipment.hasOwnProperty('proNbr')){
        $mdOpenMenu.call();
      }/*else{
        vm.$rootScope.toast(`No shipments are selected.`, 2);
      }*/
    }

  }

  ngModule.controller(controllerName, igActionMenuController);
};
