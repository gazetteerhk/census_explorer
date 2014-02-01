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

  it('addArea allows adding areas', function() {
    mdl.addArea('a01');
    $httpBackend.flush();
    $rootScope.$apply();
    expect(mdl._selected).toEqual({a01: true});
  });

  it('addArea handles uppercase areas', function() {
    mdl.addArea('A01');
    $httpBackend.flush();
    $rootScope.$apply();
    expect(mdl._selected).toEqual({a01: true});
  });

  it('addArea handles multiple areas', function() {
    mdl.addArea(['a02', 'a03']);
    $httpBackend.flush();
    $rootScope.$apply();
    expect(mdl._selected).toEqual({a03: true, a02: true});
  });

  it('addArea handles duplicates', function() {
    mdl.addArea('a01');
    $httpBackend.flush();
    $rootScope.$apply();
    expect(mdl._selected).toEqual({a01: true});

    mdl.addArea('a01');
    $rootScope.$apply();
    expect(mdl._selected).toEqual({a01: true});
  });

  it('addArea throws on nonexistant areas', function() {
    var nonexistant = function() {
      mdl.addArea('x');
      $httpBackend.flush();
      $rootScope.$apply();
    };
    expect(nonexistant).toThrow();
  });

  it('addArea allows adding districts', function() {
    var allAreas;
    mdl.addArea('a');
    $httpBackend.flush();
    $rootScope.$apply();
    var res = {};
    _.forEach(geoTree.hk.a, function(area) {res[area] = true;});
    expect(mdl._selected).toEqual(res);
  });

  it('addArea handles uppercase districts', function() {
    mdl.addArea('A');
    $httpBackend.flush();
    $rootScope.$apply();
    var res = {};
    _.forEach(geoTree.hk.a, function(area) {res[area] = true;});
    expect(mdl._selected).toEqual(res);
  });

  it('addArea handles arrays of districts', function() {
    mdl.addArea(['b', 'c']);
    $httpBackend.flush();
    $rootScope.$apply();
    var res = {};
    _.forEach(geoTree.hk.b, function(area) {res[area] = true;});
    _.forEach(geoTree.hk.c, function(area) {res[area] = true;});
    expect(mdl._selected).toEqual(res);
  });

  it('addArea handles duplicate districts', function() {
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

  it('addArea allows adding regions', function() {
    mdl.addArea('hk');
    $httpBackend.flush();
    $rootScope.$apply();
    var res = {};
    _.forEach(_.flatten(_.values(geoTree.hk)), function(area) {res[area] = true;});
    expect(mdl._selected).toEqual(res);
  });

  it('addArea allows adding uppercase regions', function() {
    mdl.addArea('HK');
    $httpBackend.flush();
    $rootScope.$apply();
    var res = {};
    _.forEach(_.flatten(_.values(geoTree.hk)), function(area) {res[area] = true;});
    expect(mdl._selected).toEqual(res);
  });

  it('addArea allows adding multiple regions', function() {
    mdl.addArea(['hk', 'kl']);
    $httpBackend.flush();
    $rootScope.$apply();
    var res = {};
    _.forEach(_.flatten(_.values(geoTree.hk)), function(area) {res[area] = true;});
    _.forEach(_.flatten(_.values(geoTree.kl)), function(area) {res[area] = true;});
    expect(mdl._selected).toEqual(res);
  });

  it('addArea handles duplicate regions', function() {
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

  it('addArea handles mixed types', function() {
    mdl.addArea(['a01', 'b'])
    $httpBackend.flush();
    $rootScope.$apply();
    var res = {a01: true};
    _.forEach(_.values(geoTree.hk.b), function(area) {res[area] = true;});
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
    mdl._selected = {a01: true, b01: true};
    expect(mdl.selectedAreas()).toEqual(['a01', 'b01']);
  });

  it('clearSelected clears selection', function() {
    mdl._selected = {a01: true, b01: true};
    expect(mdl.selectedAreas()).toEqual(['a01', 'b01']);

    mdl.clearSelected();
    expect(mdl._selected).toEqual({});
  });

  it('removeArea removes single area', function() {
    mdl._selected = {a01: true, b01: true};
    mdl.removeArea('a01');
    expect(mdl._selected).toEqual({b01: true});
  });

  it('removeArea removes multiple areas', function() {
    mdl._selected = {a01: true, b01: true, c01: true};
    mdl.removeArea(['a01', 'c01']);
    expect(mdl._selected).toEqual({b01: true});
  });

  it('removeArea removes districts', function() {
    mdl._selected = {a01: true, b01: true, c01: true};
    mdl.removeArea(['a', 'c']);
    $httpBackend.flush();
    $rootScope.$apply();
    expect(mdl._selected).toEqual({b01: true});
  });

  it('removeArea removes regions', function() {
    mdl._selected = {a01: true, b01: true, c01: true, t01: true};
    mdl.removeArea(['hk']);
    $httpBackend.flush();
    $rootScope.$apply();
    expect(mdl._selected).toEqual({t01: true});
  });

  it('removesArea removes mixed types', function() {
    mdl._selected = {a01: true, b01: true, c01: true};
    mdl.removeArea(['a01', 'b']);
    $httpBackend.flush();
    $rootScope.$apply();
    expect(mdl._selected).toEqual({c01: true});
  });

  it('removeArea does not throw', function() {
    mdl._selected = {a01: true, b01: true, c01: true};
    var nonexistant = function() {
      mdl.removeArea(['a01', 'c01', 'xx']);
      mdl.removeArea('xx')
      $httpBackend.flush();
      $rootScope.$apply();
    };
    expect(nonexistant).not.toThrow();
    expect(mdl._selected).toEqual({b01: true});
  });

});
