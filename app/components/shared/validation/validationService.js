export default ngModule => {

  var providerName = 'validationService';

  class validationService {

    /* @ngInject */
    constructor ($log){
      this._$log = $log;
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
      return s.isValidProNumberCheckDigit(inputValue);
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
      var s = this;
      var proNumber = s.conditionProValue(inputValue);
      if (proNumber === "") {
        return false;
      }
      //divide first 8 chars by 7 multiple remainder by 7
      var checkDigit = proNumber.substring(8);
      var number = proNumber.substring(0, 8);
      var mod = (number % 7);
      return (mod == checkDigit);
    }

    //INPUT: 9, 10, OR 11 DIGIT PRO NUMBER
    //OUTPUTS A PRO NUMBER IN NINE DIGIT FORMAT
    conditionProValue(inputValue) {
      if (typeof inputValue == 'undefined' || inputValue === "") return "";

      var workingValue = inputValue.replace(new RegExp("[^0-9]","g"), "");
      if (workingValue.length == 9) return workingValue;

      workingValue = workingValue.substring(1, workingValue.length);
      if (workingValue.length == 10 && workingValue[3] === '0') {
        workingValue = workingValue.slice(0, 3) + workingValue.slice(4);
      }
      else if (workingValue.length != 9) {
        //invalid input
        workingValue = "";
      }
      return workingValue;
    }

  }

  ngModule.service(providerName, validationService);
}
