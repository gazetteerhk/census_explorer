'use strict';

describe('Services: GeoMappings', function() {

  beforeEach(module('frontendApp'));

  var GeoMappings;

  beforeEach(function() {
    inject(function($injector) {
      GeoMappings = $injector.get('GeoMappings');
    });
  });

  it('getAreasFromDistrict returns the areas in a district', function() {
    var res = GeoMappings.getAreasFromDistrict('A');
    expect(res).toEqual(['a01', 'a02', 'a03', 'a04', 'a05', 'a06', 'a07', 'a08', 'a09', 'a10', 'a11', 'a12', 'a13', 'a14', 'a15']);

    res = undefined;
    res = GeoMappings.getAreasFromDistrict('a');
    expect(res).toEqual(['a01', 'a02', 'a03', 'a04', 'a05', 'a06', 'a07', 'a08', 'a09', 'a10', 'a11', 'a12', 'a13', 'a14', 'a15']);

    var nonexistant = function() {
      GeoMappings.getAreasFromDistrict('x');
    };

    expect(nonexistant).toThrow();
  });

  it('getDistrictFromArea returns parent district', function() {
    // This is pretty simple, just get the first letter of the district code, but we structure with a promise for consistency
    var res = GeoMappings.getDistrictFromArea('a01');
    expect(res).toEqual('a');

    var nonexistant = function() {
      GeoMappings.getDistrictFromArea('x02');
    };
    expect(nonexistant).toThrow();
  });

  it('getDistrictsFromRegion returns the districts in a region', function() {
    var res = GeoMappings.getDistrictsFromRegion('hk');
    expect(res).toEqual(['a', 'b', 'c',  'd']);

    res = undefined;
    res = GeoMappings.getDistrictsFromRegion('HK');
    expect(res).toEqual(['a', 'b', 'c',  'd']);

    var nonexistant = function() {
      GeoMappings.getDistrictsFromRegion('x');
    };
    expect(nonexistant).toThrow();

  });

  it('getRegionFromDistricts returns the parent region', function() {
    var res = GeoMappings.getRegionFromDistrict('a');
    expect(res).toEqual('hk');

    res = undefined;
    res = GeoMappings.getRegionFromDistrict('A');
    expect(res).toEqual('hk');


    var nonexistant = function() {
      GeoMappings.getRegionFromDistrict('x');
    };

    expect(nonexistant).toThrow();
  });

});
