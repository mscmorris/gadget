"use strict"

export default /* @ngInject */ function autofocus($timeout) {
  /* @ngInject */
  return function (scope, element, attr) {
      scope.$watch(attr.autofocus,
        function (value) {
          if (value) {
            $timeout(function () {
              element[0].focus();
            });
          }
        }
      );
  };
}
