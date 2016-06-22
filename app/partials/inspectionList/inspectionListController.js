
var moment = require('moment-timezone');
var _ = require('lodash');

export default ngModule => {

  var controllerName = 'inspectionListController';

  class inspectionListController {
    /*@ngInject*/
    constructor($rootScope,$scope, $log,$state, $stateParams, $timeout,$resource,$window, $q, $filter,igUtils, inspectionService,
                DTOptionsBuilder, DTColumnBuilder,persistenceService,mappingService,conditioningService, CODE_CONSTANTS,
                shipmentActionService)
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
      vm.$filter = $filter;
      vm.inspectionService=inspectionService;
      vm.persistenceService=persistenceService;
      vm._CODE_CONSTANTS = CODE_CONSTANTS;
      vm._shipmentActionService = shipmentActionService;
      vm.inspectionContext = vm.inspectionService.getInspectionContext();
      vm.insRefreshTimeStmp =vm.inspectionService.getRefreshTimeStmp();
      vm.DTOptionsBuilder = DTOptionsBuilder;
      vm.DTColumnBuilder = DTColumnBuilder;
      vm.inspectionShipments = vm.inspectionShipmentsList();
      vm.selectedShipments = [];
      vm.listCount="0";
      vm.dtInstance = {};
      vm.dtOptions = {};
      vm.$q=$q;
      vm.mappingService = mappingService;
      vm.conditioningService = conditioningService;
      vm.defaultSortIndex = 0;

      vm.inspectionService.setCurrentInspection(undefined);
      vm.inspectionService.setCurrentShipment(undefined);


      vm.dtColumns = igUtils.getPreference(vm._CODE_CONSTANTS.PREFERENCES.LIST_I).then((value) => {
          var defer = $q.defer();
          defer.resolve(vm.getDefaultListCols(angular.fromJson(value)));
          return defer.promise;
      },
      (error) => {
        return vm.$resource('data/inspectionColumns.json').query().$promise.then(function(d) {
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

      /* reload table for new display orientation */
      angular.element($window).bind('orientationchange resize', (e) => {
        if(vm.dtInstance && vm.dtInstance.DataTable) {
          $timeout(() => {
            vm.reloadData();
          }, 50);
        }
      });

      vm.$scope.$on('$destroy', (e) => {
        angular.element($window).off('orientationchange resize');
      });

      /**
       * Destroys the datatable on state change to prevent memory leaks
       */
      this.$state.current.onExit = () => {
        if(vm.dtInstance != undefined) {
          vm.dtInstance.DataTable.destroy();
        }
      };
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
      vm.insRefreshTimeStmp = vm.inspectionService.setRefreshTimeStmp("Inspection");
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

          var isUrgent = aData.location.match(/^[1-4]{1}/)
          if(isUrgent !== null) {
            $(nRow).addClass("urgent")
          }
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
        .withOption('initComplete', function() {
          angular.element(".ig-data-table").DataTable().order([vm.defaultSortIndex, "asc"]).draw();
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
      vm.insRefreshTimeStmp = vm.inspectionService.setRefreshTimeStmp("Inspection");
      vm.dtInstance.reloadData();
    }

    loadDefaultColPrefs() {
      var vm = this;
      vm.dtColumns = vm.$resource('data/inspectionColumns.json').query().$promise;
      vm.$resource('data/inspectionColumns.json').query().$promise.then(function(d) {
        vm.slipListItems = vm.getDefaultListCols(d);
      });
    }

    openShipmentDetails(aData)
    {
      var vm = this;
      vm._$log.debug("Opening shipment details");
      vm.$state.go('shipmentDetails',{proNbr : aData.proNbr});
    }

    inspectionShipmentsList() {
      var vm = this;
      var insShmList=[];
      vm.listCount = 0;
      return vm.persistenceService.find("PRO")
        .then(response=>{
          if(!response) {
            return vm.inspectionService.listInspectionShipments(vm.inspectionContext)
              .then(response => {
                vm._$log.debug(controllerName + "[inspectionShipmentsList]: LISTINSPECTIONSHIPMENTS call complete!");
                if(response.data.inspectionShipment)
                {
                  insShmList = response.data.inspectionShipment;
                  vm.listCount = insShmList.length;
                  var idbProList = [];
                  angular.forEach(insShmList, (insShm, index) => {
                    idbProList.push(vm.conditioningService.condition(insShm.proNbr));
                  });
                  vm.persistenceService.insert("PRO", idbProList);

                  return vm.transInspectionShipmentsList(response.data.inspectionShipment);
                }

                var defered = vm.$q.defer();
                defered.resolve(true);
                vm.inspectionShipments = defered.promise;
                return vm.inspectionShipments;

              }, error => {
                if(error.status !== vm._CODE_CONSTANTS.NO_NETWORK_CONN) {
                  vm.$rootScope.toast(error.data.message, 5);
                }
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
        if(response) {
          return vm.inspectionService.listInspectionShipments(response)
            .then(response => {
              vm._$log.debug(controllerName + "[enrichInspectionShipmentsList]: call complete!");
              vm.listCount = (response.data.inspectionShipment) ? response.data.inspectionShipment.length : 0;
              return vm.transInspectionShipmentsList(response.data.inspectionShipment);
            }, error => {
              if(error.status !== vm._CODE_CONSTANTS.NO_NETWORK_CONN) {
                vm.$rootScope.toast(error.data.message, 5);
              }
              vm._$log.error(controllerName + "[enrichInspectionShipmentsList]: call failed!");
              return [];
            });
        }
        else {
          return [];
        }
      },error=>{vm._$log.error(controllerName + "FAILED to getDataByKey from persistenceService");});
    }

    refreshInspectionShipmentsList() {
      var vm = this;
      return vm.persistenceService.delete("PRO")

        .then(response=>{
          vm.inspectionShipments= vm.inspectionShipmentsList();
          vm.reloadData();
          vm.$rootScope.toast(`Inspection list updated`, 2);
        },error=>{vm._$log.error(controllerName + "FAILED to Delete row from IndexDB");});

    }

    setInspectionStatus(status, notifyMsg) {
      var vm = this;
      if(vm.selectedShipments && vm.selectedShipments.length > 0) {
        var selProNbrs = [];
        angular.forEach(vm.selectedShipments,(shm,idx)=>{selProNbrs.push(shm.proNbr)});
        vm.selectedShipments=[];
        return vm._shipmentActionService.setInspectionStatus(status, notifyMsg, selProNbrs)
          .then(response=>{
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
      } else {
        vm.$rootScope.toast(`No shipments are selected.`, 2);
      }
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
      cols.forEach((e, i, a) => {
        if(e.data == "location") {
          this.defaultSortIndex = i;
        }
        list.push({"title" : e.title, "data" : e.data, "visible" : e.visible !== undefined ? e.visible : true, "idx" : i, "reorder" : false});
      });
      return list;
    }

    transInspectionShipmentsList(inspectionShipmentList){
      var vm = this;
      var transInspectionShipmentsList = [];
      var iStatusFilter = this.$filter('friendlyStatusCd');
      var proFilter = this.$filter('friendlyProNumber');
      angular.forEach(inspectionShipmentList,(inspection,idx)=> {
        if(typeof inspection["inspectionStatusCd"] !== 'undefined' && inspection["inspectionStatusCd"]!== null && inspection["inspectionStatusCd"]!== ""){
          inspection["inspectionStatusCd"] = iStatusFilter(inspection["inspectionStatusCd"]);
          inspection["proNbr"] = proFilter(inspection["proNbr"]);
          if(inspection["eta"] !== undefined && inspection["eta"] !== "") {
            /* Always use Pacific TZ because the server side is already applying the hours offset based on SIC location and the timestamp was stored using PST/PDT */
            inspection["eta"] = moment.tz(inspection["eta"], 'US/Pacific').format("MM/DD/YY HH:mm");
          }
          transInspectionShipmentsList.push(vm.mappingService.mapInspectionShipments(inspection));
        }
      });
      return transInspectionShipmentsList;
    }

    showActionMenu($mdOpenMenu){
      var vm  =this;
      if(vm.selectedShipments.length>0){
        $mdOpenMenu.call();
      }else{
        vm.$rootScope.toast(`No shipments are selected.`, 2);
      }
    }
  }

  ngModule.controller(controllerName, inspectionListController);

}
