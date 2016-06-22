"use strict"

import Rx from 'rx'

var moduleName = 'soap.rx'

class SoapRX {
  /* @ngInject */
  constructor($soap) {
    this.$soap = $soap
  }

  execute(endpoint = null, wsdlEndPoint = null, method = null, params = {}) {
    var promise, responseStream

    if(endpoint === null) {
      return Rx.Observable.throw(new Error('No endpoint specified'))
    }

    if(method === null) {
      return Rx.Observable.throw(new Error('No remote method specified'))
    }

    promise = this.$soap.post(endpoint, wsdlEndPoint, method, params)
    responseStream = Rx.Observable.fromPromise(promise)
    return responseStream
  }
}

SoapRX.$inject = ['$soap']

export default ngModule => ngModule.service('soapService', SoapRX)
