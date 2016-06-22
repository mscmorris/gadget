"use strict"

import twmProducer from "./twmProducer.js"
import twmConsumer from "./twmConsumer.js"
import messageBuilder from "./twmMessage.js"

class twmSession {
  
  constructor(connection)
  {
    this.session = connection.map((c) => c.createSession(false, Session.AUTO_ACKNOWLEDGE)).take(1).share()
  }

  createTopic(name)
  {
   return this.session.map((s) => s.createTopic(name)).take(1)
  }

  createQueue(name)
  {
    return this.session.map((s) => s.createQueue(name)).take(1)
  }

  createProducer(topic)
  {
    return twmProducer(this.session, topic)
  }

  createConsumer(queue, selector = null)
  {
    return twmConsumer(this.session, queue, selector)
  }

  createMessage(payload, properties, destination, replyTo, uuidStrategy, mapFn)
  {
    return this.session.combineLatest(destination, replyTo, (s, d, r) => {
        return messageBuilder(payload, s, properties, d, r, uuidStrategy, mapFn)
      }
    )
    .concatAll()
    .share()
  }
}

export default twmSession
