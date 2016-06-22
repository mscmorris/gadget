"use strict"

export default function(STATUS_CODE) {
  return function(code) {
    return STATUS_CODE[code]
  }
}