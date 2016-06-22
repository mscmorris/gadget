export default /* @ngInject */  function routerStates($urlRouterProvider, $stateProvider) {
  // For any unmatched url, redirect to "" for guaranteeing that the user creds have been resolved before loading the list
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
      url: '/shipmentDetails/:proNbr',
      views: {
        '': {
          templateUrl: 'partials/shipmentDetails/index.html',
          controller: 'shipmentDetailsController as vm'
        }
      },
      data: {
        toolbarClass: "inspect",
        rootState: false
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
        toolbarClass: "inspect",
        rootState: false
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
    .state('viewArchiveDoc', {
      url: '/viewArchiveDoc',
      views: {
        '': {
          templateUrl: 'partials/viewArchiveDoc/index.html',
          controller: 'viewArchiveDocController as vm'
        }
      },
      data: {
        toolbarClass: "viewphoto",
        rootState: false
      }
    })
    .state('addPro', {
      url: '/addPro',
      views: {
        '': {
          templateUrl: 'partials/addPro/addPro.html',
          controller: 'addProController as vm'
        }
      },
      data: {
        toolbarClass: 'inspect',
        rootState: true
      }
    })
    .state('lookup', {
      url: '/lookup/:errorMsg',
      views: {
        '': {
          templateUrl: 'partials/lookup/index.html',
          controller: 'lookupController as vm'
        }
      },
      data: {
        toolbarClass: "inspect",
        rootState: true
      }
    })
    .state('manifestDetails', {
      url: '/manifestDetails/:lookupType/:lookupNumber',
      views: {
        '': {
          templateUrl: 'partials/manifestDetails/index.html',
          controller: 'manifestDetailsController as vm'
        }
      },
      data: {
        toolbarClass: "inspect",
        rootState: false
      }
    })
    .state('feedback', {
      url: '/feedback',
      views: {
        '': {
          templateUrl: 'partials/feedback/index.html',
          controller: 'feedbackController as vm'
        }
      },
      data: {
        toolbarClass: "inspect",
        rootState: true
      }
    });
}
