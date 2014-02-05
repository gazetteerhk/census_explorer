'use strict';

describe('Services: Mappings', function() {

  beforeEach(module('frontendApp'));

  var Mappings;

  beforeEach(function() {
    inject(function($injector) {
      Mappings = $injector.get('Mappings');
    });
  });

  it('getAreasFromDistrict returns the areas in a district', function() {
    var res = Mappings.getAreasFromDistrict('A');
    expect(res).toEqual(['a01', 'a02', 'a03', 'a04', 'a05', 'a06', 'a07', 'a08', 'a09', 'a10', 'a11', 'a12', 'a13', 'a14', 'a15']);

    res = undefined;
    res = Mappings.getAreasFromDistrict('a');
    expect(res).toEqual(['a01', 'a02', 'a03', 'a04', 'a05', 'a06', 'a07', 'a08', 'a09', 'a10', 'a11', 'a12', 'a13', 'a14', 'a15']);

    var nonexistant = function() {
      Mappings.getAreasFromDistrict('x');
    };

    expect(nonexistant).toThrow();
  });

  it('getDistrictFromArea returns parent district', function() {
    // This is pretty simple, just get the first letter of the district code, but we structure with a promise for consistency
    var res = Mappings.getDistrictFromArea('a01');
    expect(res).toEqual('a');

    var nonexistant = function() {
      Mappings.getDistrictFromArea('x02');
    };
    expect(nonexistant).toThrow();
  });

  it('getDistrictsFromRegion returns the districts in a region', function() {
    var res = Mappings.getDistrictsFromRegion('hk');
    expect(res).toEqual(['a', 'b', 'c',  'd']);

    res = undefined;
    res = Mappings.getDistrictsFromRegion('HK');
    expect(res).toEqual(['a', 'b', 'c',  'd']);

    var nonexistant = function() {
      Mappings.getDistrictsFromRegion('x');
    };
    expect(nonexistant).toThrow();

  });

  it('getRegionFromDistricts returns the parent region', function() {
    var res = Mappings.getRegionFromDistrict('a');
    expect(res).toEqual('hk');

    res = undefined;
    res = Mappings.getRegionFromDistrict('A');
    expect(res).toEqual('hk');


    var nonexistant = function() {
      Mappings.getRegionFromDistrict('x');
    };

    expect(nonexistant).toThrow();
  });

});
