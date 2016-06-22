import Rx from 'rx'

var moduleName = 'document.list'

class listDocumentService {

  constructor(soapService, CODE_CONSTANTS, endPointLocatorService) {
    this.soapService = soapService;
    this.endPointLocatorService = endPointLocatorService;
    this.codeStream = Rx.Observable.from(CODE_CONSTANTS.DOCUMENT_CODES);
  }

  findAll(proNumber = null) {
    var paramStream, responseStream, convert, locate

    if(proNumber == null) {
      return Rx.Observable.throw(new Error('Invalid pro number supplied'));
    }

    convert = this.convertToParamsObj.bind(this);
    locate = this.locateDocs.bind(this);

    paramStream = this.codeStream
      .map(convert(proNumber, this.endPointLocatorService.getDmsCorpCode()));

    responseStream = paramStream
      .flatMap(locate)
      .takeUntil(paramStream.ignoreElements());

    return responseStream.reduce((a,v)=>{
        a.push(v);
        return a;
      }, []);
  }

  locateDocs(params) {
    return this.soapService.execute(this.endPointLocatorService.getDmsDocListEndPoint(),this.endPointLocatorService.getDmsDocListWsdlEndPoint(), 'LocateDoc', params)
  }


  convertToParamsObj(proNumber, endPoint) {
    return function(code) {
      return {
          param0: endPoint,
          param1: code,
          param2: proNumber,
          param3: 'GLOBAL'
      }
    }
  }
}

listDocumentService.$inject = ['soapService', 'CODE_CONSTANTS', 'endPointLocatorService'];

export default ngModule => ngModule.service('listDocumentService', listDocumentService)
