export default ngModule => {

  var providerName = 'userService';

  class userService {

    /* @ngInject */
    constructor ($rootScope, $http, $log, $window, igUtils, endPointLocatorService,inspectionService,mappingService,$q,
                 dialogService, httpSessionService, ENVIRONMENT, USER_ROLES, USER_GROUPS){
      this.$rootScope = $rootScope;
      this._$http = $http;
      this._$log = $log;
      this.$window = $window;
      this._$q = $q;
      this.igUtils = igUtils;
      this.endPointLocatorService = endPointLocatorService;
      this.inspectionService=inspectionService;
      this.mappingService = mappingService;
      this.dialogService = dialogService;
      this.httpSessionService = httpSessionService;
      this.ENVIRONMENT = ENVIRONMENT;
      this.USER_ROLES = USER_ROLES;
      this.USER_GROUPS = USER_GROUPS;
    }// end of constructor

    /* Call RestAPI to GET the USER DETAILS FROM USER DIRECTORY*/

    /**
     * Uses the REST API to retrieve an employee's personal information and employee roles. If the Inspector role is not found
     * it will alert the user and close the application.
     * @param domain
     * @param userId
     * @returns {*}
     */
    getUserDetails(domain, userId) {
      var s = this;
      var config={
        params:{"format":"JSON"},
        headers:{withCredentials :true}
      };



      var url = `${this.endPointLocatorService.getUserLoginEndPoint([domain,userId])}`

      //var url = "data/user.json"; /* Url for Unit Test*/
      return s.httpSessionService.get(url,config)
        .then(response => {
            if(response.data.code && response.data.code.toString() == "500") {
              s._$log.error(providerName + "[getUserDetails]: GET call failed!");
              s.notifyUnauthorized();
            } else {
              s._$log.debug(providerName + "[getUserDetails]: GET call complete");
              if (!s.hasDefaultProfile(response.data)){
                var dialogArgs = { "dialogTitle" : "Default Profile Not Set", "dialogContent" : "Your profile is missing from SCO.  Setup your default SIC and Shift Code to prevent this warning in the future.  See your supervisor for assistance." }
                var locals = s.dialogService.buildDialogBindings(dialogArgs)
                s.dialogService.alert(locals)
              }
              if(this.ENVIRONMENT == "development" || (response.data.groups && s.hasInspectorGroup(response.data.groups)) || (response.data.roles && s.hasInspectorRole(response.data.roles))) {
                var iContext = s.mappingService.mapInspectionContextFromDomainUser(response.data);
                s.inspectionService.setInspectionContext(iContext);
              } else {
                s._$log.error(providerName + "[getUserDetails]: Unauthorized access for employee with ID: " + response.data.employeeId);
                s.notifyUnauthorized();
              }
            }
          },
          error => {
            s._$log.error(providerName + "[getUserDetails]: GET call failed!");
            return s._$q.reject(error);
          });
    }


    /**
     * Accesses the inter comm app and performs the 'requestDomainUser' function to get userId and domain
     */
    getDomainUser() {
      var s = this;
      var defer = s._$q.defer();
      var promise = defer.promise;
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

    /**
     * Checks if the provided data source contains the Inspector role ID
     * @param roles An array of objects containing a key "id" i.e. { "name" : "Inspector", "id" : 75 }
     * @returns {boolean} Returns true if the role is found.
     */
    hasInspectorRole(roles) {
      return this.igUtils.inObjectArray(roles, "id", this.USER_ROLES.W_AND_I_ANALYST) != -1;
    }

    hasInspectorGroup(groups){
      for(var index=0; index < this.USER_GROUPS.W_AND_I_ANALYST.length; index++){
        if (groups.indexOf(this.USER_GROUPS.W_AND_I_ANALYST[index]) > -1){
          return true;
        }
      }
      return false;
    }

    hasDefaultProfile(data) {
      return !(data.requestingSic == undefined || data.requestingSic == "" || data.shiftCode == undefined || data.shiftCode == "");
    }

    notifyUnauthorized() {
      var dialogArgs = {};
      dialogArgs.dialogTitle = "Unauthorized Access";
      dialogArgs.dialogContent = `You do not have access to this application. Contact your supervisor to obtain inspector access.`;
      var locals = this.dialogService.buildDialogBindings(dialogArgs);
      this.dialogService.alert(locals, this.$rootScope.closeApplication);
    }

  }

  ngModule.service(providerName, userService);
}
