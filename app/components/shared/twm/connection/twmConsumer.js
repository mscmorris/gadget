import Rx from 'rx'

export default function(session, what, selector) {
  var subject

  subject = new Rx.Subject()

  session
    .combineLatest(what, (s, q) => s.createConsumer(q))
    .subscribe((c) => c.setMessageListener((message) => { subject.onNext(message) }))

  return subject
}
