"use strict"

import Rx from "rx"

var controllerName = "sideNavController"


  class sideNavController {
    /*@ngInject*/
    constructor($rootScope,$scope, $mdSidenav, $timeout, $log, $mdDialog, $state, igUtils, endPointLocatorService,validationService,conditioningService,observeOnScope, cameraService) {
      this.$rootScope = $rootScope;
      this.$scope = $scope;
      this._$state = $state
      this._$log = $log;
      this._$mdDialog = $mdDialog;
      this._$timeout = $timeout;
      this.igUtils = igUtils;
      this.cameraService = cameraService;
      this.endPointLocatorService = endPointLocatorService;
      $scope.scannerInput = {'text' : ''}
      this._$mdSidenav = $mdSidenav;
      this.validationService = validationService;
      this.conditioningService = conditioningService;
      this.invalidInput = false;
      this.wireValidation($scope, observeOnScope);
      this.$scope.pendingPhotoCount = "0";
      this.pendingPhotoCount();
      var s = this;
      $scope.$watch(
        function () {
          return $mdSidenav('nav').isOpen();
        },
        function (newValue, oldValue) {
          if (newValue == true) {
            s.pendingPhotoCount();
          }
        });
    }
    wireValidation($scope, observeOnScope)
    {
      observeOnScope($scope, "scannerInput.text")
        .map(text => {
          if(text.newValue !== "") {
            this.invalidInput = false;
          }
          return text.newValue
        })
        .filter( newVal =>  this.validateDigit(newVal))
        .subscribe( validDigit => {
          if(this.validationService.isValidProNumber(validDigit)){
            this.close();
            this._$log.debug("Pro input: "+this.conditioningService.condition(validDigit));
            this._$state.go('shipmentDetails',{proNbr : this.conditioningService.condition(validDigit)})
          }else{
            this.invalidInput = true;
          }
          // Reset the text value in either case (valid: clear it out for next use. invalid: allows the user to scan next pro easily)
          $scope.scannerInput.text="";
        })
    }

    /**
     * Returns boolean flag if the Pro Entered fail to validate
     * @return boolean
     */
    validateDigit(text)
    {
      var s = this.validationService
      return  s.proNumberCheckDigit(text)
    }
    pendingPhotoCount(){
      var s = this;
      s.cameraService.getPendingPhotoCount().then(
        (value)=>{
          s.$scope.pendingPhotoCount = value;
        },
        (error)=>{
          s.$scope.pendingPhotoCount = 0;
        }
      );
    }

    close() {
      this.invalidInput = false;
      this._$mdSidenav("nav").close()
    }

    goToState(state, params = {}) {
      this._$state.go(state, params)
    };

    onSubmitDialog(sicChanger) {
      this._$mdDialog.hide(sicChanger);
    }

    listInspectionCorrections() {
      this._$log.debug(this.igUtils);
      this._$log.debug(this.igUtils.isExternalFunc("launchExternalBrowser"));
      if (this.igUtils.isExternalFunc("launchExternalBrowser")) {
        var url = `${this.endPointLocatorService.getInspectionsAppEndPoint(["inspectedShipmentList.seam"])}`;
        container.launchExternalBrowser(url);
      } else {
        this._$log.error(controllerName + "[listInspectionCorrections]: External Function 'launchExternalBrowser' is not available!");
      }
    }

    listPlanningShipments() {
      this._$log.debug(this.igUtils);
      this._$log.debug(this.igUtils.isExternalFunc("launchExternalBrowser"));
      if (this.igUtils.isExternalFunc("launchExternalBrowser")) {
        var url = `${this.endPointLocatorService.getInspectionsAppEndPoint(["inspectionPlanningList.seam"])}`;
        container.launchExternalBrowser(url);
      } else {
        this._$log.error(controllerName + "[listPlanningShipments]: External Function 'launchExternalBrowser' is not available!");
      }
    }
  }
export default ngModule => ngModule.controller(controllerName, sideNavController)

