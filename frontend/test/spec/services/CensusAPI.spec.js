'use strict';

describe("Services: CensusAPI", function() {
  beforeEach(module('frontendApp'));

  var CensusAPI, $httpBackend, $rootScope;
  var q;

  beforeEach(function() {
    inject(function($injector) {
      CensusAPI = $injector.get('CensusAPI');
      $httpBackend = $injector.get('$httpBackend');
      $rootScope = $injector.get('$rootScope');
    });

    $httpBackend.whenGET(CensusAPI.endpointURL).respond('');
  });

  it("instantiates with blank filters", function() {
    q = new CensusAPI.Query();
    _.forOwn(q._filters, function(val) {
      expect(_.keys(val).length).toEqual(0);
    });
  });

  it("instantiates with a filter object", function() {
    var filter = {
      area: ['a01', 'b01']
    };

    q = new CensusAPI.Query(filter);

    var res = _.assign(_.clone(CensusAPI._baseFilters, true), {area: {a01: true, b01: true}});
    expect(q._filters).toEqual(res);
  });

  it("throws on invalid filters during instantiation", function() {
    var filter = {
      area: ['a01', 'b01'],
      foo: 'bar'
    };

    var exception = function() {
      return new CensusAPI.Query(filter);
    };

    expect(exception).toThrow();
  });

  it("add single field filter", function() {
    q = new CensusAPI.Query();

    q.addFilter('area', 'a01');

    var res = _.assign(_.clone(CensusAPI._baseFilters, true), {area: {a01: true}});
    expect(q._filters).toEqual(res);
  });

  it("add single field, multiple value filter", function() {
    q = new CensusAPI.Query();

    q.addFilter('area', ['a01', 'a02']);

    var res = _.assign(_.clone(CensusAPI._baseFilters, true), {area: {a01: true, a02: true}});
    expect(q._filters).toEqual(res);
  });

  it("add multiple field filter", function() {
    var filter = {
      area: ['a01', 'b01']
    };
    q = new CensusAPI.Query();

    q.addFilter(filter);

    var res = _.assign(_.clone(CensusAPI._baseFilters, true), {area: {a01: true, b01: true}});
    expect(q._filters).toEqual(res);
  });

  it("add projector", function() {
    q = new CensusAPI.Query();

    q.addFilter('projector', 'area');
    expect(q._filters.projector).toEqual({area: true});

    q.addFilter('projector', 'row');
    expect(q._filters.projector).toEqual({area: true, row: true});
  });

  it("fetches and unpacks options", function() {

  });

  it("fetches and unpacks data", function() {

  });
});
