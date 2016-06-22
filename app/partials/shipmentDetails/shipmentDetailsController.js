var moment = require('moment');

export default ngModule => {
  var controllerName = 'shipmentDetailsController';

  class shipmentDetailsController {
    /*@ngInject*/
    constructor($rootScope, $scope, $state, $log, $mdDialog, $window, $stateParams, inspectionService, documentService, igUtils, mappingService,
                conditioningService, CODE_CONSTANTS, endPointLocatorService, planningListService, persistenceService,
                shipmentActionService, dialogService, dimensionService, $timeout, $q) {
      // Angular Module Deps
      this._$rootScope = $rootScope;
      this._$scope = $scope;
      this._$state = $state;
      this._$log = $log;
      this._$mdDialog = $mdDialog;
      this._$timeout = $timeout;
      this._$window = $window;
      this._$stateParams = $stateParams;
      // IG Deps
      this._inspectionService = inspectionService;
      this._documentService = documentService;
      this._persistenceService = persistenceService;
      this._archivedDocs = [];
      this._igUtils = igUtils;
      this._mappingService = mappingService;
      this._conditioningService = conditioningService;
      this._planningListService = planningListService;
      this._shipmentActionService = shipmentActionService;
      this._dialogService = dialogService;
      this._dimensionService = dimensionService;
      this._$q = $q;
      // Local properties
      this._inspectionContext = this._inspectionService.getInspectionContext();
      this._shipDtls = {};
      this._shipLocDtls ={};
      this._currentInspection = {};
      this._iframeContentSrc = "";
      this._prevInspectionStatus = "";
      this._CODE_CONSTANTS = CODE_CONSTANTS;
      this.endPointLocatorService = endPointLocatorService;
      this._STATUS_CORRECTED = "T,C";
      this._STATUS_INSPECTED = "I";
      this._$scope.documents = [];
      this._$scope.locationAndMovementLoading = false;
      this._$scope.documentsLoading = false;
      this.shipmentDetailsLoading = false;
      this._prevInspectionDetails = {};
      this._timeoutToken = undefined;
      this.activate();

    }

    activate() {
      this._timeoutToken = this._$timeout(()=> {
        var dialogArgs = {};
        dialogArgs.dialogTitle = "Looking Up Shipment Details";
        var locals = this._dialogService.buildDialogBindings(dialogArgs);
        this._dialogService.loading(locals);
      }, 150);
      this.getShipmentDetails().finally(()=> {
        this.getInspectionDetails().finally(()=> {
          this._$timeout.cancel(this._timeoutToken);
          this._$timeout(()=> {
            this._dialogService.hide();
          }, 200);
        });
      });
    }

    getShipmentDetails() {
      var s = this;
      this.shipmentDetailsLoading = true;
      return this._inspectionService.getInspectionShipmentDetails(this._$stateParams.proNbr)
        .then((data) => {
            s._shipDtls = s.translateShipDtls(data);
          },
          (error) => {
            if (error.status !== this._CODE_CONSTANTS.NO_NETWORK_CONN) {
              s._$rootScope.toast(error.data.message, 5);
            }
          }).finally(() => {
          this.shipmentDetailsLoading = false;
        });
    }

    getInspectionDetails() {
      return this._inspectionService.getInspectionDetails(this._$stateParams.proNbr)
        .then((data) => {
            this._currentInspection = data;
            this._prevInspectionStatus = this._inspectionService.getPrevInspectionStatus();
          },
          (error) => {
            if (error.status && error.status !== this._CODE_CONSTANTS.NO_NETWORK_CONN) {
              if (error.data.message.toLowerCase().includes('inspection not found')) {
                this._currentInspection = this._inspectionService.getCurrentInspection(); // Expects Inspection Object with Status 'NONE'
              } else {
                this._$rootScope.toast(error.data.message, 5);
              }
            }
          });
    }

    /**
     * Translates raw values to values formatted for display
     * @param dtlsObj The object containing the raw values
     * @returns {*}
     */
    translateShipDtls(dtlsObj) {
      dtlsObj.item15Exempt = this._mappingService.transInvertBoolToYorN(dtlsObj.item15Exempt);
      dtlsObj.elsExempt = this._mappingService.transInvertBoolToYorN(dtlsObj.elsExempt);
      dtlsObj.linealFootEligibility = this._mappingService.transBoolToYorN(dtlsObj.linealFootEligibility);
      dtlsObj.specialCapacityRuleInd = this._mappingService.transBoolToYorN(dtlsObj.specialCapacityRuleInd);
      dtlsObj.shipperIsDebtor = this._mappingService.transBoolToYorN(dtlsObj.shipperIsDebtor);
      return dtlsObj;
    }

    getShipmentLocationDetails() {
      if(this._shipDtls.hasOwnProperty('proNbr') && this._shipDtls.proNbr !== undefined){
        this._$scope.locationAndMovementLoading = true
        this._inspectionService.getInspectionShipmentLocationDetails(this._shipDtls.proNbr,
          this._inspectionContext.inspectionSIC, this._inspectionContext.shiftCd)
          .then((data) => {
              this._shipLocDtls = data;
              this._$scope.locationAndMovementLoading = false
              return this._shipLocDtls;
            },
            (error) => {
              this._$scope.locationAndMovementLoading = false
              if (error.status !== this._CODE_CONSTANTS.NO_NETWORK_CONN) {
                this._$rootScope.toast(error.data.message, 5);
              }
            });
      }
    }

    getPrevInspectionDetails() {
      this._inspectionService.getPrevInspectionDetails(this._shipDtls.proNbr, this._inspectionContext.inspectionSIC)
        .then((data) => {
            this._prevInspectionDetails = data;
            this.calculateDimDerivatives();
          },
          (error) => {
            if (error.status !== this._CODE_CONSTANTS.NO_NETWORK_CONN) {
              this._$rootScope.toast(error.data.message, 5);
            }
          });
    }

    get _dimensions() {
      return this._prevInspectionDetails.inspectorPieceDimensions;
    }

    /**
     * Calculates the total volume in cubic feet and density for the entire shipment.
     */
    calculateDimDerivatives() {
      var result = this._dimensionService.calculateDimDerivatives(this._dimensions, this._shipDtls.totGrossWeight);
      this._prevInspectionDetails.totGrossVolume = result.volume;
      this._prevInspectionDetails.totDensity = result.density;
    }


    inspectClickHandler() {
      if (this._shipDtls.hasOwnProperty('proNbr')) {
        this._$state.go("inspectionInProgress");
      } else {
        this._$rootScope.toast("No shipment details detected. Cannot begin inspection.");
      }
    }

    viewAppliedRuleset(event) {
      var _proNbr = this._conditioningService.condition(this._shipDtls.proNbr, 11);
      var _pkupDt = moment(this._shipDtls.pkupDate).format('MM/DD/YYYY');
      var _rsSeq = this._shipDtls.appliedRulesetNbr;
      var _docId = this._shipDtls.appliedAgreementID;
      this.iFrameErrorMessage = "Unable to Retrieve Rule Set";
      this._iframeContentSrc = this.endPointLocatorService.getPricingAppEndPoint(
        ["initRulesetView.do"],
        [`proId=${_proNbr}`,
          `shipmentPkupDt=${_pkupDt}`,
          `rsSeq=${_rsSeq}`,
          `docId=${_docId}`,
          "popUp=Y"
        ]);
      this._$mdDialog.show({
        scope: this._$scope,
        preserveScope: true,
        templateUrl: 'partials/dialogs/iframeDisplay.html',
        parent: angular.element(document.body),
        targetEvent: event,
        clickOutsideToClose: true
      });
    }

    viewPreviousCorrections(event) {
      var _proNbr = this._conditioningService.condition(this._shipDtls.proNbr, 11);
      this.iFrameErrorMessage = "Unable to Retrieve Previous Correction";
      this._iframeContentSrc = this.endPointLocatorService.getCorrectionAppEndPoint(["shipments", "show.do"], [`proNumber=${_proNbr}`]);
      this._$mdDialog.show({
        scope: this._$scope,
        preserveScope: true,
        templateUrl: 'partials/dialogs/iframeDisplay.html',
        parent: angular.element(document.body),
        targetEvent: event,
        clickOutsideToClose: true
      });
    }

    onClickViewPrevIns(selector) {
      var element = angular.element(selector);
      element.isolateScope().innerExpand();
    }

    viewArchiveDoc(doc) {
      var s = this;
      var dialogArgs = {};
      dialogArgs.dialogTitle = "Retrieving Archived Document";
      var locals = s._dialogService.buildDialogBindings(dialogArgs);
      s._dialogService.loading(locals);

      s._archivedDoc = s._documentService
        .fetchDocument(doc).finally(() => {
          s._dialogService.hide()
        });

      s._archivedDoc.subscribe(
        (pages)=> {
          s._inspectionService.setCurrentArchiveDoc(pages);
          s._$state.go('viewArchiveDoc');
        },
        (error)=> {
          s._$log.error(`${controllerName} [fetchDocuments]: ${error}`);
          s._$rootScope.toast(error.data.message, 5);
        }
      )
    }

    getPersistedArchiveDocuments() {
      var s = this;
      var retVal = Rx.Observable.fromPromise(s._persistenceService.find(s._CODE_CONSTANTS.ARCHIVED_DOCUMENTS_PERSISTENCE_NAME));
      return retVal;//.map(s.findByShipment);
    }

    saveArchiveDocumentsToPersistence(archivedDocs) {
      var s = this;
      let persisteneceObject = new Array();
      persisteneceObject[s._conditioningService.condition(s._shipDtls.proNbr)] = archivedDocs;
      s._persistenceService.insert(s._CODE_CONSTANTS.ARCHIVED_DOCUMENTS_PERSISTENCE_NAME, persisteneceObject);

    }

    findByShipment(obj) {
      var s = this;

      if (obj != undefined && obj[s._shipDtls.proNbr] != undefined) {
        return obj[s._shipDtls.proNbr];
      }
      return undefined;
    }

    /**
     * Fetch the archived docs and group them into an array of arrays for the UI
     * @return {[type]} [description]
     */
    getArchivedDocuments() {
      var s = this;
      s._$scope.documents = [];

      var pro = s._conditioningService.condition(this._$stateParams.proNbr);
      var stream = s.getPersistedArchiveDocuments();
      stream.subscribe((obj)=> {

        if (obj == undefined || obj[pro] == undefined) {
          s._$scope.documentsLoading = true;
          s._$scope.documentsErrorMessage = "";
          s._$scope.$apply()
          s._archivedDocs = s._documentService
            .listDocuments(pro);
          //.do(() => {
          //  s._$scope.documentsLoading = true;
          //  s._$scope.$apply()
          //}).delay(100);

          s._archivedDocs.subscribe(
            (a) => {
              Rx.Observable
                .from(a)
                .map((item)=> {
                  if (item != undefined) {
                    item = item.filter((arrayItem, index) => {
                      let docDate = moment(arrayItem.localDisplayTimeDate);
                      let today = moment();
                      let timeDiff = moment.duration(today.diff(docDate));
                      return timeDiff.asWeeks() <= 3;
                    });
                  }
                  return item;
                })
                .filter((item)=>item != undefined && item.length > 0)
                .subscribe(
                  (item)=>
                    s._$scope.documents.push(item),
                  ()=> {
                    s._$scope.documentsLoading = false
                    s._$scope.$apply();
                  },
                  ()=> {
                    if (s._$scope.documents != undefined && s._$scope.documents.length > 0) {
                      s.saveArchiveDocumentsToPersistence(s._$scope.documents);
                    }
                    s._$scope.documentsLoading = false
                    s._$scope.$apply();
                  }
                )
            }
            ,
            (e) => {
              s._$scope.documentsLoading = false
              s._$rootScope.toast("System error. Please contact support.", 5);
              s._$scope.documentsErrorMessage = "Currently unable to load image(s).  Please try again later.";
              s._$scope.$apply();
            })

        }
        else {
          if (obj[pro] != undefined && obj[pro].length > 0) {
            Rx.Observable.from(obj[pro])
              .filter((item)=>item != undefined)
              .subscribe(
                (item)=>s._$scope.documents.push(item),
                ()=> {
                  s._$scope.documents = [];
                  s._$scope.documentsErrorMessage = "";
                  s._$scope.documentsLoading = false
                  s._$scope.$apply()
                },
                ()=> {
                  s._$scope.documentsErrorMessage = "";
                  s._$scope.documentsLoading = false
                  s._$scope.$apply()
                }
              );
          } else {
            s._$scope.documents = [];
            s._$scope.documentsErrorMessage = "";
            s._$scope.documentsLoading = false
            s._$scope.$apply()
          }
        }

      });
      return stream;
    }

    /**
     * Returns true if ANY of the buttons in the overview pane should display
     */
    isShowingOverviewButtons() {
      var vm = this;
      return vm._prevInspectionStatus == vm._STATUS_INSPECTED || (vm._prevInspectionStatus.length > 0 && vm._STATUS_CORRECTED.includes(vm._prevInspectionStatus));
    }

    displayErrorContent(contentSection) {
      if (contentSection === undefined) {
        return (this.shipmentDetailsLoading == false && angular.equals(this._shipDtls, {}));
      } else if (contentSection === "prevInspection") {
        return (angular.equals(this._shipDtls, {}) && this._prevInspectionDetails === undefined);
      } else if (contentSection === "location") {
        return (this._$scope.locationAndMovementLoading == false && angular.equals(this._shipLocDtls, {}));
      }
    }

    displayPreviousCorrection() {
      var vm = this;
      return vm._prevInspectionStatus.length > 0 && vm._STATUS_CORRECTED.includes(vm._prevInspectionStatus);
    }

    displayPreviousInspection() {
      return this.isShowingOverviewButtons();
    }
  }
  ngModule.controller(controllerName, shipmentDetailsController);
};
