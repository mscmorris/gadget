import angular from 'angular'
import serviceName from '../../app/components/shared/validation/validationService.js'

import 'angular-mocks'

describe('it tests the validation service', function() {
  var vs, cs

  beforeEach(function() {
    angular.mock.module(function($provide) {
      $provide.service('conditioningService', function() {
        this.condition = jasmine.createSpy('condition')
      })
    })

    angular.mock.module(serviceName)
  })

  beforeEach(angular.mock.inject(function(validationService, conditioningService) {
    vs = validationService
    cs = conditioningService
  }))


  it('Returns true if PRO number is valid', function() {

    cs.condition.and.returnValue('123456782')
    expect(vs.isValidProNumber('123-456782')).toBe(true)
    expect(vs.isValidProNumber('123456782')).toBe(true)
    expect(vs.isValidProNumber('01230456782')).toBe(true)
    
  })

  it('Returns false if PRO number is invalid', function() {

    var value = '123456789'
    cs.condition.and.returnValue(value)
    expect(vs.isValidProNumber(value)).toBe(false)

  })

  it('Returns false for 1e33', function() {
    cs.condition.and.returnValue("133")
    expect(vs.isValidProNumber("133")).toBe(false)
    expect(vs.isValidProNumber("1e33")).toBe(false)
  })
})