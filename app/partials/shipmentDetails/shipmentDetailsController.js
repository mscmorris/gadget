export default ngModule => {
  var controllerName = 'shipmentDetailsController';

  class shipmentDetailsController {
    /*@ngInject*/
    constructor($rootScope, $scope, $state, $log, $mdDialog, $window, inspectionService, igUtils, mappingService,CODE_CONSTANTS,
                PRICING_APP_ENDPOINT, CORRECTIONS_APP_ENDPOINT) {
      // Angular Module Deps
      this._$rootScope = $rootScope;
      this._$scope = $scope;
      this._$state = $state;
      this._$log = $log;
      this._$mdDialog = $mdDialog;
      this._$window = $window;
      // IG Deps
      this._inspectionService = inspectionService;
      this._igUtils = igUtils;
      this._mappingService = mappingService;
      // Local properties
      this._currInspection = this._inspectionService.getCurrInspection();
      this._inspectionContext = this._inspectionService.getInspectionContext();
      this._shipDtls = this.getShipmentDetails();
      this._prevInspectionDetails = this.getPrevInspectionDetails();
      this._shipLocDtls = this.getShipmentLocationDetails();
      this._iframeContentSrc = "";
      this._prevStatus="C";
      this._CODE_CONSTANTS=CODE_CONSTANTS;
      this._PRICING_APP_ENDPOINT = PRICING_APP_ENDPOINT;
      this._CORRECTIONS_APP_ENDPOINT = CORRECTIONS_APP_ENDPOINT;
      this._actionMenuItem =this.setActionMenuItem();
    }

    setActionMenuItem(){
      this._actionMenuItem={};
      this._actionMenuItem["mvInsList"]= [this._CODE_CONSTANTS.INSPECT_STATUS.Y,this._CODE_CONSTANTS.INSPECT_STATUS.I,this._CODE_CONSTANTS.INSPECT_STATUS.X,this._CODE_CONSTANTS.INSPECT_STATUS.N];
      this._actionMenuItem["mvPlanList"]= [this._CODE_CONSTANTS.INSPECT_STATUS.R,this._CODE_CONSTANTS.INSPECT_STATUS.I,this._CODE_CONSTANTS.INSPECT_STATUS.X,this._CODE_CONSTANTS.INSPECT_STATUS.N];
      this._actionMenuItem["mvDismiss"]= [this._CODE_CONSTANTS.INSPECT_STATUS.Y,this._CODE_CONSTANTS.INSPECT_STATUS.R,this._CODE_CONSTANTS.INSPECT_STATUS.P];
      this._actionMenuItem["mvInspNtCrcted"]= [this._CODE_CONSTANTS.INSPECT_STATUS.R,this._CODE_CONSTANTS.INSPECT_STATUS.P,this._CODE_CONSTANTS.INSPECT_STATUS.I];

      return this._actionMenuItem;

    }

    displayActionMenuItem(menuItem){
      if((this._currInspection.inspectionStatusCd !== "") && (this._actionMenuItem[menuItem].indexOf(this._currInspection.inspectionStatusCd) != -1)) {
        return true;
      } else if (this._currInspection.inspectionStatusCd === "" && (menuItem == 'mvInsList' ||  menuItem == 'mvPlanList')) {
        return true;
      }else{
        return false;
      }

    }

    setInspectionStatus(status, notifyMsg) {
      var selProNbrs = [];
      var req = {};
      selProNbrs.push(this._currInspection.proNbr);
      req["inspectionContext"]=this._inspectionContext;
      req["actionCd"]=status;
      req["alertProNbr"]=selProNbrs;

      return this._inspectionService.setInspectionStatus(req)
        .then(response=>{
          this._inspectionService.currInspection["inspectionStatusCd"] = this._mappingService.transInspCodeToStatus(status);
          if(typeof notifyMsg !== 'undefined' && notifyMsg !== "") {
            this._$rootScope.toast(notifyMsg, 5);
          }
        },error=>{this._$log.error(controllerName + "[setInspectionStatus]: SETINSPECTIONSTATUS call failed!");});

    }

    getShipmentDetails() {
      this._inspectionService.getInspectionShipmentDetails(this._currInspection.proNbr)
        .then((data) => {
          this._shipDtls = this.translateShipDtls(data);
          this._inspectionService.currInspection.motorizedPiecesCnt = this._shipDtls.motorizedPiecesCnt;
          this._inspectionService.currInspection.loosePiecesCnt = this._shipDtls.loosePiecesCnt;
          return this._shipDtls;
        },
        (error) => {
          this._$rootScope.toast("System error. Please contact support.", 5);
        });
    }

    /**
     * Translates raw values to values formatted for display
     * @param dtlsObj The object containing the raw values
     * @returns {*}
     */
    translateShipDtls(dtlsObj) {
      dtlsObj.item15Exempt = this._mappingService.transBoolToYorN(dtlsObj.item15Exempt);
      dtlsObj.elsExempt = this._mappingService.transBoolToYorN(dtlsObj.elsExempt);
      dtlsObj.linealExempt = this._mappingService.transBoolToYorN(dtlsObj.linealExempt);
      dtlsObj.shipperIsDebtor = this._mappingService.transBoolToYorN(dtlsObj.shipperIsDebtor);
      return dtlsObj;
    }

    getShipmentLocationDetails() {
      this._inspectionService.getInspectionShipmentLocationDetails(this._currInspection.proNbr, this._inspectionContext.requestingSic)
        .then((data) => {
          this._shipLocDtls = data;
          return this._shipLocDtls;
        },
        (error) => {
          this._$rootScope.toast("System error. Please contact support.", 5);
        });
    }

    getPrevInspectionDetails() {
      this._inspectionService.getPrevInspectionDetails(this._currInspection.proNbr, this._inspectionContext.requestingSic)
        .then((data) => {
          this._prevInspectionDetails = this.translatePrevInspectionDetails(data);
          this._$log.debug(this._prevInspectionDetails);
          return data;
        },
        (error) => {
          this._$rootScope.toast("System error. Please contact support.", 5);
        });
    }

    /**
     * Translates raw values to values formatted for display
     * @param dtlsObj The object containing the raw values
     * @returns {*}
     */
    translatePrevInspectionDetails(dtlsObj) {
      //dtlsObj.item15Exempt = this._mappingService.transBoolToYorN(dtlsObj.item15Exempt);
      //dtlsObj.elsExempt = this._mappingService.transBoolToYorN(dtlsObj.elsExempt);
      //dtlsObj.linealExempt = this._mappingService.transBoolToYorN(dtlsObj.linealExempt);
      //dtlsObj.shipperIsDebtor = this._mappingService.transBoolToYorN(dtlsObj.shipperIsDebtor);

      return dtlsObj;
    }

    viewAppliedRuleset(event) {
      this._iframeContentSrc = `${this._PRICING_APP_ENDPOINT}/initRulesetView.do?proId=${this._currInspection.proNbr}&popUp=Y`;
      this._$mdDialog.show({
          scope: this._$scope,
          preserveScope: true,
          templateUrl: 'partials/dialogs/iframeDisplay.html',
          parent: angular.element(document.body),
          targetEvent: event,
          clickOutsideToClose:true
      });
    }

    viewPreviousCorrections(event) {
      this._iframeContentSrc = `${this._CORRECTIONS_APP_ENDPOINT}/shipments/show.do?proNumber=${this._currInspection.proNbr}`;
      this._$mdDialog.show({
        scope: this._$scope,
        preserveScope: true,
        templateUrl: 'partials/dialogs/iframeDisplay.html',
        parent: angular.element(document.body),
        targetEvent: event,
        clickOutsideToClose:true
      });
    }

    onClickViewPrevIns(selector) {
      var element = angular.element(selector);
      element.isolateScope().innerExpand();
    }

  }


  ngModule.controller(controllerName, shipmentDetailsController);
};
