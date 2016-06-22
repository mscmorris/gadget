export default ngModule => {
    ngModule.directive('igCollapsible', /*@ngInject*/ (persistenceService, $timeout, $location, $anchorScroll) => {

        /* @ngInject */
        function controllerFn($scope, $element,$timeout, persistenceService) {
            $scope.headingColorStyle = {'background-color': $scope.headingColor};
            $scope.bgColorStyle = {'background-color': $scope.bgColor};

            $scope.innerExpand = function() {

              if(typeof $scope.onExpandFn == "function" && !$scope.expanded) {
                $scope.onExpandFn();
              }
              $scope.expanded = !$scope.expanded;

              if ($scope.expandedStateKey != undefined){

                persistenceService.insertCollapsibleState($scope.expandedStateKey, $scope.expanded);
              }

              if ($scope.expanded && $scope.autoFocusOnExpand){
                $timeout(function () {
                  //find the first empty field
                  var elementsFound = angular.element($scope.element).find('input[type=text],textarea,select').filter(function () {
                    return $(this).val() == ''
                  }).filter(':visible:first');
                  if (elementsFound.length > 0) {
                    elementsFound[0].focus();
                  }else{
                    //find the first field
                    var elementsFound = angular.element($scope.element).find('input[type=text],textarea,select').filter(':visible:first');
                    if (elementsFound.length > 0) {
                      elementsFound[0].focus(
                        function() {
                          var len = $(this).val().length * 2;
                          $(this).setSelectionRange(len, len);
                        });
                    }
                  }
                });
              }
            }
        };

        return {
            restrict: 'E',
            scope: {
              title: '@title',
              bgColor: '@bgColor',
              headingColor: '@headingColor',
              expanded: '@',
              onExpandFn:'&onExpand',
              autoFocusOnExpand: '@autoFocusOnExpand',
              expandedStateKey: '@expandedStateKey'
            },
            transclude: true,
            templateUrl: 'components/igCollapsible/collapsible.html',
            controller: controllerFn,
            compile: function(element, attrs){
               if (!attrs.bgColor) { attrs.bgColor = '#FFFFFF'; }
               if (!attrs.expanded) { attrs.expanded = false; }
               return {
                  post: function postLink(scope, element, iAttrs, controller) {
                    scope.element = element;
                    var  setExpandState = function(expanded, id){
                      $timeout(()=>{
                        scope.expanded = expanded;
                        $location.hash(id);
                      });
                    }
                    if (attrs.expandedStateKey != undefined){

                      persistenceService.findCollapsibleState(attrs.expandedStateKey).then((value)=>{
                        value = (value != undefined) ? value : attrs.expanded;
                        if((value != scope.expanded)) {
                          if (typeof scope.onExpandFn == "function") {
                              var retVal = scope.onExpandFn();
                              if (retVal != undefined) {
                                retVal.subscribe(
                                  (success)=> {},
                                  (error)=> {},
                                  (complete)=> {
                                    setExpandState(value, attrs.id);
                                  }
                                );
                              } else {
                                setExpandState((value != undefined) ? value : attrs.expanded, attrs.id);
                              }
                          }else{
                            setExpandState(value, attrs.id);
                          }
                        }
                      });
                    }
                    element.on('$destroy', function() {
                      delete scope.element;
                    });
                  }
               };
            }
        }
    });
};
