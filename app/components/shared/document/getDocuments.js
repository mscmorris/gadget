"use strict"

import Rx from 'rx'

var moduleName = 'getDocumentService'

class getDocumentService {

  constructor(soapService, igUtils, endPointLocatorService) {
    this.soapService = soapService
    this.endPointLocatorService = endPointLocatorService;
    this.igUtils = igUtils
  }

  fetchDocument(docInfoStream = null) {
    var paramStream, resultStream

    if(docInfoStream === null) {
      return Rx.Observable.throw(new Error('Invalid stream'))
    }

    paramStream = docInfoStream
      .map(this.convertToParamsObj)

    resultStream = paramStream
      .concatMap((params) => this.soapService.execute(this.endPointLocatorService.getDmsDocEndPoint(), this.endPointLocatorService.getDmsDocWsdlEndPoint(), 'getDoc', params))
      .takeUntil(paramStream.ignoreElements())

    return this
      .merge(docInfoStream, resultStream)
      .reduce((a,v) => a.concat(v),[])
  }

  convertToParamsObj(obj) {
    return {
      param0: obj
    }
  }

  merge(docInfoStream, results) {
    var s = this
    return results
      .map(r => r[0]) // extract bytes from result
      .flatMap((b) => Rx.Observable.fromPromise(s.igUtils.convertBase64TiffToPng(b))) // convert format
      .zip(docInfoStream, (r, p) => { // fold in our document data
        return {
          docClass: p.docClass,
          timestamp: p.docArchiveTimeStamp,
          bytes: r
        }
      })
  }
}

getDocumentService.$inject = ['soapService', 'igUtils', 'endPointLocatorService']

export default ngModule => ngModule.service(moduleName, getDocumentService)
