'use strict';

describe('Services: AreaSelection', function() {
  beforeEach(module('frontendApp'));

  var AreaSelection, $rootScope, $httpBackend;
  var mdl;

  beforeEach(function() {
    inject(function($injector) {
      AreaSelection = $injector.get('AreaSelection');
      $httpBackend = $injector.get('$httpBackend');
      $rootScope = $injector.get('$rootScope');
    });

    mdl = AreaSelection.getModel();
    jasmine.getJSONFixtures().fixturesPath = 'base/app/scripts/mappings';
    $httpBackend.whenGET('scripts/mappings/geo-tree.json').respond(getJSONFixture('geo-tree.json'));
  });

  it('should instantiate empty selection models', function() {
    expect(mdl._selected.areas).toEqual({});
  });

  it('should allow adding areas', function() {
    mdl.addArea('a01');
    $httpBackend.flush();
    $rootScope.$apply();
    expect(mdl._selected.areas).toEqual({a01: true});
  });

  it('should handle uppercase areas', function() {
    mdl.addArea('A01');
    $httpBackend.flush();
    $rootScope.$apply();
    expect(mdl._selected.areas).toEqual({a01: true});
  });

  it('should handle multiple areas', function() {
    mdl.addArea(['a02', 'a03']);
    $httpBackend.flush();
    $rootScope.$apply();
    expect(mdl._selected.areas).toEqual({a03: true, a02: true});
  });

  it('should handle duplicates', function() {
    mdl.addArea('a01');
    $httpBackend.flush();
    $rootScope.$apply();
    expect(mdl._selected.areas).toEqual({a01: true});

    mdl.addArea('a01');
    $rootScope.$apply();
    expect(mdl._selected.areas).toEqual({a01: true});
  });

  it('should throw on nonexistant areas', function() {
    var nonexistant = function() {
      mdl.addArea('x');
      $httpBackend.flush();
      $rootScope.$apply();
    };
    expect(nonexistant).toThrow();
  });

  it('should allow adding districts', function() {
    mdl.addDistrict('a');
    $httpBackend.flush();
    $rootScope.$apply();
    expect(mdl._selected.districts).toEqual({a: true});
  });

  it('should handle uppercase districts', function() {
    mdl.addDistrict('A');
    $httpBackend.flush();
    $rootScope.$apply();
    expect(mdl._selected.districts).toEqual({a: true});
  });

  it('should handle arrays of districts', function() {
    mdl.addDistrict(['b', 'c']);
    $httpBackend.flush();
    $rootScope.$apply();
    expect(mdl._selected.districts).toEqual({b: true, c: true});
  });

  it('should handle duplicate districts', function() {
    // duplicates
    mdl.addDistrict('a');
    $httpBackend.flush();
    $rootScope.$apply();
    expect(mdl._selected.districts).toEqual({a: true});
    mdl.addDistrict('a');
    $rootScope.$apply();
    expect(mdl._selected.districts).toEqual({a: true});
  });

  it('should allow adding regions', function() {
    mdl.addRegion('hk');
    $httpBackend.flush();
    $rootScope.$apply();
    expect(mdl._selected.regions).toEqual({hk: true});
  });

  it('should allow adding uppercase regions', function() {
    mdl.addRegion('HK');
    $httpBackend.flush();
    $rootScope.$apply();
    expect(mdl._selected.regions).toEqual({hk: true});
  });

  it('should allow adding multiple regions', function() {
    mdl.addRegion(['hk', 'kl']);
    $httpBackend.flush();
    $rootScope.$apply();
    expect(mdl._selected.regions).toEqual({hk: true, kl: true});
  });

  it('should handle duplicate regions', function() {
    mdl.addRegion('hk');
    $httpBackend.flush();
    $rootScope.$apply();
    expect(mdl._selected.regions).toEqual({hk: true});
    mdl.addRegion('hk');
    $rootScope.$apply();
    expect(mdl._selected.regions).toEqual({hk: true});
  });

  it('should throw on nonexistant region', function() {
    var nonexistant = function() {
      mdl.addRegion('xx');
    };

    expect(nonexistant).toThrow();
  });

  it('selectedAreas returns areas', function() {
    mdl.selected.areas = {a01: true, b01: true};
    expect(mdl.selectedAreas()).toEqual(['a01', 'b01']);
  });

  it('selectedAreas expands districts', function() {
    mdl._selected.districts = {a: true};
    expect(mdl.selectedAreas()).toEqual(_.sortBy(["a08", "a09", "a02", "a03", "a01", "a06", "a07", "a04", "a05", "a15", "a14", "a11", "a10", "a13", "a12"]));
  });

  it('selectedAreas expands regions', function() {
    mdl._selected.regions = {hk: true};
    expect(mdl.selectedAreas()).toEqual();
  });

  it('selectedAreas merges districts, regions, and areas', function() {
    expect(true).toBeFalsy();
  });

  it('should clear selection', function() {
  });

});
