import angular from 'angular'

var providerName = 'dimensionService';

class dimensionService {

  /* @ngInject */
  constructor ($log, CODE_CONSTANTS){
    this._$log = $log;
    this._CODE_CONSTANTS = CODE_CONSTANTS;
  }// end of constructor

  /**
   * Adds empty dimension objects based on the canonical structure to an array
   * @param rowCount The number of dimension objects to add
   * @param dimArr The array containing the dimensions
   */
  addNewDimRows(rowCount, dimArr) {
    var iRowCnt = parseInt(rowCount, 10);
    for(var i = 0; i < iRowCnt; i++) {
      var dimObj = {};
      dimObj.seq = dimArr.length + 1;
      dimObj.pieceCnt = "";
      dimObj.inspectorDimensions = {"seq" : `${i+1}`, "length" : "", "width" : "", "height" : ""}; // seq = 1 for legacy purposes
      dimArr.push(dimObj);
    }
  }

  /**
   * Validates an individual row of inspector dimensions
   * @returns Boolean Returns true if the dimension row passes validation
   */
  validateDimRow(dimItem) {
    var iSeq, iPieceCnt, _width, _length, _height;
    iSeq = parseInt(dimItem.seq, 10);
    iPieceCnt = parseInt(dimItem.pieceCnt, 10);
    _width = dimItem.inspectorDimensions.width;
    _length = dimItem.inspectorDimensions.length;
    _height = dimItem.inspectorDimensions.height;
    if((isNaN(iSeq) || iSeq <= 0) ||
      (isNaN(iPieceCnt) || iPieceCnt <= 0) ||
      (isNaN(parseFloat(_width)) || !isFinite(_width) || _width <= 0) ||
      (isNaN(parseFloat(_length)) || !isFinite(_length) || _length <= 0) ||
      (isNaN(parseFloat(_height)) || !isFinite(_height) || _height <= 0)) {
      return false;
    } else {
      return true;
    }
  }

  /**
   * Determines if a adding new dimension row entry should be allowed by checking to see if the last row index is valid
   * @returns Boolean
   */
  isDimRowAdditionAllowed(dimSrc) {
    if(dimSrc.length >= this._CODE_CONSTANTS.MAX_INSPECT_DIMS) {
      return false;
    } else if(dimSrc !== undefined) {
      var dimRow = dimSrc[dimSrc.length - 1];
      return this.validateDimRow(dimRow);
    } else {
      return true;
    }
  }

  /**
   * @returns Array containing only validated dimension rows
   */
  getValidDimRows(dimSrc) {
    var returnList = [];
    var index = 1;
    angular.forEach(dimSrc, (value) => {
      if(this.validateDimRow(value)) {
        value.inspectorDimensions.seq = index++;
        returnList.push(value);
      }
    });
    return returnList;
  }

  /**
   * Calculates the total volume in cubic feet and density for the entire shipment.
   */
  calculateDimDerivatives(dimSrc, totalWeight) {
    var newTotVol = 0;
    var newDensity = 0;
    angular.forEach(dimSrc, (dimItem, idx) => {
      if(this.validateDimRow(dimItem)) {
        var cDivisor = 12; // Conversion Divisor: Entries are in inches - calculations result in feet
        var _volume = (dimItem.pieceCnt * (dimItem.inspectorDimensions.length / cDivisor) *
        (dimItem.inspectorDimensions.width / cDivisor) * (dimItem.inspectorDimensions.height / cDivisor));
        newTotVol = (parseFloat(newTotVol) + parseFloat(_volume)).toFixed(2);
      }
    });
    if(parseFloat(newTotVol) > 0) {
      newDensity = (totalWeight / newTotVol).toFixed(2);
    }
    return { "volume" : newTotVol, "density" : newDensity};
  }
}

angular.module(providerName, ['igApp.constants']).service(providerName, dimensionService)

export default providerName
