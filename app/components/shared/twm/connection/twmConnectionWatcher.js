"use strict"

/**
 * This module watches a connection for criteria
 * under which it should emit a signal to close
 * @author mmorris
 */

import Rx from "rx"

import { countProduced } from "./twmProducer.js"
import { countConsumed } from "./twmConsumer.js"

var or = Rx.Observable.amb

// Augment with our own reactive value function
Rx.Observable.prototype.timeOutOrReset = function (delay, reset) {
  var source = this
  return Rx.Observable.create(function (observer) {
      var p = source.publish()
      var r = reset
        .startWith(true)
        .flatMapLatest(() => Rx.Observable.return(true).delay(delay))
        .take(1)
    
      return new Rx.CompositeDisposable(r.subscribe(observer), p.connect())
  })
}

function sentEqualReceived(messageCount, receivedCount) {
  return messageCount
    .combineLatest(receivedCount, (mc, rc) => [mc, rc])
    .filter(c => { return c[0] === c[1] })
}

function setInterruptTimeout(delay, interrupt) {
  return Rx.Observable
    .return(true)
    .timeOutOrReset(delay, interrupt)
}

function watch(sent, received) {
  var sentCount, receivedCount, timeout
  
  sentCount = countProduced(sent)
  receivedCount = countConsumed(received)
  timeout = setInterruptTimeout(15000, received)

  return or(sentEqualReceived(sentCount, receivedCount), timeout)
}

export default function(connection, sent, received) {
  return watch(sent, received).flatMap(() => connection)
}