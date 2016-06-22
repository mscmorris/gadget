"use strict"

import angular from "angular"

import onBlur from "./directives/onBlur.js"
import autofocus from "./directives/autofocus"
import customValidation from "./directives/customValidation"

angular.module("xpoDirectives", [])
  .directive("onBlur", onBlur)
  .directive("autofocus",autofocus)
  .directive("customValidation", customValidation)
