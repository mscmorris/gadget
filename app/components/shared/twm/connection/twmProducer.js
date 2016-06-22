import Rx from 'rx'

var noop = () => {}
var log = (m) => { console.log(m) };

export function sendMessage(producer, message, fn = noop, logger = log) {
  return producer
  .combineLatest(message, (p, m) => {
    return p.send(m, fn)
  })
  .map((vf) => {
    return (vf.exception) ? vf.exception : true
  })
  .catch((e) => {
    logger(`Error occurred sending TWM message: ${e.toString()}`);
    return Rx.Observable.throw(e);
  })
}


export default function(session, what) {
  return session.combineLatest(what, (s, w) => s.createProducer(w))
}
