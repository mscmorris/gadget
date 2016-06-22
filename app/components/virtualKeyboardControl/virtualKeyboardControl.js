/*
Example Usages:
 <input type="text" virtual-keyboard-control/>
 SHOWS THE VIRTUAL KEYBOARD WHEN THE CONTROL GETS THE FOCUS AND HIDES THE KEYBOARD WHEN FOCUS IS LOST

 <input type="text" virtual-keyboard-control=""/>
 SHOWS THE VIRTUAL KEYBOARD WHEN THE CONTROL GETS THE FOCUS AND HIDES THE KEYBOARD WHEN FOCUS IS LOST

 <input type="text" virtual-keyboard-control="onblur&onfocus"/>
 SHOWS THE VIRTUAL KEYBOARD WHEN THE CONTROL GETS THE FOCUS AND HIDES THE KEYBOARD WHEN FOCUS IS LOST

 <input type="text" virtual-keyboard-control="onblur"/>
 HIDES THE KEYBOARD WHEN FOCUS IS LOST ONLY

 <input type="text" virtual-keyboard-control="onfocus"/>
 SHOWS THE VIRTUAL KEYBOARD WHEN THE CONTROL GETS THE FOCUS ONLY

 <input type="text" virtual-keyboard-control="hideonfocus"/>
 HIDES THE VIRTUAL KEYBOARD WHEN THE CONTROL GETS THE FOCUS

 <input type="text" virtual-keyboard-control="onclick"/>
 SHOWS THE VIRTUAL KEYBOARD WHEN THE CONTROL GETS A CLICK EVENT
 */
export default ngModule => {
  /* @ngInject */
  ngModule.directive('virtualKeyboardControl',['igUtils',(igUtils) => {


    /* @ngInject */
    function link(scope, element, attrs, modelCtrl) {

      if (attrs["virtualKeyboardControl"].toLowerCase() === "hideonfocus") {
        element.on("focus", ()=> {
          igUtils.showVirtualKeyboard(false);
        });
        scope.$on("$destroy", () => {
          element.off("focus");
        });
      }else {
        if (attrs["virtualKeyboardControl"].toLowerCase().includes("onclick")) {
          element.on("click", ()=> {
            igUtils.showVirtualKeyboard(true);
          });
          scope.$on("$destroy", () => {
            element.off("click");
          });

        }
        if (attrs["virtualKeyboardControl"].toLowerCase() === "" || attrs["virtualKeyboardControl"].toLowerCase().includes("onblur")) {
          element.on("blur", ()=> {
            igUtils.showVirtualKeyboard(false);
          });
          scope.$on("$destroy", () => {
            element.off("blur");
          });
        }
        if (attrs["virtualKeyboardControl"].toLowerCase() === "" || attrs["virtualKeyboardControl"].toLowerCase().includes("onfocus")) {
          element.on("focus", ()=> {
            igUtils.showVirtualKeyboard(true);
          });
          scope.$on("$destroy", () => {
            element.off("focus");
          });
        }
      }
    }

    return {
      restrict: 'A',
      require: 'ngModel',
      link: link
    };
  }]);
};
