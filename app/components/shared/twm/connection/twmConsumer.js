"use strict"

import Rx from "rx"

export function countConsumed(consumer) {
  return consumer.scan(a => a + 1, 0)
}

export default function(session, what) {
  var subject

  subject = new Rx.Subject()

  session
    .combineLatest(what, (s, q) => s.createConsumer(q))
    .subscribe((c) => c.setMessageListener((message) => { subject.onNext(message) }))

  return subject
}
