export default ngModule => {
    ngModule.directive('igCollapsible', () => {

        /* @ngInject */
        function controllerFn($scope) {
            $scope.headingColorStyle = {'background-color': $scope.headingColor};
            $scope.bgColorStyle = {'background-color': $scope.bgColor};
            $scope.innerExpand = function() {
              if(typeof $scope.onExpandFn == "function") {
                $scope.onExpandFn();
              }
              $scope.expanded = !$scope.expanded;
            }
        };

        return {
            restrict: 'E',
            scope: {
              title: '@title',
              bgColor: '@bgColor',
              headingColor: '@headingColor',
              expanded: '@',
              onExpandFn:'&onExpand'
            },
            transclude: true,
            templateUrl: 'components/igCollapsible/collapsible.html',
            controller: controllerFn,
            compile: function(element, attrs){
               if (!attrs.bgColor) { attrs.bgColor = '#F6F6F6'; }
               if (!attrs.expanded) { attrs.expanded = false; }
            }
        }
    });
};
