"use strict"

import Rx from 'rx'

var moduleName = 'documentService'

class documentService {

  constructor(listDocumentService, getDocumentService, conditioningService) {
    this.listDocumentService = listDocumentService
    this.getDocumentService = getDocumentService
    this.conditioningService = conditioningService;
  }

  /**
   * Execute a FetchDoc fetch on the DMS endpoint
   * @param  documentInfo[]
   * @return observable An observable of document objects
   */
  fetchDocument(theDocument){
    var pages = Rx.Observable.from(theDocument)

    return this
      .getDocumentService
      .fetchDocument(pages)
  }

  /**
   * Execute a LocateDoc fetch on the DMS endpoint
   * @param  string proNumber 9-digit pro
   * @return observable An observable of document objects grouped by class for the pro number
   */
  listDocuments(proNumber) {
    return this
      .listDocumentService
      .findAll(this.conditioningService.condition(proNumber))
  }
}

documentService.$inject = ['listDocumentService', 'getDocumentService', 'conditioningService']

export default ngModule => { ngModule.service(moduleName, documentService) }
