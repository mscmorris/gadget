"use strict"

export default function() {
  /* @ngInject */
  return function(scope, element, attributes) {
    element.bind("blur", function(event) {
      scope.$apply(() => scope.$eval(attributes.onBlur))
      scope.$on("$destroy", () => element.off("blur"))
      event.preventDefault()
    })
  }
}
