export default ngModule => {
    ngModule.directive('manifestItem', () => {

      /* @ngInject */
      function controllerFn($scope) {

        $scope.onExpand = function() {
          $scope.expanded = !$scope.expanded;
        }
      };
      return {
            restrict: 'E',
            scope: {
              manifestitem: '=',
              expanded: '@'
            },
            templateUrl: 'components/manifestItem/manifestItem.html',
            controller: controllerFn,
            compile: function(element, attrs){
               if (!attrs.expanded) { attrs.expanded = false; }
            }
        }
    });
};
