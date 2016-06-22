export default ngModule => {

  var providerName = 'userService';

  class userService {

    /* @ngInject */
    constructor ($http, $log, $window, igUtils, USER_LOGIN_ENDPOINT,inspectionService,mappingService,$q){
      this._$http = $http;
      this._$log = $log;
      this.$window = $window;
      this._$q = $q;
      this.igUtils = igUtils;
      this.USER_LOGIN_ENDPOINT = USER_LOGIN_ENDPOINT;
      this.inspectionService=inspectionService;
      this.mappingService = mappingService;

    }// end of constructor

    /* Call RestAPI to GET the USER DETAILS FROM USER DIRECTORY*/

    getUserDetails(domain, userId) {

      var s = this;
      //var url = vm.USER_LOGIN_ENDPOINT + "/user/"+domain+"/"+userId;
      var url = "data/user.json"; /* Url for Unit Test*/
      return s._$http.get(url)

        .then(response => {
          s._$log.debug(providerName + "[getUserDetails]: GET call complete");
          var iContext = s.mappingService.mapInspectionContextFromDomainUser(response.data);
          s.inspectionService.setInspectionContext(iContext);
        },
          error => {
          s._$log.error(providerName + "[getUserDetails]: GET call failed!");
        });

    }

    /**
     * Accesses the inter comm app and performs the 'requestDomainUser' function to get userId and domain
     */
    getDomainUser() {
      var s = this;
      var defer = s._$q.defer();
      var promise = defer.promise;
      s._$log.debug(s.igUtils);
      s._$log.debug(s.igUtils.isExternalFunc("getDomainUser"));
      if (s.igUtils.isExternalFunc("getDomainUser")){
        container.getDomainUser(function(userCred) {
          defer.resolve(angular.fromJson(userCred));
        });
      } else {
        defer.reject();
      }
      return promise;
    }

  }

  ngModule.service(providerName, userService);
}
