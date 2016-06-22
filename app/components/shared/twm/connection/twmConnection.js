"use strict"

import Rx from "rx"

export function configure(WEBSOCKET_URL = null, properties = {}) {
  WEBSOCKET_URL = WEBSOCKET_URL
  properties = properties

  return function connect(username = null, password = null, clientId = null) {
    if(WEBSOCKET_URL === null) {
      return new Rx.Observable.throw(new Error("The JMS is connection not configured! Did you call configure() first?"))
    }

    return Rx.Observable.create((o) => {
      let factory, connectionFuture

      factory = new JmsConnectionFactory(WEBSOCKET_URL, properties)
      connectionFuture = factory.createConnection(username, password, clientId, () => {
        if(connectionFuture.exception) {
          o.onError(connectionFuture.exception)
        } else {
          let connection = connectionFuture.getValue()
          connection.setExceptionListener(e => o.onError(e))
          o.onNext(connection)
        }
      })
    })
    .share()
  }
}

export function start(connection) {
  connection.start()
  return connection
}

export function close(connection) {
  connection.close()
  return connection
}