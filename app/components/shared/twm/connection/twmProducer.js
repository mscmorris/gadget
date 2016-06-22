"use strict"

var noop = () => {}

export function sendMessage(producer, message, fn = noop) {
  return producer
  .combineLatest(message, (p, m) => { return p.send(m, fn) })
  .map(vf => {
    return (vf.exception) ? vf.exception : true
  })
}

export function countProduced(message) {
  return message.scan(a => a + 1, 0)
}

export default function(session, what) {
  return session.combineLatest(what, (s, w) => s.createProducer(w))
}
