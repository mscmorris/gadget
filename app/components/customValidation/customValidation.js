export default ngModule => {
  ngModule.directive('customValidation', () => {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: link
    };
  });

  /* @ngInject */
  function link(scope, element, attrs, modelCtrl) {
    var flags;
    if(attrs.flags === undefined) {
      flags = "gi";
    }
    var regExp = new RegExp(attrs.customValidation, flags);

    modelCtrl.$parsers.push(function (inputValue) {

      var matchArr = inputValue.match(regExp);
      var transformedInput = matchArr[0];

      modelCtrl.$setViewValue(transformedInput);
      modelCtrl.$render();

      return transformedInput;
    });
  }
};
