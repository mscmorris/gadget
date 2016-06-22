import Rx from 'rx'

var log = (m) => { console.log(m) };

class twmConnection {

  constructor(WEBSOCKET_URL, properties, logger = log) {
    this.endPoint = WEBSOCKET_URL
    this.properties = properties
    this.logger = logger;
    this.connection = null;
  }

  connect(username = null, password = null, clientID = null) {
    return Rx.Observable.create((o) => {
      let connection = new JmsConnectionFactory(this.endPoint, this.properties).createConnection(username, password, clientID, () => {
        if(connection.exception) {
          this.logger(`TWM Connection Exception: ${connection.exception.toString()}`);
          o.onError(connection.exception)
        } else {
          this.connection = connection
          connection.getValue().start(() => { this.logger("TWM Connection completed") })
          connection.getValue().setExceptionListener((e) => {
            this.logger(`TWM Connection Exception occurred: ${e.toString()}`);
            o.onError(e);
          })
          o.onNext(connection.getValue())
        }
      })
    }).share()
  }

  disconnect(callbackFn) {
    if(this.connection !== null) {
      this.logger("Closing TWM connection...");
      try {
        this.connection.getValue().close(() => {
          this.logger("TWM connection successfully closed.");
          if(callbackFn !== undefined && typeof callbackFn === "function") {
            callbackFn();
          }
        });
      } catch(e) {
        this.logger(`Exception occurred while closing the TWM connection: ${e.toString()}`);
      }
    }
  }
}

export default twmConnection
