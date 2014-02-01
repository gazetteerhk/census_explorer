'use strict';

/*
 * Service that creates model instances for handling Constituency Area / District selection logic
 */

angular.module('frontendApp').factory('AreaSelection', ['Mappings', function(Mappings) {
  var AREA = 0;
  var DISTRICT = 1;
  var REGION = 2;

  var svc = {};

  var AreaModel = function() {
    // Use objects to store the selected objects as keys, so as to prevent duplicates
    this._selected = {
    };
  };

  // Returns a list of the selected areas.
  AreaModel.prototype.selectedAreas = function() {
    return _.sortBy(_.keys(this._selected));
  };

  var _getType = function(area) {
    // Determines whether the area is a region, district, or area
    // Actually not a guarantee that it is an area -- could possible not be a valid area

    area = area.toLowerCase();
    if (_.contains(Mappings._data.regions, area)) {
      return REGION;
    } else if (_.contains(Mappings._data.districts, area)) {
      return DISTRICT;
    } else {
      return AREA;
    }
  };

  var _addArea = function(self, area) {
    area = area.toLowerCase();
    var areaType = _getType(area);
    if (areaType === REGION) {
      _addRegion(self, area);
    } else if (areaType === DISTRICT) {
      _addDistrict(self, area);
    } else {
      Mappings.getAllAreas().then(function(allAreas) {
        if (_.has(self._selected, area)) {
          return;
        }
        if (_.indexOf(allAreas, area, true) > -1) {
          self._selected[area] = true;
        } else {
          throw String(area) + ' is not a valid area';
        }
      });
    }
  };

  var _addDistrict = function(self, district) {
    district = district.toLowerCase();
    Mappings.getAreasFromDistrict(district).then(function(areas) {
      _.forEach(areas, function(area) {
        self._selected[area] = true;
      });
    });
  };

  var _addRegion = function(self, region) {
    region = region.toLowerCase();
    Mappings.getDistrictsFromRegion(region)
      .then(function(districts) {
        return districts
      })
      .then(function(districts) {
        _.forEach(districts, _.partial(_addDistrict, self))
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