export default ngModule => {

  var notifyViaToast = ($rootScope, notifyObj) => {
    if(notifyObj.duration) {
      $rootScope.toast(notifyObj.message, notifyObj.duration);
    } else {
      $rootScope.toast(notifyObj.message);
    }
  };

  ngModule.directive('igNotifyOnLoad', ($rootScope, persistenceService) => {
    return {
      restrict: 'A',
      compile: function(element, attrs){
        persistenceService.find("NOTIFY_ON_LOAD").then(
          (notifyObj) => {
            if(notifyObj !== undefined && attrs.igNotifyOnLoad !== undefined) {
              if(attrs.igNotifyOnLoad === "toast" && notifyObj.type === "toast") {
                notifyViaToast($rootScope, notifyObj);
              } else if(attrs.igNotifyOnLoad === "inline" && notifyObj.type === "inline") {
                angular.element(element).append(notifyObj.message);
              }
              persistenceService.delete("NOTIFY_ON_LOAD");
            }
          }
        )
      }
    }
  });
};
