"use strict"

import { configure, start, close } from  "./connection/twmConnection.js"
import twmSession from "./connection/twmSession.js"
import { messageControl } from "./connection/twmMessage.js"
import { sendMessage } from "./connection/twmProducer.js"
import { connectionWatcher } from "./connection/twmConnectionWatcher.js"

var moduleName = "twmService"

class twmService {

  constructor(TWM_END_POINT, TWM_CONFIG, uuid, igUtils) {
    this.uuid = uuid
    this.igUtils = igUtils
    this.TWM_CONFIG = TWM_CONFIG
    this.TWM_END_POINT = TWM_END_POINT
  }
  
  connect() {
    var jmsProps, connect

    jmsProps = new JmsConnectionProperties()
    jmsProps.connectionTimeout = 10000
    jmsProps.reconnectAttemptsMax = -1
    jmsProps.reconnectDelay = 3000
    jmsProps.shutdownDelay = 5000

    connect = configure(this.TWM_END_POINT, jmsProps)
    return connect().map(start)
  }

  createSession(connection) {
    return new twmSession(connection)
  }

  sendMessage(payload, properties, messageMap) {
    var message, employeeId, connection, session,
    topic, queue, producer, consumer,
    readyToSendNext, merged, shouldTerminate

    // static
    employeeId = properties.EmployeeId

    // streams
    connection = this.connect()
    session = this.createSession(connection)
    topic = session.createTopic(this.getTopicName())
    queue = session.createQueue(this.getQueueName(employeeId))
    message = session.createMessage(payload, properties, topic, queue, this.uuid.v4, messageMap)
    producer = session.createProducer(topic)
    consumer = session.createConsumer(queue)
    readyToSendNext = consumer.startWith(true)
    shouldTerminate = connectionWatcher(connection, message, consumer)
    shouldTerminate.subscribe(close)

    merged = payload.zip(message, (p, m) => { return [ p.Id, p.ProNumber, m.getStringProperty("EventId") ] })

    this.logOutboundMessage(merged)
    this.logSend(sendMessage(producer, messageControl(message, readyToSendNext, 1)))
    this.logErrors(producer)
    this.logErrors(consumer)

    return [ consumer, merged ]
  }

  logOutboundMessage(message) {
    message.do((m) => this.igUtils.logToContainer("Sending PhotoId: " + m[0] + " ProNumber: " + m[1]  + " Event Id: " + m[2]))
  }

  logSend(producer) {
    producer.do(() => this.igUtils.logToContainer("Message sent to TIBCO!"))
  }

  logErrors(stream) {
    stream.doOnError((e) => this.igUtils.logToContainer(e.message))
  }

  getTopicName() {
    return "/topic/" + this.TWM_CONFIG.twmCicsRegion + "." + this.TWM_CONFIG.twmDestination
  }

  getQueueName(employeeId) {
    return "/queue/" + this.TWM_CONFIG.twmCicsRegion + "." + this.TWM_CONFIG.twmResponseQueue + "." + employeeId + ".Q"
  }

  getMessageId(correlationId) {
    return "ID:EMS-" + this.TWM_CONFIG.twmCicsRegion + "." + this.TWM_CONFIG.twmDestination + "." + correlationId
  }
}

twmService.$inject = ["TWM_END_POINT", "TWM_CONFIG", "uuid", "igUtils"]

angular.module(moduleName, []).service(moduleName, twmService);

export default moduleName
