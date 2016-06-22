"use strict"

import Rx from "rx"
import angular from "angular"

var or = Rx.Observable.amb
var nullOrUndefined = property => property === null || property === "undefined"

function hasErrorMessage(response) {
  let headers = response.headers();
  return headers["haserror"] !== undefined && headers["haserror"] === "true" && !response.data.message.toLowerCase().includes("not yet in the system");
}

function extractResponseDetail(response)
{
  var success, failed, mapResponse
  mapResponse = status => {
    return response => {
      var ret = {
        status: status,
        pro: response.config.data.proNbr || response.config.data.inspection.proNbr
      }

      if(!nullOrUndefined(response.data)) {
        ret.message = response.data.message
      } else {
        ret.message = ""
      }

      return ret
    }
  }

  success = response
  .filter(response => {
    return response.status === 200 && !hasErrorMessage(response);
  })
  .map(mapResponse("success"))

  failed = response
  .filter(response => {
    return response.status !== 200 || hasErrorMessage(response);
  })
  .map(mapResponse("failed"))

  return or(success, failed)
}

function propagateErrorAsResponse(error)
{
  return Rx.Observable.of(error)
}

/* @ngInject */
export default function($http, payload, url)
{
  var response

  response = new Rx.Observable
  .fromPromise($http.post(url, payload))
  .catch(propagateErrorAsResponse)
  .share()

  return extractResponseDetail(response)
}
