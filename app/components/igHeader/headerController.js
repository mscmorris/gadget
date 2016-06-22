export default ngModule => {

  var controllerName = 'igHeaderController';

  class igHeaderController {
    /* @ngInject */
    constructor($rootScope, $scope, $state, $log, $mdDialog, $mdSidenav, $timeout, inspectionService, navigationService,
        CODE_CONSTANTS, mappingService, $anchorScroll) {
      this.$rootScope = $rootScope;
      this.$scope = $scope;
      this.$state = $state;
      this._$log = $log;
      this.$mdDialog = $mdDialog;
      this.$mdSidenav = $mdSidenav;
      this.$timeout = $timeout;
      this.inspectionService = inspectionService;
      this.navigationService = navigationService;
      this.mappingService = mappingService;
      this.CODE_CONSTANTS = CODE_CONSTANTS;
      this.headerClassList = [];
      this.headerClassList.push("toolbar-" + $state.current.data.toolbarClass);
      this.isRootState = this.isRootState();
      this.inspectionContext = this.inspectionService.getInspectionContext();
      this.sicChanger = {"selectSIC":this.inspectionContext.inspectionSIC,"shiftSelected":this.inspectionContext.shiftCd};
      this.availshifts = [];
      this._invalidSic = false;
      this._disableSubmit = false;
      if ($anchorScroll.yOffset == undefined) {
        $timeout(function () {
          $anchorScroll.yOffset = angular.element("#ig-header")[0].clientHeight;
        });
      }
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

    validateSic(sic){
      var s = this;
      if(sic && sic.length==3) {
        s.inspectionService.validateSic(sic.toUpperCase())
        .then((response) => {
          if (response) {
            s._$log.debug(controllerName + "[validateSic]: Entered ValidSic "+ sic.toUpperCase());
            s._invalidSic = false;
            s._disableSubmit = false;
          } else {
            s._$log.debug(controllerName + "[validateSic]: Entered InvalidSic "+ sic.toUpperCase());
            s._invalidSic = true;
            s._disableSubmit = true;
          }
        },
          (error) => {
            if(error.status !== vm._CODE_CONSTANTS.NO_NETWORK_CONN) {
              vm.$rootScope.toast(error.data.message, 5);
            }
          })
      }else{
        s._invalidSic = false;
        s._disableSubmit = true;
      }

    }

    onSubmitDialog(sicChanger) {
        var vm = this;
        vm.$mdDialog.hide(sicChanger);
    }

    loadShifts(){
      var vm = this;
      vm.availshifts = [];
      Object.keys(this.CODE_CONSTANTS.SHIFT_CODE).forEach(shiftKey => {
        vm.availshifts.push(shiftKey);
      });
    }

    toggleSideNav() {
      var vm = this;
      vm.$mdSidenav('nav').toggle();
    }

    isRootState() {
      return this.navigationService.isRootState();
    }

    prevState() {
     this.navigationService.prevState();
    }

  }

  ngModule.controller('igHeaderController', igHeaderController);
}
