"use strict"

/* @ngInject */
function igActionMenu($templateRequest, $compile) {
  return {
    restrict: "E",
    transclude: true,
    controller: 'igActionMenuController as igAction',
    templateUrl: "components/igActionMenu/igActionMenu.html",
    link: function(scope, element, attrs, ctrl, transclude) {
      scope.$watch(attrs.syncWith, (n, o) => {
        if(n !== o) {
          transclude((clone) => {
            element.append($compile(clone)(scope))
          })
        }
      })
    }
  }
}

export default ngModule => {
  require('./igActionMenuController')(ngModule);
  ngModule.directive("igActionMenu", igActionMenu);
}
