
angular.module('frontendApp').factory('GeoFiles', ['$http', '$q', function($http, $q) {
  /*
   * Service that wraps the fetching and preparing of TopoJSON / GeoJSON files
   */
  var svc = {};

  svc.getAreas = function() {
    var deferred = $q.defer();
    $http.get("scripts/geo/ca_polygon.topo.json").success(function(data, status) {
      var geo_data = topojson.feature(data, data.objects['ca_polygon.geo']);
      deferred.resolve(geo_data)
    });

    return deferred.promise;
  };

  svc.getDistricts = function() {
    var deferred = $q.defer();
    $http.get("scripts/geo/dc_polygon.topo.json").success(function(data, status) {
      var geo_data = topojson.feature(data, data.objects['dc_polygon.geo']);
      deferred.resolve(geo_data)
    });

    return deferred.promise;
  };

  return svc;
}]);