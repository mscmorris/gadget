export default ngModule =>
{
  var providerName = 'endPointLocatorService';

  class endPointLocatorService {
    /*@ngInject*/
    constructor($log, $location, ENDPOINTS) {
      this._$log = $log;
      this._$location = $location;
      this.ENDPOINTS = ENDPOINTS;
      this.defaultKey = "DEFAULT";
      this.defaultProtocol = "HTTP";

    }

    getInspectionEndPoint(pathParams = undefined, queryParams = undefined){
      return this.buildEndPoint(this.ENDPOINTS.INSPECTIONS_ENDPOINT,this.defaultProtocol,pathParams, queryParams);
    }
    getUserLoginEndPoint(pathParams = undefined){
      return this.buildEndPoint(this.ENDPOINTS.USER_LOGIN_ENDPOINT,this.defaultProtocol, pathParams);
    }
    getPricingAppEndPoint(pathParams = undefined, queryParams = undefined){
      return this.buildEndPoint(this.ENDPOINTS.PRICING_APP_ENDPOINT,this.defaultProtocol, pathParams,queryParams);
    }
    getCorrectionAppEndPoint(pathParams = undefined, queryParams = undefined){
      return this.buildEndPoint(this.ENDPOINTS.CORRECTIONS_APP_ENDPOINT,this.defaultProtocol, pathParams,queryParams);
    }
    getInspectionsAppEndPoint(pathParams = undefined){
      return this.buildEndPoint(this.ENDPOINTS.INSPECTIONS_APP_ENDPOINT,this.defaultProtocol, pathParams);
    }
    getTwmEndPoint(){
      return this.getRegionValue("TWM_ENDPOINT");
    }
    getTwmQueuePrefix(){
      return this.getRegionValue("QUEUE_NAME");
    }
    getDmsCorpCode(){
      return this.getRegionValue("DMS_CORP_CODE");
    }
    getTwmPublishDestination(){
      return this.ENDPOINTS.TWM_CONFIG.twmDestination;
    }
    getTwmResponseQueue(){
      return this.ENDPOINTS.TWM_CONFIG.twmResponseQueue;
    }
    getDmsDocEndPoint(){
      return this.ENDPOINTS.GET_DOCS_ENDPOINT;
    }
    getDmsDocWsdlEndPoint(){
      return this.ENDPOINTS.GET_DOCS_WSDL_ENDPOINT;
    }
    getDmsDocListEndPoint(){
      return this.ENDPOINTS.LIST_DOCS_ENDPOINT;
    }
    getDmsDocListWsdlEndPoint(){
      return this.ENDPOINTS.LIST_DOCS_WSDL_ENDPOINT;
    }


    /*
     APPENDS THE URI PIECE TO THE URL PIECE TO COME UP WITH THE ABSOLUTE PATH TO THE RESOURCE
     PARAMETERS:
     URL - PROVIDED BY THE CALLER: /services/shipment/etc/etc/etc
     PROTOCOL (OPTIONAL) - protocol desired: HTTP, HTTPS, WSS, ETC... defaults to HTTP

     URI - PROVIDED BY $location: http://tcts4.con-way.com:80

     IF CONSTANT SERVICE_REDIRECT IS SET THE RETURNED PATH WILL CONTAIN ITS VALUE INSTEAD
     OF THE VALUE OF THE HOST.
     IF...
     SERVICE_REDIRECT = FOO.CON-WAY.COM
     RETURN = {PROTOCOL}+FOO.CON-WAY.COM+{URL}

     IF...
     SERVICE_REDIRECT = ''
     RETURN = {PROTOCOL}+{HOST AND PORT FOR LOCATION THAT SERVED THE  PAGE}+{URL}

     ANOTHER EXAMPLE RETURN - http://tcts4.con-way.com:80/services/shipment/etc/etc/etc
     */
    buildEndPoint(url, protocol = "HTTP", pathParams = undefined, queryParams = undefined) {
      var retValue;
      if (this.ENDPOINTS.SERVICE_REDIRECT != undefined && this.ENDPOINTS.SERVICE_REDIRECT.trim().length > 0) {
        retValue = `${protocol}://${this.ENDPOINTS.SERVICE_REDIRECT}/${url}`;
      } else {
        retValue = `${protocol}://${this._$location.host()}:${this._$location.port()}/${url}`;
      }
      if (pathParams != undefined){
        pathParams.forEach((item,index,array)=>{retValue = `${retValue}/${item}`});
      }
      if (queryParams != undefined){
        retValue += "?";
        queryParams.forEach((item,index,array)=>{retValue = `${retValue}${item}&`});
        retValue = retValue.substring(0,retValue.length-1);
      }

      this._$log.debug(`${providerName}: Returning endpoint value: ${retValue}`);
      return retValue;
    }
    getRegionFromHost(){
      var host = this._$location.host();//tctsc.con-way.com
      var hostArray = host.split(".");
      this._$log.debug(`${providerName}: Returning host: ${hostArray[0].toUpperCase()}`);
      return hostArray[0].toUpperCase();
    }
    getRegionValue(key){
      var value = this.ENDPOINTS.REGIONS[this.getRegionFromHost()];
      if (value == undefined){
        value = this.ENDPOINTS.REGIONS[this.defaultKey]
      }
      if (value[key] == undefined){
        this._$log.error(`${providerName}:Undefined region value for key: ${key}`);
        throw new Error(`Undefined region value for key: ${key}`)
      }
      this._$log.debug(`${providerName}:Returning value: ${value[key]} for key: ${key}`);
      return value[key];
    }
  }
  ngModule.service(providerName, endPointLocatorService);
};
