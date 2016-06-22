"use strict"
export default function() {
  return function(fakString,delimiter) {
    return fakString.replace( new RegExp(delimiter,'g'),'<br/>')
  }
}
