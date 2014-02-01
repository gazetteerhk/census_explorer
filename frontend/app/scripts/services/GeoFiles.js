
angular.module('frontendApp').factory('GeoFiles', ['$http', '$q', '$cacheFactory', function($http, $q, $cacheFactory) {
  /*
   * Service that wraps the fetching and preparing of TopoJSON / GeoJSON files
   */

  // TODO: Actually should use a resource here, and use the built in caching provided by $http

  var svc = {};
  svc._cache = $cacheFactory('GeoFiles');

  svc.getAreas = function() {
    var deferred = $q.defer();
    var cacheResult = svc._cache.get('areas');

    if (_.isUndefined(cacheResult)) {
      $http.get("scripts/geo/ca_polygon.topo.json").success(function(data, status) {
        var geo_data = topojson.feature(data, data.objects['ca_polygon.geo']);
        svc._cache.put('areas', geo_data);
        deferred.resolve(geo_data)
      });
    } else {
      deferred.resolve(cacheResult);
    }

    return deferred.promise;
  };

  svc.getDistricts = function() {
    var deferred = $q.defer();
    var cacheResult = svc._cache.get('districts');

    if (_.isUndefined(cacheResult)) {
      $http.get("scripts/geo/dc_polygon.topo.json").success(function(data, status) {
        var geo_data = topojson.feature(data, data.objects['dc_polygon.geo']);
        svc._cache.put('districts', geo_data);
        deferred.resolve(geo_data)
      });
    } else {
      deferred.resolve(cacheResult);
    }

    return deferred.promise;
  };

  return svc;
}]);