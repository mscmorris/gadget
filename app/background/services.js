"use strict"

/**
 * This module bootstraps all long running background process
 *
 * To add additional processes, simply add them to the services folder, import,
 * and add the initializer to the services array
 * 
 * @author mmorris
 */

import angular from "angular"

import twmBackgroundProvider from  "./services/twm.js"

var bgSvcModule, services

bgSvcModule = angular.module("igApp.backgroundServices", [])

services = [ 
  twmBackgroundProvider
]

services.forEach(service => bgSvcModule.run(service))