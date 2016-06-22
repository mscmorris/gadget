"use strict"

export default ngModule => {
  var controllerName = 'viewArchiveDocController';

  class viewArchiveDocController {
    /* @ngInject */
    constructor($scope, inspectionService) {
      // Angular Module Deps
      this.$scope = $scope;

      // Local properties
      this.docIndex =  0;
      this.inspectionService = inspectionService;
      this.currentArchiveDoc = this.inspectionService.getCurrentArchiveDoc();
      this.currInspection =  this.inspectionService.currentShipment.currentInspectionDetails;
    }

    displayCurrentIndex() {
      return this.docIndex + 1;
    }

    nextSlide() {
      this.docIndex = (this.docIndex < this.currentArchiveDoc.length - 1) ? this.docIndex + 1 : 0;
    }

    prevSlide() {
      this.docIndex = (this.docIndex > 0) ? this.docIndex - 1 : this.currentArchiveDoc.length - 1;
    }
    currentImageBytes(){
      var returnValue = this.currentArchiveDoc[this.docIndex].bytes;
      return returnValue;
    }

    showNextArrow() {
      return this.multiPage() && this.docIndex < this.currentArchiveDoc.length -1;
    }

    showPrevArrow() {
      return this.multiPage() && this.docIndex > 0;
    }

    multiPage() {
      return this.currentArchiveDoc.length > 1;
    }
    docLength(){
      return this.currentArchiveDoc.length;
    }

  }

  ngModule.controller(controllerName, viewArchiveDocController);
};
