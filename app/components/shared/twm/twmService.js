import Rx from 'rx'
import _ from 'lodash'
import moment from 'moment'

import twmConnection from  './connection/twmConnection.js'
import twmSession from './connection/twmSession.js'
import { messageControl } from './connection/twmMessage.js'
import { sendMessage } from './connection/twmProducer.js'

var moduleName = 'twmService'

class twmService {

  /**
   * API Documentation: http://cdcxpd0575.con-way.com:8001/documentation/apidoc/client/javascript/jms/index.html?JmsConnectionFactory
   */

  /* @ngInject */
  constructor($rootScope, endPointLocatorService, $log, $interval, uuid, igUtils, dialogService) {
    this.$rootScope = $rootScope;
    this.uuid = uuid
    this.endPointLocatorService = endPointLocatorService;
    this.$log = $log
    this.$interval = $interval
    this.igUtils = igUtils
    this.intervalLength =  120000; // 2 minutes

    if(angular.isUndefined(window.JmsConnectionProperties)) {
      dialogService.showCrashed();
    }
  }

  connect() {
    if(angular.isUndefined(this.connection)) {
      this.$log.debug(`${moduleName}[connect]: returning a new connection`);
      var jmsProps;

      jmsProps = new JmsConnectionProperties();
      jmsProps.connectionTimeout = 10000;
      //jmsProps.reconnectAttemptsMax = -1;
      jmsProps.reconnectAttemptsMax = 15;
      jmsProps.reconnectDelay = 3000;
      jmsProps.shutdownDelay = 5000;

      //Tracer.setTrace(true)

      this.connection = new twmConnection(this.endPointLocatorService.getTwmEndPoint(), jmsProps, this.$log.debug);
      let connectionObservable = this.connection.connect();
      connectionObservable.doOnError((e) => {
        if(angular.isDefined(this.checkTransmission)) {
          this.$interval.cancel(this.checkTransmission);
        }
        this.$log.error(`${moduleName}[connect]: ${e.toString()}`);
        this.$log.error(`${moduleName}[connect]: Connection Error - closing TWM connection.`);
        this.$rootScope.$emit('twmTransmitFailed');
        this.disconnect();
      }).subscribe();
      return connectionObservable;
    } else {
      this.$log.debug(`${moduleName}[connect]: returning an existing connection`);
      return new Rx.Observable.of(this.connection.connection.getValue());
    }
  }

  disconnect(callbackFn) {
    if(angular.isObject(this.session) && !this.isDisconnecting) {
      this.isDisconnecting = true;
      this.session.close(() => {
        this.session = undefined;
        this.connection.disconnect(() => {
          this.connection = undefined;
          this.isDisconnecting = false;
          if(callbackFn !== undefined && typeof callbackFn == "function") {
            callbackFn();
          }
        });
      });
    }
  }

  createSession(connection) {
    if(angular.isUndefined(this.session)) {
      this.$log.debug(`${moduleName}[createSession]: returning a new session`);
      this.session = new twmSession(connection, this.$log.debug);
    } else {
      this.$log.debug(`${moduleName}[createSession]: returning an existing session`);
    }
    return this.session;
  }

  sendMessage(payload, propFn, mapFn, employeeId) {
    var message, connection, session, topic, queue,
    producer, consumer, properties, readyToSendNext,
    merged;

    this.$log.debug(`${moduleName}[sendMessage]: Preparing messages for sending to TWM`);

    // streams
    connection = this.connect();
    session = this.createSession(connection);
    topic = session.createTopic(this.getTopicName());
    queue = session.createQueue(this.getQueueName(employeeId));
    message = session.createMessage(payload, propFn, topic, queue, this.uuid.v4, mapFn);
    producer = session.createProducer(topic);
    consumer = session.createConsumer(queue);
    readyToSendNext = new Rx.Subject();
    merged = payload
      .zip(message, (p, m) => {
        return [ p.Id, p.ProNumber, m.getStringProperty("EventId") ]
      });

    sendMessage(producer, messageControl(message, readyToSendNext.startWith(true), 1), this.msgSendComplete(readyToSendNext), this.$log.debug).subscribe(
      (n) => {
        this.$log.info(`Sending next message: ${n.toString()}`)
      },
      (e) => {
        this.$log.error(e.toString());
        this.$log.error(`${moduleName}[sendMessage]: Error sending message - closing TWM connection.`);
        this.disconnect(() => { this.$rootScope.$emit('twmTransmitFailed'); });
      }
    );

    this.monitorTransmission(payload, consumer);

    this.logErrors(producer)
    this.logErrors(consumer)
    this.logOutboundMessage(merged)

    return [ consumer, merged ]
  }

  msgSendComplete(subject) {
    return () => {
      this.$log.debug("Sending message to TWM completed...");
      subject.onNext(true);
    }
  }

  monitorTransmission(messages, consumer) {
    var lastUpdate, targetCount, receivedCount;

    // check for stalled transmission
    lastUpdate = moment();
    this.checkTransmission = this.$interval(() => {
      let now = moment();
      let timeElapsed = now.diff(lastUpdate);
      if(timeElapsed > this.intervalLength) {
        this.$log.debug(`${moduleName}[monitorTransmission]: Transmission to TWM stalled. Broadcasting twmTransmitFailed event.`);
        this.$rootScope.$emit('twmTransmitFailed');
        this.$interval.cancel(this.checkTransmission);
      }
    }, this.intervalLength);

    // track the messages received to know when the service has completed
    targetCount = messages.count();
    receivedCount = 0;
    consumer
      .do(() => {
        receivedCount++;
        lastUpdate = moment();
      })
      .flatMap(targetCount, (msg, count) => { return count; })
      .subscribe((_targetCount) => {
        this.$log.debug(`${moduleName}[monitorTransmission]: Received ${receivedCount} of ${_targetCount} messages...`);
        if(receivedCount === _targetCount) {
          this.$log.debug(`${moduleName}[monitorTransmission]: Transmission to TWM completed. Broadcasting twmTransmitCompleted event.`);
          this.$interval.cancel(this.checkTransmission);
          this.$rootScope.$emit('twmTransmitCompleted');
        }
      });
  }

  logOutboundMessage(message) {
    message
      .do((m) => console.log('Sending PhotoId: ' + m[0] + ' ProNumber: ' + m[1]  + ' Event Id: ' + m[2]))
      //.subscribe((m) => this.igUtils.logToContainer('Sending PhotoId: ' + m[0] + ' ProNumber: ' + m[1]  + ' Event Id: ' + m[2]))
  }

  logErrors(stream) {
    stream.doOnError((e) => this.$log.error(e.message))
  }

  getTopicName() {
    return `/topic/${this.endPointLocatorService.getTwmQueuePrefix()}.${this.endPointLocatorService.getTwmPublishDestination()}`;
  }

  getQueueName(employeeId) {
    return `/queue/${this.endPointLocatorService.getTwmQueuePrefix()}.${this.endPointLocatorService.getTwmResponseQueue()}.${employeeId}.Q`;
  }

  getMessageId(correlationId) {
    return `ID:EMS-${this.endPointLocatorService.getTwmQueuePrefix()}.${this.endPointLocatorService.getTwmPublishDestination()}.${correlationId}`;
  }
}

twmService.$inject = ['$rootScope','endPointLocatorService', '$log', '$interval', 'uuid', 'igUtils', 'dialogService']

angular.module(moduleName, []).service(moduleName, twmService);

export default moduleName
