"use strict"

import Rx from "rx"

var controllerName = "addProController"

class addProController {

  /**
   * [constructor description]
   * @param  {[type]} $scope            [description]
   * @param  {[type]} validationService [description]
   * @param  {[type]} rx                [description]
   * @param  {[type]} observeOnScope    [description]
   * @return void
   */
    /* @ngInject */
   constructor($rootScope, $scope, $log, $mdSidenav, $filter, dialogService, validationService, planningListService, inspectionListService, observeOnScope) {
     this.$rootScope = $rootScope;
     this.$scope = $scope;
     this.$log = $log;
     this.$filter = $filter;
     this.stateInvalid = false;
     this.dialogService = dialogService;
     this.validationService = validationService;
     this.planningListService = planningListService;
     this.inspectionListService = inspectionListService;
     $scope.errorMsg = "";
     $scope.proString = "";

     this.wireValidation($scope, observeOnScope)
   }

  /**
   * Wire up our validation
   * @param  {[type]} $scope         [description]
   * @param  {[type]} observeOnScope [description]
   * @return void
   */
   wireValidation($scope, observeOnScope)
   {

    observeOnScope($scope, "proString")
      .flatMap(this.hasInvalidProNumbers.bind(this))
      .subscribe(b => { this.stateInvalid = b })
  }

  /** [addToPlanning description] */
  addToPlanning()
  {

    this.$scope.errorMsg = undefined;
    var add = this.planningListService.add.bind(this.planningListService)

    this
      .getValidProNumbers()
      .flatMap(add)
      .reduce(this.formatForDialog, { success: [], failed: [] })
      .subscribe(result => {
        if (result.success.length > 0 || result.failed.length > 0) {
          this.showDialog(result, "Planning List")
        }
        this.showInvalidPros();
      });

  }

  showInvalidPros(){
    var s = this;
    s.hasInvalidProNumbers().subscribe((b) => {
      if (b == true) {
        var badPro = "";
        s.getInvalidProNumbers()
          .filter((s) => s != undefined && s !== "")
          .subscribe(pro => {badPro = `${badPro}${pro},`},error=>{},complete=>{
            badPro = badPro.trim().substring(0, badPro.length - 1);
            if (badPro.length > 0) {
              s.$scope.proString = badPro;
              s.$scope.errorMsg = `${badPro} invalid. Please try again. `;
            }
          });
      } else {
        s.$scope.proString = "";
      }
    });
  }

  /** [addToInspection description] */
  addToInspection()
  {
    var s = this;
    s.$scope.errorMsg = undefined;
    var add = this.inspectionListService.add.bind(this.inspectionListService)
    this
      .getValidProNumbers()
      .flatMap(add)
      .reduce(this.formatForDialog, { success: [], failed: [] })
      .subscribe(result => {
        if (result.success.length > 0 || result.failed.length > 0) {
          s.showDialog(result, "Inspection List");
        }
        s.showInvalidPros();
      })
  }

  formatForDialog(o, r)
  {
    o[r.status] = o[r.status].concat({ pro: r.pro, message: r.message })
    return o
  }

  /**
   * [showDialog description]
   * @return {[type]} [description]
   */
   showDialog(result, listType)
   {
      var content = ""
      var COBmessage = " will appear on your list when confirmed on board or billed."
      var includeCOB = false

      if(result.success.length > 0) {
        content += `${result.success.length} PRO(s) have been added to ${listType}.<br/>`
        for(let currentResult in result.success) {
          var _msg = result.success[currentResult].message
          if(_msg !== undefined && _msg.toLowerCase().includes("not yet in the system")) {
            // PRO not yet confirmed on board or billed - prepend the pro number to the COB feedback message
            COBmessage = `, ${this.$filter('friendlyProNumber')(result.success[currentResult].pro)} ${COBmessage}`
            includeCOB = true
          }
        }
      }

      if(includeCOB) {
        content += `<br/>${COBmessage.substring(2)}`
      }

      if(result.failed.length > 0) {
        //content += "<br/><br/>"
        //content += "The following PRO(s) did not add successfully:<br/>"
        //for(let currentResult in result.failed) {
        //  console.log(currentResult)
        //  content += `${result.failed[currentResult].pro}: ${result.failed[currentResult].message}<br/>`
        //}
        for(let currentResult in result.failed) {
          this.$log.error(`[${controllerName}] Failed to Add PRO ${result.failed[currentResult].pro}: ${result.failed[currentResult].message}`)
        }
        this.$rootScope.toast(`${result.failed.length} PROs failed to add. System error. Please contact support.`)
      }



      var dialogArgs = { "dialogTitle" : "Add PRO(s)", "dialogContent" : content }
      var locals = this.dialogService.buildDialogBindings(dialogArgs)

      this.dialogService.alert(locals)
   }

  /**
   * Returns a stream of PROs from our input field
   * @return Observable A stream of individual PROs
   */
   getProNumbers()
   {
    return Rx.Observable
      .from(this.$scope.proString.split(/[,;\r\n\s]+/g))
      //.map(s => s.replace(/\D/g, ""))
  }

  /**
   * Return a stream of valid PRO numbers
   */
  getValidProNumbers()
  {
    var s = this.validationService
    return this.getProNumbers().filter((p) => s.isValidProNumber.call(s, p))
  }



  /**
   * Returns a stream of PRO numbers that fail to validate
   * @return Observable A stream of invalid PROs
   */
   getInvalidProNumbers()
   {
    var s = this.validationService
    return this.getProNumbers().filter((p) => !s.isValidProNumber.call(s, p));
  }

  /**
   * Returns an observable that indicates if we have any invalid PROs
   * @return Observable An Observable emitting a single boolean value
   */
   hasInvalidProNumbers()
   {
    return this.getInvalidProNumbers().isEmpty().map(b => !b)
  }
}

export default ngModule => ngModule.controller(controllerName, addProController)
