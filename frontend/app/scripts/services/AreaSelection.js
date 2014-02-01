'use strict';

/*
 * Service that creates model instances for handling Constituency Area / District selection logic
 */

angular.module('frontendApp').factory('AreaSelection', ['Mappings', function(Mappings) {
  var svc = {};

  var AreaModel = function() {
    // Use objects to store the selected objects as keys, so as to prevent duplicates
    this._selected = {
      districts: {},
      areas: {},
      regions: {},
    };
  };

  // Returns a list of the selected areas.
  AreaModel.prototype.selectedAreas = function() {
    var res = [];
    // Collect areas from regions
    _.forOwn(this._selected.regions, function(region) {

    });

    // Collect areas from district
    _.forOwn(this._selected.districts, function(district) {
    });

    return res;
  };

  var _addArea = function(self, area) {
    area = area.toLowerCase();
    Mappings.getAllAreas().then(function(allAreas) {
      if (_.has(self._selected.areas, area)) {
        return;
      }

      if (_.indexOf(allAreas, area, true) > -1) {
        self._selected.areas[area] = true;
      } else {
        throw String(area) + ' is not a valid area';
      }
    });
  };

  AreaModel.prototype.addArea = function(area) {
    if (_.isArray(area)) {
      _.forEach(area, _.partial(_addArea, this));
    } else {
      _addArea(this, area);
    }
  };

  svc.AreaModel = AreaModel;

  svc.getModel = function() {
    return new AreaModel();
  };

  return svc;
}]);