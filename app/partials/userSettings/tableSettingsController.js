export default ngModule => {
  var controllerName = 'tableSettingsController';

  class tableSettingsController {
    /*@ngInject*/
    constructor($scope, $log, $resource, $state, igUtils, dialogService, CODE_CONSTANTS) {
      // Angular Module Deps
      this._$scope = $scope;
      this._$log = $log;
      this._$state = $state;
      this._$resource = $resource;
      this._igUtils = igUtils;
      this._dialogService = dialogService;
      this._CODE_CONSTANTS = CODE_CONSTANTS;

      igUtils.getPreference(this._CODE_CONSTANTS.PREFERENCES.LIST_I).then((value) => {
          this._columnList = this.buildColumnList(angular.fromJson(value));
        },
        (error) => {
          $resource('data/dtColumns.json').query().$promise.then((d) => {
            this._columnList = this.buildColumnList(d);
          });
        });

      /**
       * Saves table settings preferences to SQLite on state change
       */
      this._$state.current.onExit = () => {
        var vm = this;
        var serializedColData = angular.toJson(vm._columnList);
        igUtils.setPreference(this._CODE_CONSTANTS.PREFERENCES.LIST_I, serializedColData).then(
          () => {
            // setting preference was successful
          },
          () => {
            vm._$log.debug(controllerName + "[onExit]: external function SetPreference not found. Column Settings were not saved.");
          }
        );
      };
    }

    restorePreference(prefName) {
      this._igUtils.deletePreference(prefName);
      this._igUtils.getPreference(prefName).then((value) => {
          this._columnList = this.buildColumnList(angular.fromJson(value));
        },
        (error) => {
          this._$resource('data/dtColumns.json').query().$promise.then((d) => {
            this._columnList = this.buildColumnList(d);
          });
        });
      this._dialogService.alert(this._dialogService.buildDialogBindings({"dialogTitle":"Settings", "dialogContent":"The settings have been restored to their default state."}));
    }

    buildColumnList(cols) {
      //_.pluck(cols, 'title'
      var list = [];
      cols.forEach(function (e, i, a) {
        list.push({"title" : e.title, "data" : e.data, "visible" : e.visible !== undefined ? e.visible : true, "idx" : i, "reorder" : false});
      });
      return list;
    }

    //<editor-fold desc="Table Menu Functions">
    afterSwipe(e, itemIndex)
    {
      var vm = this;
      vm._$log.debug("Slip after swipe");
      vm._columnList.splice(itemIndex, 1);

    }

    toggleGridCol($event, clickedItem)
    {
      var vm = this;
      vm._$log.debug("Toggle grid column");
      clickedItem.visible = !clickedItem.visible;

    }

    toggleReorderBtns($event, clickedItem)
    {
      var vm = this;
      vm._$log.debug("Toggle reorder buttons");
      clickedItem.reorder = !clickedItem.reorder;

    }

    reorderUp($event, clickedItem)
    {
      var vm = this;
      vm._$log.debug("Reorder up");
      let idx = _.indexOf(vm._columnList, clickedItem);

      if (0 !== idx) {
        vm.reorder(idx - 1, idx);
      }
      clickedItem.reorder = !clickedItem.reorder;

    }

    reorderDown($event, clickedItem)
    {
      var vm = this;
      vm._$log.debug("Reorder down");

      let idx = _.indexOf(vm._columnList, clickedItem);
      if (vm._columnList.length - 1 !== idx) {
        vm.reorder(idx + 1, idx);
      }
      clickedItem.reorder = !clickedItem.reorder;

    }

    //to and from indexes are handled in reorderUp and reorderDown
    reorder($event, spliceIndex, originalIndex)
    {
      var vm = this;
      var listItem = vm._columnList[originalIndex];
      vm._columnList.splice(originalIndex, 1);
      vm._columnList.splice(spliceIndex, 0, listItem);
    }
    //</editor-fold>

  }

  ngModule.controller(controllerName, tableSettingsController);
};
