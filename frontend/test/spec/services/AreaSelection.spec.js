'use strict';

describe('Services: AreaSelection', function() {
  beforeEach(module('frontendApp'));

  var AreaSelection, Mappings;
  var mdl;

  beforeEach(function() {
    inject(function($injector) {
      AreaSelection = $injector.get('AreaSelection');
      Mappings = $injector.get('Mappings');
    });

    mdl = AreaSelection.getModel();
  });

  it('should instantiate empty selection models', function() {
    expect(mdl._selected).toEqual({});
  });

  it('addArea allows adding areas', function() {
    mdl.addArea('a01');
    expect(mdl._selected).toEqual({a01: true});
  });

  it('addArea handles uppercase areas', function() {
    mdl.addArea('A01');
    expect(mdl._selected).toEqual({a01: true});
  });

  it('addArea handles multiple areas', function() {
    mdl.addArea(['a02', 'a03']);
    expect(mdl._selected).toEqual({a03: true, a02: true});
  });

  it('addArea handles duplicates', function() {
    mdl.addArea('a01');
    expect(mdl._selected).toEqual({a01: true});

    mdl.addArea('a01');
    expect(mdl._selected).toEqual({a01: true});
  });

  it('addArea throws on nonexistant areas', function() {
    var nonexistant = function() {
      mdl.addArea('x');
    };
    expect(nonexistant).toThrow();
  });

  it('addArea allows adding districts', function() {
    var allAreas;
    mdl.addArea('a');
    var res = {};
    _.forEach(Mappings._data.geoTree.hk.a, function(area) {res[area] = true;});
    expect(mdl._selected).toEqual(res);
  });

  it('addArea handles uppercase districts', function() {
    mdl.addArea('A');
    var res = {};
    _.forEach(Mappings._data.geoTree.hk.a, function(area) {res[area] = true;});
    expect(mdl._selected).toEqual(res);
  });

  it('addArea handles arrays of districts', function() {
    mdl.addArea(['b', 'c']);
    var res = {};
    _.forEach(Mappings._data.geoTree.hk.b, function(area) {res[area] = true;});
    _.forEach(Mappings._data.geoTree.hk.c, function(area) {res[area] = true;});
    expect(mdl._selected).toEqual(res);
  });

  it('addArea handles duplicate districts', function() {
    // duplicates
    mdl.addArea('a');
    var res = {};
    _.forEach(Mappings._data.geoTree.hk.a, function(area) {res[area] = true;});
    expect(mdl._selected).toEqual(res);
    mdl.addArea('a');
    expect(mdl._selected).toEqual(res);
  });

  it('addArea allows adding regions', function() {
    mdl.addArea('hk');
    var res = {};
    _.forEach(_.flatten(_.values(Mappings._data.geoTree.hk)), function(area) {res[area] = true;});
    expect(mdl._selected).toEqual(res);
  });

  it('addArea allows adding uppercase regions', function() {
    mdl.addArea('HK');
    var res = {};
    _.forEach(_.flatten(_.values(Mappings._data.geoTree.hk)), function(area) {res[area] = true;});
    expect(mdl._selected).toEqual(res);
  });

  it('addArea allows adding multiple regions', function() {
    mdl.addArea(['hk', 'kl']);
    var res = {};
    _.forEach(_.flatten(_.values(Mappings._data.geoTree.hk)), function(area) {res[area] = true;});
    _.forEach(_.flatten(_.values(Mappings._data.geoTree.kl)), function(area) {res[area] = true;});
    expect(mdl._selected).toEqual(res);
  });

  it('addArea handles duplicate regions', function() {
    mdl.addArea('hk');
    var res = {};
    _.forEach(_.flatten(_.values(Mappings._data.geoTree.hk)), function(area) {res[area] = true;});
    expect(mdl._selected).toEqual(res);
    mdl.addArea('hk');
    expect(mdl._selected).toEqual(res);
  });

  it('addArea handles mixed types', function() {
    mdl.addArea(['a01', 'b'])
    var res = {a01: true};
    _.forEach(_.values(Mappings._data.geoTree.hk.b), function(area) {res[area] = true;});
    expect(mdl._selected).toEqual(res);
  });

  it('should throw on nonexistant region', function() {
    var nonexistant = function() {
      mdl.addArea('xx');
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
    expect(mdl._selected).toEqual({b01: true});
  });

  it('removeArea removes regions', function() {
    mdl._selected = {a01: true, b01: true, c01: true, t01: true};
    mdl.removeArea(['hk']);
    expect(mdl._selected).toEqual({t01: true});
  });

  it('removesArea removes mixed types', function() {
    mdl._selected = {a01: true, b01: true, c01: true};
    mdl.removeArea(['a01', 'b']);
    expect(mdl._selected).toEqual({c01: true});
  });

  it('removeArea does not throw', function() {
    mdl._selected = {a01: true, b01: true, c01: true};
    var nonexistant = function() {
      mdl.removeArea(['a01', 'c01', 'xx']);
      mdl.removeArea('xx')
    };
    expect(nonexistant).not.toThrow();
    expect(mdl._selected).toEqual({b01: true});
  });

  it('isSelected checks if area is selected', function() {
    mdl._selected = {a01: true};
    expect(mdl.isSelected('a01')).toBeTruthy();
    expect(mdl.isSelected('b01')).toBeFalsy();
  });

  /*
  it('isSelected checks if district is selected', function() {
    var selected = {};
    _.forEach(_.values(Mappings._data.geoTree.hk.a), function(area) {selected[area] = true;});
    mdl._selected = selected;
    expect(mdl.isSelected('a')).toBeTruthy();
    expect(mdl.isSelected('b')).toBeFalsy();

    mdl.removeArea('a01');
    expect(mdl.isSelected('a')).toBeFalsy();
  });

  it('isSelected checks if region is selected', function() {
    var selected = {};
    _.forEach(_.flatten(_.values(Mappings._data.geoTree.hk)), function(area) {selected[area] = true;});
    mdl._selected = selected;
    expect(mdl.isSelected('hk')).toBeTruthy();
    expect(mdl.isSelected('kl')).toBeFalsy();

    mdl.removeArea('a01');
    expect(mdl.isSelected('hk')).toBeFalsy();
  });
  */
});
