'use strict';

/*
 * Mappings for referencing between regions, districts, and areas.  Also includes lists of tables and columns.
 * Basically a set of metadata
 */

angular.module('frontendApp').factory('Mappings', ['$http', '$q', function($http, $q) {
  var svc = {};
  svc._data = {
    districts: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'q', 'r', 's', 't'],
    regions: ['hk', 'nt', 'kl']
  };

  // Load GeoTree data
  var loadGeoTree = function() {
    var promise = $http.get('scripts/mappings/geo-tree.json', {cache: true}).success(function(data) {
      svc._data.geoTree = data;
      svc._data.areas = _.sortBy(_.flatten(_.map(_.values(data), _.values)));
    });
    return promise;
  };
  loadGeoTree();

  // Region to Districts
  var _getDistrictsFromRegion = function(region) {
    region = region.toLowerCase();
    if (_.isUndefined(svc._data.geoTree[region])) {
      throw String(region) + ' is not a valid region';
    } else {
      return _.keys(svc._data.geoTree[region]);
    }
  };

  svc.getDistrictsFromRegion = function(region) {
    var deferred = $q.defer();
    if (_.isUndefined(svc._data.geoTree)) {
      loadGeoTree().then(function() {
        deferred.resolve(_getDistrictsFromRegion(region));
      });
    } else {
      deferred.resolve(_getDistrictsFromRegion(region));
    }

    return deferred.promise;
  };

  // Districts to Region
  var _getRegionFromDistrict = function(district) {
    var this_region;
    district = district.toLowerCase();
    for (var i = 0; i < svc._data.regions.length; i++) {
      this_region = svc._data.regions[i];
      if (_.contains(_.keys(svc._data.geoTree[this_region]), district)) {
        return this_region;
      }
    }

    throw String(district) + ' is not a valid district';
  };

  svc.getRegionFromDistrict = function(district) {
    var deferred = $q.defer()
    if (_.isUndefined(svc._data.geoTree)) {
      loadGeoTree().then(function() {
        deferred.resolve(_getRegionFromDistrict(district));
      });
    } else {
      deferred.resolve(_getRegionFromDistrict(district));
    }

    return deferred.promise;
  };

  // District from Area
  // Simply the first letter of the code, but structure as a promise for consistency
  svc.getDistrictFromArea = function(area) {
    var district = area.toLowerCase().charAt(0);
    if (!_.contains(svc._data.districts, district)) {
      throw String(district) + ' is not a valid district';
    } else {
      var deferred = $q.defer();
      deferred.resolve(district);
      return deferred.promise;
    }

  };

  // Areas from District
  var _getAreasFromDistrict = function(district) {
    district = district.toLowerCase();
    var region = _getRegionFromDistrict(district);

    return svc._data.geoTree[region][district];
  };

  svc.getAreasFromDistrict = function(district) {
    var deferred = $q.defer();
    if (_.isUndefined(svc._data.geoTree)) {
      loadGeoTree().then(function() {
        deferred.resolve(_getAreasFromDistrict(district));
      });
    } else {
      deferred.resolve(_getAreasFromDistrict(district));
    }

    return deferred.promise;
  };

  svc.getAllAreas = function() {
    var deferred = $q.defer();
    if (_.isUndefined(svc._data.geoTree)) {
      loadGeoTree().then(function() {
        deferred.resolve(svc._data.areas);
      });
    } else {
      deferred.resolve(svc._data.areas);
    }
    return deferred.promise;
  };


  return svc;
}]);