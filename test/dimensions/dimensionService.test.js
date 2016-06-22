import angular from 'angular'
import serviceName from '../../app/components/shared/dimensions/dimensionService.js'

import 'angular-mocks'

describe('it tests the dimension service', function() {
  var ds

  beforeEach(function() {
    angular.mock.module('igApp.constants')
    angular.mock.module(serviceName)
  })

  beforeEach(angular.mock.inject(function(dimensionService) {
    ds = dimensionService
  }))

  describe('validateDimRow', function() {
    it('Returns true if every row value is an integer', function() {
      var dimRow = {seq:"1", pieceCnt:"1", inspectorDimensions: { width:"10", length:"12", height:"13" } }
      expect(ds.validateDimRow(dimRow)).toBe(true)
    })

    it('Returns true if at least one measurement contains a decimal', function() {
      var dimRow = {seq:"1", pieceCnt:"1", inspectorDimensions: { width:"10.7", length:"12", height:"13" } }
      expect(ds.validateDimRow(dimRow)).toBe(true)
    })

    it('Returns true if all measurements contain a decimal', function() {
      var dimRow = {seq:"1", pieceCnt:"1", inspectorDimensions: { width:"10.7", length:"12.3", height:"13.2"} }
      expect(ds.validateDimRow(dimRow)).toBe(true)
    })

    it('Returns false if sequence or piece count are not integers', function() {
      var dimRow = {seq:"ABC", pieceCnt:"1", inspectorDimensions: { width:"10.7", length:"12", height:"13"} }
      expect(ds.validateDimRow(dimRow)).toBe(false)
      dimRow.pieceCnt = "ABC"
      dimRow.seq = "1"
      expect(ds.validateDimRow(dimRow)).toBe(false)
    })

    it('Returns false if at least one measurement is not a number', function() {
      var dimRow = {seq:"1", pieceCnt:"1", inspectorDimensions: { width:"10.7", length:"ABC", height:"13.2"} }
      expect(ds.validateDimRow(dimRow)).toBe(false)
      dimRow.inspectorDimensions.length = "10.ee3";
      expect(ds.validateDimRow(dimRow)).toBe(false)
    })

    it('Returns false if at least one measurement is negative', function() {
      var dimRow = {seq:"1", pieceCnt:"1", inspectorDimensions: { width:"-10.7", length:"12.3", height:"13.2"} }
      expect(ds.validateDimRow(dimRow)).toBe(false)
    })
  })

  describe('addNewDimRows', function() {
    var srcArr;

    beforeEach(function() {
      srcArr = [];
    })

    it('Adds a single row', function() {
      ds.addNewDimRows(1, srcArr)
      expect(srcArr.length).toEqual(1)
    })

    it('Adds multiple rows', function() {
      ds.addNewDimRows(10, srcArr)
      expect(srcArr.length).toEqual(10)
    })

    it('Multiple invocations should maintain unique sequence numbers', function() {
      var allUnique = true
      var seqNums = []
      ds.addNewDimRows(5, srcArr)
      ds.addNewDimRows(5, srcArr)
      angular.forEach(srcArr, function(val) {
        if(seqNums.includes(val.seq)) {
          allUnique = false;
        }
      })
      expect(allUnique).toEqual(true)
    })
  })

  describe('calculateDimDerivatives', function() {
    it('results should match expected value using strings', function() {
      var dimSrc = {pieceCnt: "1", seq: "1", inspectorDimensions: { length: "12", width: "12", height: "12" }};
      var results = ds.calculateDimDerivatives([dimSrc], 100)
      expect(results.volume).toEqual((1).toFixed(2))
      expect(results.density).toEqual((100).toFixed(2))
    })

    it('results should match expected value using numbers', function() {
      var dimSrc = {pieceCnt: "1", seq: "1", inspectorDimensions: { length: 12, width: 12, height: 12 }};
      var results = ds.calculateDimDerivatives([dimSrc], 100)
      expect(results.volume).toEqual((1).toFixed(2))
      expect(results.density).toEqual((100).toFixed(2))
    })
  })
})
