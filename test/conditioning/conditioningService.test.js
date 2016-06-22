import angular from 'angular'
import serviceName from '../../app/components/shared/conditioning/conditioningService'

import 'angular-mocks'


describe('It tests the conditioning service', function() {
  var cs, ngMock

  beforeEach(function() {
    angular.mock.module(serviceName)
  })

  beforeEach(angular.mock.inject(function(conditioningService) {
    cs = conditioningService
  }))

  it('Can format a PRO number into a numeric string', function() {
    var expected = '123456782'

    expect(cs.clean('123-456782')).toEqual(expected)
    expect(cs.clean('123 456 782')).toEqual(expected)
    expect(cs.clean('123456 782')).toEqual(expected)
    expect(cs.clean('a123456b782')).toEqual(expected)
  })

  it('Can condition a PRO number properly', function() {
    var expected = '123456782'

    expect(cs.condition('123-456782')).toEqual(expected) // 10 char
    expect(cs.condition('01230456782')).toEqual(expected) // 11 char
    expect(cs.condition('123 456 782')).toEqual(expected) // bs chars
    expect(cs.condition('123456 782')).toEqual(expected) // more bs chars
    expect(cs.condition('a123456b782')).toEqual(expected) // and more bs chars
  })

  it('Can condition a PRO number edge case', function() {
    var expected = '123000012'

    expect(cs.condition('01230000012')).toEqual(expected)
  })

  it('Can condition a PRO number with a trailing 0', function() {
    var expected = '826712950'

    expect(cs.condition('826712950')).toEqual(expected)
  })

  it('Can condition a PRO number to 11 digits', function() {
    var expected = "01980096706"

    expect(cs.condition("198096706", 11)).toEqual(expected)
  })





})
