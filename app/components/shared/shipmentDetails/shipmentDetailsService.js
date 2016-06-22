export default ngModule => {
  var providerName = 'shipmentDetailsService';
  /*
  Usage:
   shipmentDetailsService.createShipmentData("123456789","{1:1}");
   shipmentDetailsService.updateShipmentData("123456789","{1:2}");
   shipmentDetailsService.getShipmentData("123456789").then((message)=>{
     var foo = message;
   });
   shipmentDetailsService.deleteShipmentData("123456789");
   */
  class shipmentDetailsService {

    /* @ngInject */
    constructor($log,igUtils,$q,conditioningService) {
      var s = this;
      s.igUtils = igUtils;
      s._$q = $q;
      s._$log = $log;
      s._conditioningService = conditioningService;
    }

    createShipmentData(proNumber, shipmentData){
      var s =this;
      if (s.igUtils.isExternalFunc("createShipmentData") && typeof proNumber != "undefined" && typeof shipmentData != "undefined") {
        s._$log.debug(`${providerName}: Calling createShipmentData`);
        container.createShipmentData(s._conditioningService.condition(proNumber), shipmentData);
      }
    }

    updateShipmentData(proNumber,shipmentData){
      var s =this;
      if (s.igUtils.isExternalFunc("updateShipmentData") && typeof proNumber != "undefined" && typeof shipmentData != "undefined") {
        s._$log.debug(`${providerName}: Calling updateShipmentData`);
        container.updateShipmentData(s._conditioningService.condition(proNumber), shipmentData);
      }
    }
    deleteShipmentData(proNumber){
      var s =this;
      if (s.igUtils.isExternalFunc("deleteShipmentData") && typeof proNumber != "undefined") {
        s._$log.debug(`${providerName}: Calling deleteShipmentData`);
        container.deleteShipmentData(s._conditioningService.condition(proNumber));
      }
    }
    getShipmentData(proNumber){
      var s =this;
      var defer = s._$q.defer();
      var promise = defer.promise;
      if (s.igUtils.isExternalFunc("getShipmentData") && typeof proNumber != "undefined"){
        container.getShipmentData(s._conditioningService.condition(proNumber), function(value) {
          s._$log.debug(`[${providerName}][getShipmentData]: Fetched SQLite data for PRO ${proNumber}`);
          if (value == ""){
            defer.reject();
          }else {
            defer.resolve(angular.fromJson(value));
          }
        });
      } else {
        s._$log.error("Call to getShipmentData was rejected!");
        defer.reject();
      }
      return promise;
    }
  }
  ngModule.service(providerName, shipmentDetailsService);
}
