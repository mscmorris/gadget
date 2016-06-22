"use strict"

import angular from 'angular'
import _ from 'lodash'

var serviceName = 'conditioningService'

class conditioningService {

  clean(proNumber) {
    return proNumber.replace(/\D/g, '')
  }

  convert(proNumber = "", digits = 9) {
    var part1, part2, trim, trimmed

    if (proNumber.length === digits) {
      return proNumber
    }

    trim = _.partialRight(this.trim.bind(this), '0', 'g', digits)
    trimmed = trim(proNumber)
    part1 = trimmed.slice(0, 3)
    part2 = trimmed.slice(3)
    part2 = (part2.length > 6) ? trim(part2) : part2

    var retValue = "";
    if (digits === 11){
      retValue = `0${part1}0${part2}`;
    } else if (digits === 10){
      retValue = `${part1}-${part2}`;
    } else {
      retValue = part1.concat(part2)
    }

    return retValue
  }

  condition(proNumber = "", digits = 9) {
    var clean, convert

    if(proNumber === "" || proNumber === null) {
      return ""
    }

    clean = this.clean.bind(this)
    convert = _.partialRight(this.convert.bind(this), digits)

    return _.flowRight(convert, clean)(proNumber)
  }

  trim(string = "", what = ",", flags = 'g', digits = 9) {
    var escaped, find

    escaped = what.replace(/[\[\](){}?*+\^$\\.|\-]/g, "\\$&")
    find = new RegExp("^[" + escaped + "]", flags)

    return string.replace(find, '');
  }

  sliceError(errorMsg) {
    if(typeof errorMsg == "string") {
      return errorMsg.replace(/.*?:/, "").slice(0,-1).trim();
    } else {
      return "";
    }
  }
}

angular.module(serviceName, []).service(serviceName, conditioningService)

export default serviceName
