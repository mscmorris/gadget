export default ngModule => {
    ngModule.directive('manifestItem', () => {


      return {
            restrict: 'E',
            scope: {
              manifestitem: '=',
              expanded: '@'
            },
            templateUrl: 'components/manifestItem/manifestItem.html',
            controller: 'manifestItemController',
            controllerAs: 'vm',
            bindToController:true,
            compile: function(element, attrs){
               if (!attrs.expanded) { attrs.expanded = false; }
            }
        }
    });
};
