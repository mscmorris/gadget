import angular from 'angular'

var providerName = 'validationService';

class validationService {

  /* @ngInject */
  constructor($log, conditioningService) {
    this._$log = $log;
    this._conditioningService = conditioningService
    this._numberTrailerPattern = "^[0-9]{3}[-]{1}[0-9]{1,7}$";  // Numbers only (313-4114)
    this._letterTrailerPattern = "^[a-zA-Z]{1,4}[-]{1}[0-9]{0,6}$";  //WENP-853401
    this._numberCheck = "^[0-9]+$"; //is numbers
    this._doorPattern = "^[0-9]{1,4}$"; //door number
    this._nineDigitPro = "^[0-9]{9}$";  //123456782
    this._tenDigitPro = "^[0-9]{3}[-][0-9]{6}$";  //123-456782
    this._elevenDigitPro = "^[0][0-9]{3}[0][0-9]{6}$";  //123-456782

  }// end of constructor

  isValidProNumber(inputValue) {
    var s = this;
    return s.isValidProNumberCheckDigit.call(this, inputValue);
  }

  isValidDoorNumber(inputValue) {
    var s = this;
    var regExp = new RegExp(s._doorPattern);
    return regExp.test(inputValue);
  }

  isValidTrailerNumber(inputValue) {
    var s = this;

    var numberTrailerRegExp = new RegExp(s._numberTrailerPattern).test(inputValue);
    var letterTrailerRegExp = new RegExp(s._letterTrailerPattern).test(inputValue);

    return numberTrailerRegExp || letterTrailerRegExp;
  }

  isValidProNumberCheckDigit(inputValue) {
    var s = this
    var proNumber = s._conditioningService.condition(inputValue);

    if (proNumber === "" || proNumber.length < 9 || proNumber.length > 11) {
      return false;
    }

    //divide first 8 chars by 7 multiple remainder by 7
    var checkDigit = proNumber.substring(8);
    var number = proNumber.substring(0, 8);
    var mod = (number % 7);
    return (mod == checkDigit);
  }

  // Added New function to verify entered Pro is of 9 or 11 digit
  proNumberCheckDigit(inputValue) {
    var s = this
    var proNumber = s._conditioningService.condition(inputValue);

    if (proNumber === "" || proNumber.length < 9 || proNumber.length > 11) {
      return false;
    }
    return true;
  }

}



validationService.$inject = ['$log','conditioningService']

angular.module(providerName, []).service(providerName, validationService)

export default providerName
