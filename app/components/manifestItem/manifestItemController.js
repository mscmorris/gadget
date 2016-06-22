import rx from 'rx'

export default ngModule => {

  var controllerName = 'manifestItemController';

  class manifestItemController {
    /* @ngInject */
    constructor($rootScope,$scope, $log, inspectionService, CODE_CONSTANTS,inspectionListService,planningListService,shipmentActionService,conditioningService) {
      this.$rootScope = $rootScope;
      this.$scope = $scope;
      this._$log = $log;
      this.inspectionService = inspectionService;
      this.CODE_CONSTANTS = CODE_CONSTANTS;
      this.inspectionListService = inspectionListService;
      this.planningListService = planningListService;
      this.shipmentActionService = shipmentActionService;
      this.conditioningService = conditioningService;
    }


    onExpand() {
      this.expanded = !this.expanded;
    }

    // toDo : get Pro as observable
    /*getProNumber()
    {
      console.log(this.manifestitem.proNbr);
      return Rx.Observable
        .from(this.manifestitem.proNbr)
    }*/



    /** [addToPlanning description] */
    addToPlanning(proNumber)
    {

      this
        .planningListService.add(proNumber)
        .do(o => { if(o.status === "success") { this.manifestitem.inspectionStatusCd = "Y" } })
        .map(r => { return this.notifyMsg(r,'Y')})
        .subscribe(result => {
          this.toastMsg(result)
        })
    }

    /** [addToInspection description] */
    addToInspection(proNumber)
    {
      this
        .inspectionListService.add(proNumber)
        .do(o => { if(o.status === "success") { this.manifestitem.inspectionStatusCd = "R" } })
        .map(r => { return this.notifyMsg(r,'R')})
        .subscribe(result => {
          this.toastMsg(result)
        })
    }

    toastMsg(result){
      if(typeof result !== 'undefined' && result !== "") {
        this.$rootScope.toast(result, 5);
      }
    }

    notifyMsg(r,status){
      if(status == 'R'){
        return (r.status === "success") ?
          `PRO ${this.conditioningService.condition(r.pro)} has been added to your Inspection List` : `Failed in adding to your Inspection List`
      }else{
        return (r.status === "success") ?
          `PRO ${this.conditioningService.condition(r.pro)} has been added to your Planning List` : `Failed in adding to your Planning List`
      }

    }

    displayActionMenuItem(menuItem){
      return (this.displayPro(this.manifestitem.proNbr)) ? this.shipmentActionService.displayActionMenuItem(menuItem,this.manifestitem.inspectionStatusCd) :false;
    }

    setInspectionStatus(status) {

      // Call add Pro manually when passed in Status is Y
      // Call add create Inspection when passed in Status is R

      if(status == 'Y' && this.manifestitem.inspectionStatusCd == 'NONE'){
        this.addToPlanning(this.manifestitem.proNbr);
      }else if (status == 'R' && this.manifestitem.inspectionStatusCd == 'NONE'){
        this.addToInspection(this.manifestitem.proNbr);
      }else {
        var notifyMsg = (status == 'Y') ? 'Shipment moved to Planning List.' : 'Shipment moved to Inspection List.'
        this.shipmentActionService.setInspectionStatus(status,notifyMsg,this.manifestitem.proNbr)
          .then(() => { this.manifestitem.inspectionStatusCd = status })
      }
    }

    displayPro(proNbr){
      return (proNbr.length >= 9) ? true :false;
    }


  }

  ngModule.controller(controllerName, manifestItemController);
}
