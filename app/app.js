(function () {
  'use strict';

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
  require('angular-material-icons');
  require('babel-core/external-helpers.js');
  //require('angular-data-table/release/dataTable.cjs.js');
  require('slipjs');
  require('angular-slip');
  require('jquery-sticky');
  require('./config/ngConstants.js');
  require('./components/shared/twm/twmPhotoUploadService.js')
  require('./components/shared/twm/twmService.js')
  require('angular-uuid');
  //require('kaazing-web-socket');
  //require('kaazing-jms-client'); // browserify-shim import does not work - JmsClient.js creates a ByteOrder prototype variable that throws an error when imported as a browserify web component



  const ngModule = angular.module('igApp', ['ui.router', 'ngMaterial', 'ngMdIcons', 'ngResource', 'ngTouch', 'ngSanitize',
      'ngMessages', 'ngAria', 'slip', 'igApp.constants', 'datatables', 'datatables.colreorder', 'datatables.colvis', 'angular-uuid', 'twmPhotoUploadService', 'twmService']);

  function AppController /*@ngInject*/ ($rootScope, $scope, $log, $mdUtil, $mdDialog, $state, $timeout, inspectionService)
  {
    $log.info("Loaded AppController");

    $scope.submitPro = function(ev) {
      // Appending dialog to document.body to cover sidenav in docs app
      $mdDialog.show({
        controller :'AppController',
        templateUrl: 'partials/inspectionInProgress/submit.html',
        parent: angular.element(document.body),
        targetEvent: ev,
      }).then(function(answer) {
        $log.info("SubmitCall " + answer);
      });
    };

    $scope.movePro = function(ev) {
      // Appending dialog to document.body to cover sidenav in docs app
      $mdDialog.show({
        controller :'AppController',
        templateUrl: 'partials/inspectionInProgress/move.html',
        parent: angular.element(document.body),
        targetEvent: ev
      }).then(function(answer) {
        $log.info("MoveProCall " + answer);
      });
    };

     $scope.$on('userDetailsChanged', (userInfo) => {
      console.log('Listening');
      //vm.userInfo = vm.userService.getUserInfo();
      //vm._$log.info("userDetailsChanged" + vm.userInfo);
    });

    $scope.currInspection = inspectionService.getCurrInspection();

    //$scope.closeDialog = function(answer) {
    //  $mdDialog.hide(answer);
    //}





    $scope.prevInspections = require("./utils/prev_inspects_proto_list");


  } //end AppController

  ngModule
    .config(function($stateProvider, $urlRouterProvider, $locationProvider, $logProvider,$httpProvider) {
        $locationProvider.html5Mode(true);
        $logProvider.debugEnabled(true); //false to prevent _$log.debug output
        $httpProvider.defaults.useXDomain = true;

        //
        // For any unmatched url, redirect to /inspection
        $urlRouterProvider.otherwise("");
        // Now set up the states
        $stateProvider
          .state('list', {
            url: '/inspectionList',
            views: {
              '': {
                templateUrl: 'partials/inspectionList/index.html',
                controller: 'inspectionListController as vm'
              },
              'grid@list': {
                templateUrl: 'partials/inspectionList/grid.html'
              }
            },
            data: {
                toolbarClass: "inspect",
                rootState: true
            }
          })
          .state('shipmentDetails', {
            url: '/shipmentDetails',
            views: {
              '': {
                templateUrl: 'partials/shipmentDetails/index.html',
                controller: 'shipmentDetailsController as vm'
              }
            },
            data: {
                toolbarClass: "inspect"
            }
          })
          .state('inspectionInProgress', {
            url: '/inspectionInProgress',
            views: {
              '': {
                templateUrl: 'partials/inspectionInProgress/index.html',
                controller: 'inspectionInProgressController as vm'
              }
            },
            data: {
                toolbarClass: "inspect"
            }
          })
          .state('viewPhoto', {
          url: '/viewPhoto',
          views: {
            '': {
              templateUrl: 'partials/viewPhoto/index.html',
              controller: 'viewPhotoController as vm'
            }
          },
          data: {
            toolbarClass: "viewphoto"
          }
        })
        .state('tableSettings', {
          url: '/tableSettings',
          views: {
            '': {
              templateUrl: 'partials/userSettings/tableSettings.html',
              controller: 'tableSettingsController as vm'
            }
          },
          data: {
            toolbarClass: "inspect",
            rootState: true
          }
        })
        .state('lookup', {
          url: '/lookup',
          views: {
            '': {
              templateUrl: 'partials/lookup/index.html',
              controller: 'lookupController as vm'
            }
          },
          data: {
            toolbarClass: "inspect"
          }
        })
        .state('manifestDetails', {
          url: '/manifestDetails',
          views: {
            '': {
              templateUrl: 'partials/manifestDetails/index.html',
              controller: 'manifestDetailsController as vm'
            }
          },
          data: {
            toolbarClass: "inspect"
          }
        });
    });

    ngModule.run( ($log, $rootScope, $mdDialog, $mdToast, $window, $state, $resource, $q, igUtils, userService,inspectionService,
                   persistenceService, navigationService) => {
      $log.debug("Running angular module ngModule");
      var indexDBStores = ['I-Shipments'];

      // Add any listeners that apply regardless of application state
      //TODO: THIS WILL NEED TO CHANGE TO REGISTERSHELLEXCEPTIONLISTENER WITH A PROMISE.
      $rootScope.$on('shellException', (event, data) => {
        var exception = angular.fromJson(data);
        if(exception.ClassName && exception.Message) {
          $log.error(exception.ClassName + ": " + exception.Message);
        }
        $rootScope.toast(exception.Message, 4);
      });


      $rootScope.$on('$stateChangeStart', (event,toState,toParams,fromState,fromParams) => {
        if(navigationService._pushOrPop && navigationService._pushOrPop=='POP'){
          console.log(navigationService._stateStack);
          navigationService._pushOrPop='';
        }else{
          navigationService.pushState(toState.name);
        }
      });
      // end listeners


      /**
       * Displays a toast message to the user in the lower right corner of the screen
       * @param msg The message to be displayed
       * @param duration The length of time in seconds that the message will display
       */
      $rootScope.toast = (msg, duration) => {
        var _duration = 3000;
        if(duration) {
          _duration = duration * 1000;
        }
        $mdToast.show(
          $mdToast.simple()
            .content(msg)
            .position("top right")
            .hideDelay(_duration)
        );
      };

      $rootScope.close = function(event) {
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
                $state.go('list');
              }
              ,(error) => {
                $log.error("No user Details Found");
              });
        }, () => {
          // Outside of container app
          userService.getUserDetails("conway","cse.inspector")
            .then(() =>{
                $state.go('list');
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

    ngModule.controller('AppController', AppController);

    require('./components/igCollapsible')(ngModule);
    require('./components/igGalleryImage')(ngModule);
    require('./components/igHeader')(ngModule);
    require('./components/dimensionRow')(ngModule);
    require('./components/customValidation')(ngModule);
    require('./components/manifestItem')(ngModule);
    require('./components/shared/camera')(ngModule);
    require('./components/shared/igUtils')(ngModule);
    require('./components/shared/inspection')(ngModule);
    require('./components/shared/user')(ngModule);
    require('./components/shared/validation')(ngModule);
    require('./partials/shipmentDetails')(ngModule);
    require('./partials/inspectionInProgress')(ngModule);
    require('./partials/inspectionList')(ngModule);
    require('./partials/userSettings')(ngModule);
    require('./partials/lookup')(ngModule);
    require('./partials/viewPhoto')(ngModule);
    require('./partials/nav')(ngModule);
    require('./partials/dialogs')(ngModule);
    require('./partials/manifestDetails')(ngModule);

})();
