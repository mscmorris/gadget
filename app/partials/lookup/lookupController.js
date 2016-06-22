/**
 * Created by bapfingsten on 1/4/2016.
 */
export default ngModule => {
  var controllerName = 'lookupController';

  class lookupController {
    /*@ngInject*/
    constructor($scope, $log, $state, $mdSidenav, validationService) {
      this._$scope = $scope;
      this._$log = $log;
      this._$state = $state;
      this._validationService = validationService;
      this._manifestInputValue = "";
      this._invalidinput = false;
      $mdSidenav("nav").close();
    }
    lookup(value){
      var s = this;
      s._invalidinput = false;
      if (s._validationService.isValidProNumber(s._manifestInputValue)){
        s._$log.debug("Pro input: "+s._validationService.conditionProValue(s._manifestInputValue));
        s._$state.go("",{pro:s._validationService.conditionProValue(s._manifestInputValue)});
      }else if (s._validationService.isValidDoorNumber(s._manifestInputValue)){
        s._$log.debug("Door input: "+s._manifestInputValue);
        s._$state.go("",{lookupNumber:s._manifestInputValue, lookupType:'door'});
      }else if (s._validationService.isValidTrailerNumber(s._manifestInputValue)){
        s._$log.debug("Trailer input: "+s._manifestInputValue);
        s._$state.go("",{lookupNumber:s._manifestInputValue, lookupType:'trailer'});
      }else{
        s._invalidinput = true;
        //error state?
      }
    };
  }
  ngModule.controller(controllerName, lookupController);
}
