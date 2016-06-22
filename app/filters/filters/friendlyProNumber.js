"use strict"

export default function(conditioningService) {
  return function(proNumber) {
    return conditioningService.condition(proNumber)
  }
}