'use strict';

/*
 * Mappings for referencing between regions, districts, and areas.  Also includes lists of tables and columns.
 * Basically a set of metadata
 */

angular.module('frontendApp').factory('Mappings', ['$http', '$q', function($http, $q) {
  var svc = {};
  svc._data = {};

  // Load the data
  var loadGeoTree = function() {
    var promise = $http.get('scripts/mappings/geo-tree.json', {cache: true}).success(function(data) {
      svc._data.geoTree = data;
    });
    return promise;
  };
  loadGeoTree();

  // Region to Districts
  var _getDistrictFromRegion = function(region) {
    region = region.toLowerCase();
    if (_.isUndefined(svc._data.geoTree[region])) {
      throw String(region) + ' is not a valid region';
    } else {
      return _.keys(svc._data.geoTree[region]);
    }
  };

  svc.getDistrictsFromRegion = function(region) {
    var deferred = $q.defer();
    var promise = deferred.promise;
    if (_.isUndefined(svc._data.geoTree)) {
      loadGeoTree().then(function() {
        deferred.resolve(_getDistrictFromRegion(region));
      });
    } else {
      deferred.resolve(_getDistrictFromRegion(region));
    }

    return promise;
  };

  // Districts to Areas
  svc.getAreasFromDistrict = function(district) {

  };

  return svc;
}]);