/**
 * Created by bapfingsten on 1/4/2016.
 */
export default ngModule => {
  var controllerName = 'lookupController';

  class lookupController {
    /*@ngInject*/
    constructor($scope, $log, $state,$stateParams, validationService, conditioningService,navigationService) {
      this._$scope = $scope;
      this._$log = $log;
      this._$state = $state;
      this._$stateParams = $stateParams;
      this._validationService = validationService;
      this._conditioningService = conditioningService;
      this._navigationService = navigationService;
      this._manifestInputValue = "";
      this._invalidinput = false;
    }
    lookup(value){
      var s = this;
      s._invalidinput = false;
      if (s._validationService.isValidProNumber(s._manifestInputValue)){
        s._$log.debug("Pro input: "+s._conditioningService.condition(s._manifestInputValue));
        s._$state.go("shipmentDetails",{proNbr:s._conditioningService.condition(s._manifestInputValue)});
      }else if (s._validationService.isValidDoorNumber(s._manifestInputValue)){
        s._$log.debug("Door input: "+s._manifestInputValue);
        s._$state.go("manifestDetails",{lookupNumber:s._manifestInputValue, lookupType:'door'});
      }else if (s._validationService.isValidTrailerNumber(s._manifestInputValue)){
        s._$log.debug("Trailer input: "+s._manifestInputValue);
        s._$state.go("manifestDetails",{lookupNumber:s._manifestInputValue, lookupType:'trailer'});
      }else{
        s._invalidinput = true;
        //error state?
      }
    }

  }
  ngModule.controller(controllerName, lookupController);
}
