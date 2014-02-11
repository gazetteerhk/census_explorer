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

    q.addParam('area', 'a01');

    var res = _.assign(_.clone(CensusAPI._baseFilters, true), {area: {a01: true}});
    expect(q._filters).toEqual(res);
  });

  it("add single field, multiple value filter", function() {
    q = new CensusAPI.Query();

    q.addParam('area', ['a01', 'a02']);

    var res = _.assign(_.clone(CensusAPI._baseFilters, true), {area: {a01: true, a02: true}});
    expect(q._filters).toEqual(res);
  });

  it("add multiple field filter", function() {
    var filter = {
      area: ['a01', 'b01']
    };
    q = new CensusAPI.Query();

    q.addParam(filter);

    var res = _.assign(_.clone(CensusAPI._baseFilters, true), {area: {a01: true, b01: true}});
    expect(q._filters).toEqual(res);
  });

  it("add projector", function() {
    q = new CensusAPI.Query();

    q.addParam('projector', 'area');
    expect(q._filters.projector).toEqual({area: true});

    q.addParam('projector', 'row');
    expect(q._filters.projector).toEqual({area: true, row: true});
  });

  it("clones itself", function() {
    var filter = {
      area: ['a01', 'b01']
    };
    var q1 = new CensusAPI.Query(filter);
    var q2 = q1.clone();

    expect(q1._filters).not.toBe(q2._filters);
    expect(q1._filters).toEqual(q2._filters);
    q2.addParam('table', 0);
    expect(q1._filters).not.toEqual(q2._filters);
  });

  it('_joinData joins data hash', function() {
    var data = {
      area: ['a01', 'a02'],
      value: [1, 2],
      table: [1, 1]
    };
    var expected_res = [
      {area: 'a01', value: 1, table: 1},
      {area: 'a02', value: 2, table: 1}
    ];

    var res = CensusAPI._joinData(data);

    expect(res).toEqual(expected_res);
  });

  iit('uses comma separated query parameters', function() {
    var filter = {
      area: ['a01', 'a02'],
      table: '1'
    };

    $httpBackend.expectGET(CensusAPI.endpointURL + '?area=a01,a02&table=1').respond('');

    q = new CensusAPI.Query(filter);
    q.fetch();
    $httpBackend.flush();
  })

});
