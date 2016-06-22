export default ngModule => {
    ngModule.directive('igHeader', () => {
        return {
            restrict: 'E',
            scope: {
              title: '@',
              stick: '@',
              flexVal: '@'
            },
            transclude: true,
            require: '^inspectionListController',
            templateUrl: 'components/igHeader/header.html',
            controller: 'igHeaderController as  igH',
            compile: compile
        }
    });

    function compile(element, attrs, transclude) {
      if (!attrs.stick || attrs.stick == "true" || attrs.stick == true ) {
        // "Stick" the header to the top using jquery-sticky plugin (Garand)
        $(element[0]).children(":first").sticky({"topSpacing": 0});
      }
      if (!attrs.flexVal ) {
        attrs.flexVal = '';
      }
    }
};
