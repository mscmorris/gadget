import twmProducer from './twmProducer.js'
import twmConsumer from './twmConsumer.js'
import messageBuilder from './twmMessage.js'

var log = (m) => { console.log(m) };

class twmSession {

  constructor(connection, logger = log) {
    this.sessionReference = null;
    this.logger = logger;
    this.session = connection.map((c) => this.sessionReference = c.createSession(false, Session.AUTO_ACKNOWLEDGE)).take(1).share()
  }

  close(callbackFn) {
    this.logger("Closing TWM session...");
    if(this.sessionReference !== null) {
      this.sessionReference.close(callbackFn);
    } else if(callbackFn !== undefined && typeof callbackFn == "function") {
      callbackFn();
    }
  }

  createTopic(name) {
    return this.session.map((s) => s.createTopic(name)).take(1).catch(this.handleException("createTopic"));
  }

  createQueue(name) {
    return this.session.map((s) => s.createQueue(name)).take(1).catch(this.handleException("createQueue"));
  }

  createProducer(topic) {
    return new twmProducer(this.session, topic).catch(this.handleException("createProducer"));
  }

  createConsumer(queue, selector = null) {
    return new twmConsumer(this.session, queue, selector).catch(this.handleException("createConsumer"));
  }

  createMessage(payload, properties, destination, replyTo, uuidStrategy, mapFn) {
    return this.session.combineLatest(destination, replyTo, (s, d, r) => {
        return messageBuilder(payload, s, properties, d, r, uuidStrategy, mapFn)
      }
    ).concatAll().share()
  }

  handleException(errorSrc) {
    return (e) => {
      this.logger.debug(`twmSession exception in ${errorSrc}: ${e.toString()}`);
      return Rx.Observable.throw(e);
    }
  }
}

export default twmSession
