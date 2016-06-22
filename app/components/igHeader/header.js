export default ngModule => {
    /*@ngInject*/
    ngModule.directive('igHeader', ($mdMenu) => {
        return {
            restrict: 'E',
            scope: {
              title: '@',
              stick: '@',
              flexVal: '@',
              showsic: '@'
            },
            transclude: true,
            templateUrl: 'components/igHeader/header.html',
            controller: 'igHeaderController as  igH',
            compile: compile
        }

        function compile(element, attrs, transclude) {
            if (!attrs.stick || attrs.stick == "true" || attrs.stick == true ) {
              // "Stick" the header to the top using jquery-sticky plugin (Garand)
              $(element[0]).children(":first").sticky({"topSpacing": 0});
            }
            if (!attrs.flexVal ) {
              attrs.flexVal = '';
            }

            if (!attrs.showsic || attrs.showsic.toLowerCase() === "true") {
              attrs.showsic = true;
            } else if(attrs.showsic.toLowerCase() === "false") {
              attrs.showsic = false;
            }

            return link;
          }

          function link(scope, element, attrs, ctrls) {
            var menuItems = angular.element(element[0]).find("md-menu-item");
            menuItems.on("mouseup", () => {
              $mdMenu.hide();
            });
            menuItems.on("$destroy", () => { menuItems.off("mouseup") });
        }
    });
};
