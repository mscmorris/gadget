import { shipments } from "./shipments";

var _ = require('lodash');

export default ngModule => {

  var controllerName = 'inspectionListController';

  class inspectionListController {
    /*@ngInject*/
    constructor($rootScope,$scope, $log,$state, $timeout,$resource,$window, $q, igUtils, inspectionService,
                userService, DTOptionsBuilder, DTColumnBuilder,persistenceService,mappingService)
    {
      // Constructor specific variables
      var vm = this;
      var COL_PREF_TITLE = "I-dtColumnsPref";
      // end constructor variables
      vm.$rootScope = $rootScope;
      vm.$scope = $scope;
      vm._$log = $log;
      vm.$state = $state;
      vm.$timeout = $timeout;
      vm.$resource = $resource;
      vm.inspectionService=inspectionService;
      vm.persistenceService=persistenceService;
      vm.inspectionContext = vm.inspectionService.getInspectionContext();
      vm.insRefreshTimeStmp =vm.inspectionService.getRefreshTimeStmp();
      vm.DTOptionsBuilder = DTOptionsBuilder;
      vm.DTColumnBuilder = DTColumnBuilder;
      vm.shipments = shipments;
      vm.inspectionShipments = vm.inspectionShipmentsList();
      vm.selectedShipments = [];
      vm.listCount="0";
      vm.dtInstance = {};
      vm.dtOptions = {};
      vm.$q=$q;
      vm.mappingService = mappingService;
      //vm.dtColumns = persistenceService.find(COL_PREF_TITLE);
      //persistenceService.find(COL_PREF_TITLE).then((data) => {
      //  vm.slipListItems = vm.getColumnSettingsList(angular.fromJson(data));
      //});
      vm.dtColumns = igUtils.getPreference("I-dtColumnsPref").then((value) => {
          var defer = $q.defer();
          defer.resolve(vm.getDefaultListCols(angular.fromJson(value)));
          return defer.promise;
      },
      (error) => {
        return vm.$resource('data/dtColumns.json').query().$promise.then(function(d) {
          return vm.getDefaultListCols(d);
        });
      });


      vm.toggleVis = function(idx, visible) {
        var vm = this;
        vm._$log.debug("Toggle column visibility for column:"+idx + " to visible:"+visible);
        vm.dtInstance.dataTable.fnSetColumnVis(idx, visible);

      }

      /*triggers on ShiftChange */
      vm.$scope.$on('shiftChanged',($event, inspectionContext) => {
        vm.inspectionShipments=vm.enrichInspectionShipmentsList();
        vm.reloadData();
      });

      /*triggers on SICChange */
      vm.$scope.$on('sicChanged',($event, inspectionContext) => {
        vm.persistenceService.delete("PRO");
        vm.inspectionShipments = vm.inspectionShipmentsList();
        vm.reloadData();
      });

      vm.dtOptions = vm.loadData();

    } //end constructor

    selectAllShipments () {
      var vm = this;
      var tableRows = angular.element("#grid tbody > tr");

      angular.forEach(tableRows,(row,idx)=>{
        vm.$timeout(() => {
          if(!angular.element(row).hasClass("row-selected")) {
            row.click();
          }
        }, 100, false);
      });
    }

    deSelectAllShipments () {
      var vm = this;
      var tableRows = angular.element("#grid tbody > tr");

      angular.forEach(tableRows,(row,idx)=>{
        vm.$timeout(() => {
          if(angular.element(row).hasClass("row-selected")) {
            $(row).toggleClass("row-selected");
          }

        }, 100, false);
      });
      vm.selectedShipments=[];
    }

    loadData() {
      var vm = this;
      return vm.DTOptionsBuilder
        .fromFnPromise(function () {
          return vm.inspectionShipments;
        })
        .withOption('paging', false)
        .withOption('searching', false)
        .withOption('info', false)
        .withOption('fixedHeader', true)
        .withOption('autoWidth', true)
        .withOption('rowCallback', function (nRow, aData) {
          vm._$log.debug("In rowCallback");
          // Unbind first in order to avoid any duplicate handler (see https://github.com/l-lin/angular-datatables/issues/87)
          //open details on double
          $(nRow).unbind('dblclick');
          $(nRow).dblclick(function () {
            vm.$scope.$apply(function () {
              vm.openShipmentDetails(aData);
            });
          });

          //select row on single click
          $(nRow).unbind('click');
          $(nRow).click(function () {
            vm.$scope.$apply(function () {
              vm.selectRow(nRow, aData);
            });
          });

        })
        .withColVis()
        .withColVisStateChange(function (iColumn, bVisible) {
          vm._$log.debug("iColumn: " + iColumn);
          vm._$log.debug("bVisible: " + bVisible);

        })
        .withColVisOption()
        .withColReorder()
        .withColReorderCallback(function () {
          vm._$log.debug('Columns order has been changed with: ' + this.fnOrder());
          //update sliplist with the new order
          let order = this.fnOrder();
          let originalIndex = this.s.mouse.targetIndex;
          let spliceIndex = this.s.mouse.toIndex;

          vm._$log.debug(`calling reorder with originalIndex:${originalIndex} and spliceIndex:${spliceIndex}`);
          vm.reorder(spliceIndex, originalIndex, false);

        });
    }

    reloadData() {
      var vm = this;
      vm.dtInstance.reloadData(vm.inspectionShipments);
    }

    loadDefaultColPrefs() {
      var vm = this;
      vm.dtColumns = vm.$resource('data/dtColumns.json').query().$promise;
      vm.$resource('data/dtColumns.json').query().$promise.then(function(d) {
        vm.slipListItems = vm.getDefaultListCols(d);
      });
    }

    openShipmentDetails(aData)
    {
      var vm = this;
      vm._$log.debug("Opening shipment details");
      vm.inspectionService.setCurrInspection(aData);
      vm.$state.go('shipmentDetails');
    }

    inspectionShipmentsList() {
      var vm = this;
      var insShmList=[];
      return vm.persistenceService.find("PRO")
        .then(response=>{
          if(!response) {
            return vm.inspectionService.listInspectionShipments(vm.inspectionContext)
              .then(response => {
                vm._$log.debug(controllerName + "[inspectionShipmentsList]: LISTINSPECTIONSHIPMENTS call complete!");
                vm.insRefreshTimeStmp = vm.inspectionService.setRefreshTimeStmp("Inspection");
                if(response.data.inspectionShipment)
                {
                  insShmList = response.data.inspectionShipment;
                  vm.listCount = insShmList.length;
                  var idbProList = [];
                  angular.forEach(insShmList, (insShm, index) => {
                    idbProList.push(insShm.proNbr);
                  });
                  vm.persistenceService.insert("PRO", idbProList);

                  return vm.transInspectionShipmentsList(response.data.inspectionShipment);
                }

                var defered = vm.$q.defer();
                defered.resolve(true);
                vm.inspectionShipments = defered.promise;
                return vm.inspectionShipments;

              }, error => {
                vm.$rootScope.toast("System error. Please contact support.", 5);
                vm._$log.error(controllerName + "[inspectionShipmentsList]: LISTINSPECTIONSHIPMENTS call failed!");
                return [];
              });
          }else {
            return vm.enrichInspectionShipmentsList();
          }
          },error => {
          vm._$log.error(controllerName + "FAILED to getDataByKey from IndexDB");
        });

    }

    selectRow(nRow, aData) {
      var vm = this;
      // toggle CSS styling
      $(nRow).toggleClass('row-selected');
      // Determine if row should be added or removed from selected shipments list
      var matchFound = false;
      var matchIndex = -1;
      for(var i = 0; i < vm.selectedShipments.length; i++) {
        var data = vm.selectedShipments[i];
        if(data.proNbr == aData.proNbr) {
          matchFound = true;
          matchIndex = i;
          break;
        }
      }
      if(matchFound && matchIndex >= 0) {
        vm.selectedShipments.splice(matchIndex,1);
      } else {
        vm.selectedShipments.push(aData);
      }
    }

    enrichInspectionShipmentsList() {
      var vm = this;
      return vm.persistenceService.find("PRO")
      .then(response=>{
          return vm.inspectionService.listInspectionShipmentsForShiftChange(response)
        .then(response => {
          vm._$log.debug(controllerName + "[enrichInspectionShipmentsList]: call complete!");
          vm.listCount = response.data.inspectionShipment.length;
          return vm.transInspectionShipmentsList(response.data.inspectionShipment);

        }, error => {
          vm.$rootScope.toast("System error. Please contact support.", 5);
          vm._$log.error(controllerName + "[enrichInspectionShipmentsList]: call failed!");
        });
      },error=>{vm._$log.error(controllerName + "FAILED to getDataByKey from persistenceService");});

    }

    refreshInspectionShipmentsList() {
      var vm = this;
      return vm.persistenceService.delete("PRO")

        .then(response=>{
          vm.inspectionShipments= vm.inspectionShipmentsList();
          vm.reloadData();
        },error=>{vm._$log.error(controllerName + "FAILED to Delete row from IndexDB");});

    }

    setInspectionStatus(status, notifyMsg) {
      var vm = this;
      var selProNbrs = [];
      var req = {};
      angular.forEach(vm.selectedShipments,(shm,idx)=>{selProNbrs.push(shm.proNbr)});
      req["inspectionContext"]=vm.inspectionContext;
      req["actionCd"]=status;
      req["alertProNbr"]=selProNbrs;
      vm.selectedShipments=[];
      return vm.inspectionService.setInspectionStatus(req)
      .then(response=>{
          if(typeof notifyMsg !== 'undefined' && notifyMsg !== "") {
            this.$rootScope.toast(notifyMsg, 5);
          }
          vm.persistenceService.find("PRO")
          .then (response => {
            var persistedPros = response;
            angular.forEach(selProNbrs,(pro,idx)=>
            {
              if(persistedPros.indexOf(pro)!= -1)
              {
                persistedPros.splice(persistedPros.indexOf(pro),1);
              }
            });
            vm.reloadListOnStatusChange(persistedPros);
          });
      },error=>{vm.$log.error(controllerName + "[setInspectionStatus]: SETINSPECTIONSTATUS call failed!");});

    }

    reloadListOnStatusChange(persistedPros) {
      var vm = this;
      vm.persistenceService.delete("PRO")
        .then(response => {
          if (persistedPros.length == 0) {
            var defered = vm.$q.defer();
            defered.resolve(true);
            vm.listCount=0;
            vm.inspectionShipments = defered.promise;
            vm.reloadData();
          } else {
            vm.persistenceService.insert("PRO", persistedPros)
              .then(response => {
                vm.inspectionShipments = vm.enrichInspectionShipmentsList();
                vm.reloadData();
              });
          }
        });
    }

    dtInstanceCallback(dtInstance)
    {
      var vm = this;
      vm._$log.debug(dtInstance);
      vm.d = dtInstance;

    }

    ///begin open menu that prevents close
    ///see https://github.com/angular/material/issues/4334, @clshortfuse workaround
    openMenu($mdOpenMenu, $event)
    {
      //todo:might think about making this an attribute directive
      var vm = this;
      vm._$log.debug("Inside openMenu...");
      var menu = $mdOpenMenu($event);
      vm.$timeout(function() {
        var menuContent = document.getElementById('tbar-menu-content');

        function hasAnyAttribute(target, attrs) {
          if (!target) return false;
          for (var i = 0, attr; attr = attrs[i]; ++i) {
            var altForms = [attr, "data-" + attr, "x-" + attr];
            for (var j = 0, rawAttr; rawAttr = altForms[j]; ++j) {
              if (target.hasAttribute(rawAttr)) {
                return true;
              }
            }
          }
          return false;
        }

        function getClosest(el, tagName, onlyParent) {
          if (el instanceof angular.element) el = el[0];
          tagName = tagName.toUpperCase();
          if (onlyParent) el = el.parentNode;
          if (!el) return null;
          do {
            if (el.nodeName === tagName) {
              return el;
            }
          } while (el = el.parentNode);
          return null;
        }

        menuContent.parentElement.addEventListener('click', function(e) {
          var target = e.target;
          do {
            if (target === menuContent) return;
            if (hasAnyAttribute(target, ["ng-click", "ng-href", "ui-sref"]) || target.nodeName == "BUTTON" || target.nodeName == "MD-BUTTON") {
              var closestMenu = getClosest(target, "MD-MENU");
              if (!target.hasAttribute("disabled") && (!closestMenu || closestMenu == opts.parent[0])) {
                if (target.hasAttribute("md-menu-disable-close")) {
                  event.stopPropagation();
                  angular.element(target).triggerHandler('click');
                }
                return; //let it propagate
              }
              break;
            }
          } while (target = target.parentNode);
        }, true);
      });
    }
    ///end open menu

    getDefaultListCols(cols) {
      //_.pluck(cols, 'title'
      var list = [];
      cols.forEach(function (e, i, a) {
        list.push({"title" : e.title, "data" : e.data, "visible" : e.visible !== undefined ? e.visible : true, "idx" : i, "reorder" : false});
      });
      return list;
    }

    transInspectionShipmentsList(inspectionShipmentList){
      var vm = this;
      var transInspectionShipmentsList = [];
      angular.forEach(inspectionShipmentList,(inspection,idx)=> {
        if(typeof inspection["inspectionStatusCd"] !== 'undefined' && inspection["inspectionStatusCd"]!== null && inspection["inspectionStatusCd"]!== ""){
          inspection["inspectionStatusCd"] = vm.mappingService.transInspCodeToStatus(inspection["inspectionStatusCd"]);
          transInspectionShipmentsList.push(vm.mappingService.mapInspectionShipments(inspection));
        }
      });
      return transInspectionShipmentsList;
    }

  }

  ngModule.controller(controllerName, inspectionListController);

}
