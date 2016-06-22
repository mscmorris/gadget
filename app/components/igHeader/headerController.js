export default ngModule => {

  var controllerName = 'igHeaderController';

  class igHeaderController {
    /* @ngInject */
    constructor($rootScope, $scope, $state, $log, $mdDialog, $mdSidenav, $timeout, inspectionService, navigationService,
        CODE_CONSTANTS) {
      this.$rootScope=$rootScope;
      this.$scope=$scope;
      this.$state=$state;
      this._$log=$log;
      this.$mdDialog=$mdDialog;
      this.$mdSidenav=$mdSidenav;
      this.$timeout=$timeout;
      this.inspectionService = inspectionService;
      this.navigationService=navigationService;
      this.CODE_CONSTANTS = CODE_CONSTANTS;
      this.headerClassList = [];
      this.headerClassList.push("toolbar-" + $state.current.data.toolbarClass);
      this.isRootState = this.isRootState();
      this.inspectionContext = this.inspectionService.getInspectionContext();
      this.sicChanger={"selectSIC":"","shiftSelected":""};
      this.availshifts=[];
    }

    showSicChanger(ev) {
      var vm = this;
      vm.$mdDialog.show({
        controller: 'igHeaderController as igH',
        templateUrl: 'components/igHeader/sicChange.html',
        parent: angular.element(document.body),
        clickOutsideToClose:true,
        targetEvent: ev,
      }).then ((sicChanger)=> {

        if(sicChanger.selectSIC && sicChanger.shiftSelected) {
          vm.sicChanger = sicChanger;
          vm._$log.debug("SICChangerCall " + vm.sicChanger.selectSIC + "  " + vm.sicChanger.shiftSelected);
          if (vm.sicChanger.selectSIC && vm.sicChanger.selectSIC.toUpperCase() != vm.inspectionContext.inspectionSIC) {
            vm.inspectionContext.inspectionSIC = vm.sicChanger.selectSIC.toUpperCase();
            vm.inspectionContext.shiftCd = vm.sicChanger.shiftSelected;
            vm._$log.debug('BroadCasting sicChanged');
            vm.$rootScope.$broadcast('sicChanged', vm.inspectionContext);
          } else {
            vm._$log.debug('BroadCasting shiftChanged');
            vm.inspectionContext.shiftCd = vm.sicChanger.shiftSelected;
            vm.$rootScope.$broadcast('shiftChanged', vm.inspectionContext);

          }
        }
      });
    }

    onSubmitDialog(sicChanger) {
        var vm = this;
        vm.$mdDialog.hide(sicChanger);
    }

    loadShifts(){
      var vm = this;
      vm.availshifts = [];
      for(var shift in this.CODE_CONSTANTS.SHIFT_CODE) {
        vm.availshifts.push(this.CODE_CONSTANTS.SHIFT_CODE[shift]);
      }
    }

    toggleSideNav() {
      var vm = this;
      vm.$mdSidenav('nav').toggle();
    }

    isRootState() {
      var vm = this;
      if (vm.$state.current.data.rootState && vm.$state.current.data.rootState == true) {
        return true;
      } else {
        return false;
      }
    }

    prevState() {
      var vm = this;
      var prevState = vm.navigationService.popState();
      if(prevState) {
        vm.$state.go(prevState);
      }
    }
  }

  ngModule.controller('igHeaderController', igHeaderController);
}
