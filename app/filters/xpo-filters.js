"use strict"

// Import global reqs
import angular from "angular"

// XPO defined import filters
import friendlyShiftCd from "./filters/friendlyShiftCd.js"
import friendlyStatusCd from "./filters/friendlyStatusCd.js"
import friendlyProNumber from "./filters/friendlyProNumber.js"
import columnFak from "./filters/columnFak.js"

angular.module("xpoConstants", [])
  .constant(
    "SHIFT_CODE", {
      "O": "Outbound",
      "I": "Inbound",
      "N": "FAC",
      "D": "Day Reship"
    })

  .constant(
    "INSPECT_STATUS", {
      "R": "Flagged",
      "P": "In Progress",
      "I": "Inspected",
      "X": "Dismissed",
      "N": "Inspected Not Corrected",
      "Y": "Recommended",
      "T": "Corrected",
      "C": "Corrected",
      "E": "Excluded",
      "NONE": "No Status",
      "":"No Status"
  })

  .constant(
    "USER_ROLES", {
      "W_AND_I_ANALYST" : "76"
    })
  .constant(
    "USER_GROUPS", {
      "W_AND_I_ANALYST" : ["Conway_Tab_Corr_Inspectors","Tst_Conway_Tab_Corr_Inspectors"]
    })

angular.module("xpoCustomFilters",
  // Dependencies
  [
    "xpoConstants",
    "conditioningService"
  ])
  // Filters
  .filter("shiftCd", ["SHIFT_CODE", friendlyShiftCd])
  .filter("friendlyStatusCd", ["INSPECT_STATUS", friendlyStatusCd])
  .filter("friendlyProNumber", ["conditioningService", friendlyProNumber])
  .filter("columnFak",[columnFak])
