import Rx from 'rx'
import parseStrategy from 'xml2js'

var moduleName = 'soapResponseParser'

class SoapResponseParser {
  /* @ngInject */
  constructor(parseStrategy) {
    this.parseStrategy = parseStrategy
  }

  /**
   * Unwraps the SOAP Envelop to provide the returned payload
   * @param  {[type]} result [description]
   * @param  {[type]} body   [description]
   * @return {[type]}        [description]
   */
  parseResponse(result, body) {
    var resultStream

    resultStream = Rx.Observable.fromNodeCallback(this.parseStrategy)(body)
    return resultStream.map((o) => o['soapenv:Envelope']['soapenv:Body'][0])
  }
}

SoapResponseParser.$inject = ['parseStrategy']

export default ngModule => {
  ngModule.constant('parseStrategy', parseStrategy)
  ngModule.service('soapResponseParser', SoapResponseParser)
}
