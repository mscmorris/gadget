import Rx from 'rx'

function noop() {}

function createPayload(session) {
  return function(body) {
    return session.createTextMessage(body)
  }
}

function setDestination(destination) {
  return function(message) {
    message.setJMSDestination(destination)
    return message
  }
}

function setReplyTo(destination) {
  return function(message) {
    message.setJMSReplyTo(destination)
    return message
  }
}

function setUuid(strategy) {
  return function(message) {
    var uuid = strategy()
    message.setJMSCorrelationID(uuid)
    message.setStringProperty('EventId', uuid)
    return message
  }
}

function setStringProperties(properties) {
  return function(message) {
    Object.keys(properties).forEach((key) => {
      message.setStringProperty(key, properties[key])
    })
    return message
  }
}

export function messageControl(message, ready, howMany) {
  var controlled = message.controlled()
  ready.subscribe(() => {
    console.log("messageControl requesting message");
    controlled.request(howMany)
  })
  return controlled
}

export default function(payload, session, propFn, destination, replyTo, uuidStrategy = noop, mapFn = noop) {
  var msgProperties = payload.map(propFn);
  return payload
    .flatMap(mapFn)
    .map(createPayload(session))
    .map(setDestination(destination))
    .map(setReplyTo(replyTo))
    .map(setUuid(uuidStrategy))
    .zip(msgProperties, (msg, props) => {
      setStringProperties(props).call(null, msg);
      return msg;
    })
}
