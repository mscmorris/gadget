"use strict"

export default function(SHIFT_CODE) {
  return function(code) {
    return SHIFT_CODE[code]
  }
}