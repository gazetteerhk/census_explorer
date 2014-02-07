'use strict';

describe('Services: GeoFiles', function() {
  beforeEach(module('frontendApp'));

  var GeoFiles, $httpBackend, $rootScope;

  beforeEach(function() {
    inject(function($injector) {
      GeoFiles = $injector.get('GeoFiles');
      $httpBackend = $injector.get('$httpBackend');
      $rootScope = $injector.get('$rootScope');
    });

    // Load the json fixtures -- need base because Karma adds that path
    jasmine.getJSONFixtures().fixturesPath = 'base/app/scripts/geo';
    $httpBackend.whenGET('scripts/geo/ca_polygon.topo.json').respond(getJSONFixture('ca_polygon.topo.json'));
    $httpBackend.whenGET('scripts/geo/dc_polygon.topo.json').respond(getJSONFixture('dc_polygon.topo.json'));
  });

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should get district councils', function() {
    var councils;
    $httpBackend.expectGET('scripts/geo/dc_polygon.topo.json');
    GeoFiles.getDistricts().then(function(data){councils = data;});
    $httpBackend.flush();

    expect(councils.features.length).toEqual(18);
  });

  it('should cache district results', function() {
    var councils;
    $httpBackend.expectGET('scripts/geo/dc_polygon.topo.json');
    GeoFiles.getDistricts().then(function(){});
    $httpBackend.flush();

    expect(councils).toBeUndefined();

    // Second call shouldn't hit backend
    GeoFiles.getDistricts().then(function(data){councils = data;});
    $rootScope.$apply();
    expect(councils.features.length).toEqual(18);
  });

  it('should get constituency areas', function() {
    var areas;
    $httpBackend.expectGET('scripts/geo/ca_polygon.topo.json');
    GeoFiles.getAreas().then(function(data){areas = data;});
    $httpBackend.flush();

    expect(areas.features.length).toEqual(412);
  });

  it('should cache area results', function() {
    var areas;
    $httpBackend.expectGET('scripts/geo/ca_polygon.topo.json');
    GeoFiles.getAreas().then(function(){});
    $httpBackend.flush();

    expect(areas).toBeUndefined();

    GeoFiles.getAreas().then(function(data){areas = data;});
    $rootScope.$apply();
    expect(areas.features.length).toEqual(412);
  });


});
