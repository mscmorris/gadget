(function () {
  'use strict';

  let MINIMUM_CONTAINER_VERSION = "1.20.X";

  //const angular = require('angular');

  var _ = require('lodash');
  require('angular-material');
  require('angular-ui-router');
  require('angular-touch');
  require('angular-messages');
  require('angular-animate');
  require('angular-aria');
  require('angular-resource');
  require('angular-sanitize');
  require('angular-spinners')
  require('angular-material-icons');
  require('babel-core/external-helpers.js');
  //require('angular-data-table/release/dataTable.cjs.js');
  require('slipjs');
  require('angular-slip');
  require('jquery-sticky');
  require('./components/shared/soapRx/soap.js')
  require('./components/shared/conditioning/conditioningService.js')
  require('./components/shared/validation/validationService.js')
  require('./components/shared/dimensions/dimensionService.js');
  require('./config/ngConstants.js');
  require('rx-angular')
  require('./components/shared/listServices/listServices.js')
  require('./components/shared/autoSave/autoSave.js')
  require('./components/xpo/directives.js')
  require("./filters/xpo-filters.js")
  require('./components/shared/twm/twm.js')
  require('./background/services.js')
  require('angular-uuid');
  let httpInterceptor = require('./config/interceptors/httpInterceptor.js');
  let appConfig = require('./config/appConfig.js');

  const ngModule = angular.module('igApp', ['ui.router', 'ngMaterial', 'ngMdIcons', 'ngResource', 'ngSanitize',
      'ngMessages', 'ngAria', 'slip', 'igApp.constants', 'datatables', 'datatables.colreorder', 'datatables.colvis', 'angularSpinners',
      'conditioningService', 'validationService', 'xpoDirectives', 'inspectionAutoSave', 'xpoCustomFilters', 'xpoAngularSoap', 'dimensionService',
      'angular-uuid', 'twmPhotoUploadService', 'twmService','igApp.backgroundServices', 'rx', 'planningListService', 'inspectionListService']);



  ngModule.factory('httpLoggingInterceptor', httpInterceptor);

  /* @ngInject */
  ngModule
    .config(appConfig);

    /* @ngInject */
    ngModule.run( ($log, $rootScope, $http, $mdToast, $window, $state, $resource, $q, igUtils, userService,inspectionService,
     persistenceService, navigationService, dialogService) => {
      $log.debug("Running angular module ngModule");
      //set the version number to be used from the container app
      $http.get("./package.json").success(function(data){$window.version = data.version;});
      igUtils.getAppVersionInformation().then((vInfo) => {
        let dialogArgs = {
          "dialogTitle" : "Update Application",
          "dialogContent" : `Your version of the Inspection application must be updated before you can proceed.
                             Please contact the Help Desk for assistance in getting the latest version.`
        };
        let locals = dialogService.buildDialogBindings(dialogArgs);
        let currVersions = vInfo[0].Version.split(".");
        let minVersions = MINIMUM_CONTAINER_VERSION.split(".");
        let versionIsInvalid = (currVersion, minVersion) => { return parseInt(currVersion, 10) < parseInt(minVersion, 10) };

        if(versionIsInvalid(currVersions[0], minVersions[0]) || versionIsInvalid(currVersions[1], minVersions[1])
            || (!isNaN(parseInt(minVersions[2]), 10) && versionIsInvalid(currVersions[2], minVersions[2]))) {
          $log.error(`Unsupported container version detected. Shutting down the application.`);
          dialogService.alert(locals, $rootScope.closeApplication)
        }
      });

      // Add any listeners that apply regardless of application state
      //TODO: THIS WILL NEED TO CHANGE TO REGISTERSHELLEXCEPTIONLISTENER WITH A PROMISE.
      $rootScope.$on('shellException', (event, data) => {
        var exception = angular.fromJson(data);
        if(exception.ClassName && exception.Message) {
          $log.error(exception.ClassName + ": " + exception.Message);
        }
        $rootScope.toast(exception.Message, 4);
      });


      $rootScope.$on('$stateChangeSuccess', (event,toState,toParams,fromState,fromParams) => {
        navigationService.pushState(toState,toParams,fromState,fromParams);
        if (toState.data != undefined && toState.data.rootState == true){
          persistenceService.clearCollapsibleState();
          inspectionService.setCurrentInspection({});
          inspectionService.setCurrentShipment({});
        }
      });

      $rootScope.$on('$stateNotFound',(event, unfoundState, fromState, fromParams) => {
        navigationService.defaultState();
      });
      // end listeners




      /**
       * Displays a toast message to the user in the top right corner of the screen
       * @param msg The message to be displayed
       * @param duration The length of time in seconds that the message will display
       */
      $rootScope.toast = (msg, duration = 3) => {
        var _duration = duration * 1000;
        $mdToast.show(
          $mdToast.simple()
            .content(msg)
            .position("top right")
            .hideDelay(_duration)
            .parent(".ig-header-wrapper")
        );
      };

      $rootScope.closeApplication = function(event) {
        $log.info("Closing application");
        if (igUtils.isExternalFunc('closeApplication')) {
          container.closeApplication();
        }
        //$window.external.CloseApplication();
      };

      userService.getDomainUser()
        .then((userCred) => {
          // Inside of container app
          userService.getUserDetails(userCred.Domain,userCred.Username)
            .then(() =>{
                navigationService.defaultState();
              }
              ,(error) => {
                $log.error("No user Details Found");
              });
        }, () => {
          // Outside of container app
          userService.getUserDetails("conway","cse.inspector")
            .then(() =>{
                navigationService.defaultState();
              }
              ,(error) => {
                $log.error("No user Details Found");
              });
        });
    });

    ngModule.filter('trustedUrl', function ($sce) {
      return function(url) {
        return $sce.trustAsResourceUrl(url);
      };
    });

    require('./components/igCollapsible')(ngModule);
    require('./components/igGalleryImage')(ngModule);
    require('./components/igHeader')(ngModule);
    require('./components/igNotifyOnLoad')(ngModule);
    require('./components/igNetworkDisconnected')(ngModule);
    require('./components/dimensionRow')(ngModule);
    require('./components/manifestItem')(ngModule);
    require('./components/shared/camera')(ngModule);
    require('./components/shared/igUtils')(ngModule);
    require('./components/shared/inspection')(ngModule);
    require('./components/shared/soapRx')(ngModule)
    require('./components/shared/document')(ngModule)
    require('./components/shared/user')(ngModule);
    require('./components/shared/logging')(ngModule);
    require('./components/shared/shipmentDetails')(ngModule);
    require('./components/shared/shipmentAction')(ngModule);
    require('./components/igActionMenu')(ngModule);
    require('./components/virtualKeyboardControl')(ngModule)
    require('./partials/shipmentDetails')(ngModule);
    require('./partials/inspectionInProgress')(ngModule);
    require('./partials/inspectionList')(ngModule);
    require('./partials/userSettings')(ngModule);
    require('./partials/lookup')(ngModule);
    require('./partials/viewArchiveDoc')(ngModule);
    require('./partials/nav')(ngModule);
    require('./partials/dialogs')(ngModule);
    require('./partials/manifestDetails')(ngModule);
    require('./partials/addPro')(ngModule);
    require('./partials/feedback')(ngModule);


})();
