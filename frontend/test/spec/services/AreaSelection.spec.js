'use strict';

describe('Services: AreaSelection', function() {
  beforeEach(module('frontendApp'));

  var AreaSelection, $rootScope, $httpBackend, geoTree;
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
    geoTree = getJSONFixture('geo-tree.json');
  });

  it('should instantiate empty selection models', function() {
    expect(mdl._selected).toEqual({});
  });

  it('should allow adding areas', function() {
    mdl.addArea('a01');
    $httpBackend.flush();
    $rootScope.$apply();
    expect(mdl._selected).toEqual({a01: true});
  });

  it('should handle uppercase areas', function() {
    mdl.addArea('A01');
    $httpBackend.flush();
    $rootScope.$apply();
    expect(mdl._selected).toEqual({a01: true});
  });

  it('should handle multiple areas', function() {
    mdl.addArea(['a02', 'a03']);
    $httpBackend.flush();
    $rootScope.$apply();
    expect(mdl._selected).toEqual({a03: true, a02: true});
  });

  it('should handle duplicates', function() {
    mdl.addArea('a01');
    $httpBackend.flush();
    $rootScope.$apply();
    expect(mdl._selected).toEqual({a01: true});

    mdl.addArea('a01');
    $rootScope.$apply();
    expect(mdl._selected).toEqual({a01: true});
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
    var allAreas;
    mdl.addArea('a');
    $httpBackend.flush();
    $rootScope.$apply();
    var res = {};
    _.forEach(geoTree.hk.a, function(area) {res[area] = true;});
    expect(mdl._selected).toEqual(res);
  });

  it('should handle uppercase districts', function() {
    mdl.addArea('A');
    $httpBackend.flush();
    $rootScope.$apply();
    var res = {};
    _.forEach(geoTree.hk.a, function(area) {res[area] = true;});
    expect(mdl._selected).toEqual(res);
  });

  it('should handle arrays of districts', function() {
    mdl.addArea(['b', 'c']);
    $httpBackend.flush();
    $rootScope.$apply();
    var res = {};
    _.forEach(geoTree.hk.b, function(area) {res[area] = true;});
    _.forEach(geoTree.hk.c, function(area) {res[area] = true;});
    expect(mdl._selected).toEqual(res);
  });

  it('should handle duplicate districts', function() {
    // duplicates
    mdl.addArea('a');
    $httpBackend.flush();
    $rootScope.$apply();
    var res = {};
    _.forEach(geoTree.hk.a, function(area) {res[area] = true;});
    expect(mdl._selected).toEqual(res);
    mdl.addArea('a');
    $rootScope.$apply();
    expect(mdl._selected).toEqual(res);
  });

  it('should allow adding regions', function() {
    mdl.addArea('hk');
    $httpBackend.flush();
    $rootScope.$apply();
    var res = {};
    _.forEach(_.flatten(_.values(geoTree.hk)), function(area) {res[area] = true;});
    expect(mdl._selected).toEqual(res);
  });

  it('should allow adding uppercase regions', function() {
    mdl.addArea('HK');
    $httpBackend.flush();
    $rootScope.$apply();
    var res = {};
    _.forEach(_.flatten(_.values(geoTree.hk)), function(area) {res[area] = true;});
    expect(mdl._selected).toEqual(res);
  });

  it('should allow adding multiple regions', function() {
    mdl.addArea(['hk', 'kl']);
    $httpBackend.flush();
    $rootScope.$apply();
    var res = {};
    _.forEach(_.flatten(_.values(geoTree.hk)), function(area) {res[area] = true;});
    _.forEach(_.flatten(_.values(geoTree.kl)), function(area) {res[area] = true;});
    expect(mdl._selected).toEqual(res);
  });

  it('should handle duplicate regions', function() {
    mdl.addArea('hk');
    $httpBackend.flush();
    $rootScope.$apply();
    var res = {};
    _.forEach(_.flatten(_.values(geoTree.hk)), function(area) {res[area] = true;});
    expect(mdl._selected).toEqual(res);
    mdl.addArea('hk');
    $rootScope.$apply();
    expect(mdl._selected).toEqual(res);
  });

  it('should throw on nonexistant region', function() {
    var nonexistant = function() {
      mdl.addArea('xx');
      $httpBackend.flush();
      $rootScope.$apply();
    };

    expect(nonexistant).toThrow();
  });

  it('selectedAreas returns areas', function() {
    mdl.selected = {a01: true, b01: true};
    expect(mdl.selectedAreas()).toEqual(['a01', 'b01']);
  });

  it('should clear selection', function() {
  });

  it('should remove areas', function() {
  });

  it('should remove districts', function() {
  });

  it('should remove regions', function() {
  });

});
