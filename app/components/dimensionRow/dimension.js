export default ngModule => {
  ngModule.directive('dimensionRow', () => {
    return {
      restrict: 'A, E',
      scope: {
        'dimItem' : '=',
        'updateFn' : '&'
      },
      templateUrl: 'components/dimensionRow/dimension.html',
      link: link
    }
  });

  /* @ngInject */
  function link(scope, element, attrs, controller) {
    var rowInputs = $(element).find("input[type='text']");
    angular.forEach(rowInputs, (val, idx) => {
      $(val).on("blur", () => {
        scope.updateFn();
      });
    });
  }
};
