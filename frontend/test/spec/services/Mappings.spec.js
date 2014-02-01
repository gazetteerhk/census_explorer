'use strict';

describe('Services: Mappings', function() {

  beforeEach(module('frontendApp'));

  var Mappings, $httpBackend, $rootScope;

  beforeEach(function() {
    inject(function($injector) {
      Mappings = $injector.get('Mappings');
      $httpBackend = $injector.get('$httpBackend');
      $rootScope = $injector.get('$rootScope');
    });
    jasmine.getJSONFixtures().fixturesPath = 'base/app/scripts/mappings';
    $httpBackend.whenGET('scripts/mappings/geo-tree.json').respond(getJSONFixture('geo-tree.json'));
  });

  it('getAreasFromDistrict returns the areas in a district', function() {
    var res;
    Mappings.getAreasFromDistrict('A').then(function(data) {res = data;});
    $httpBackend.flush();
    $rootScope.$apply();
    expect(res).toEqual(["a08", "a09", "a02", "a03", "a01", "a06", "a07", "a04", "a05", "a15", "a14", "a11", "a10", "a13", "a12"]);

    res = undefined;
    Mappings.getAreasFromDistrict('a').then(function(data) {res = data;});
    $rootScope.$apply();
    expect(res).toEqual(["a08", "a09", "a02", "a03", "a01", "a06", "a07", "a04", "a05", "a15", "a14", "a11", "a10", "a13", "a12"]);

    var nonexistant = function() {
      Mappings.getAreasFromDistrict('x');
      $rootScope.$apply();
    };

    expect(nonexistant).toThrow();
  });

  it('getDistrictFromArea returns parent district', function() {
    // This is pretty simple, just get the first letter of the district code, but we structure with a promise for consistency
    var res;
    Mappings.getDistrictFromArea('a01').then(function(data) {res = data;});
    $rootScope.$apply();
    expect(res).toEqual('a');

    var nonexistant = function() {
      Mappings.getDistrictFromArea('x02');
      $rootScope.$apply();
    };
    expect(nonexistant).toThrow();
  });

  it('getDistrictsFromRegion returns the districts in a region', function() {
    var res;
    Mappings.getDistrictsFromRegion('hk').then(function(data) {res = data;});
    $httpBackend.flush();
    $rootScope.$apply();
    expect(res).toEqual(['a', 'b', 'c',  'd']);

    res = undefined;
    Mappings.getDistrictsFromRegion('HK').then(function(data) {res = data;});
    $rootScope.$apply();
    expect(res).toEqual(['a', 'b', 'c',  'd']);

    var nonexistant = function() {
      Mappings.getDistrictsFromRegion('x');
      $rootScope.$apply();
    };
    expect(nonexistant).toThrow();

  });

  it('getRegionFromDistricts returns the parent region', function() {
    var res;
    Mappings.getRegionFromDistrict('a').then(function(data) {res = data;});
    $httpBackend.flush();
    $rootScope.$apply();
    expect(res).toEqual('hk');

    res = undefined;
    Mappings.getRegionFromDistrict('A').then(function(data) {res = data;});
    $rootScope.$apply();
    expect(res).toEqual('hk');


    var nonexistant = function() {
      Mappings.getRegionFromDistrict('x');
      $rootScope.$apply();
    };

    expect(nonexistant).toThrow();
  });

});
