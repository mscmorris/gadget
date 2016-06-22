"use strict";
import registerRoutes from './routerStates.js';
import registerDecorators from './decorators';


export default /*@ngInject*/ function appConfig($stateProvider, $urlRouterProvider, $locationProvider, $logProvider, $httpProvider, $provide) {
  $locationProvider.html5Mode(true);
  $logProvider.debugEnabled(true); //false to prevent _$log.debug output
  $httpProvider.defaults.useXDomain = true;
  $httpProvider.interceptors.push('httpLoggingInterceptor');

  registerDecorators($provide);
  registerRoutes($urlRouterProvider, $stateProvider);
}
