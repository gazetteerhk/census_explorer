'use strict';

/*
 * @name hkMap
 * @ngdoc directive
 * @description Directive for a map of Hong Kong with GeoJSON layers for district councils and constituency areas
 * @scope
 *
 *
 */

angular.module('frontendApp').directive('hkMap', function() {

  return {
    priority: '100',
    scope: true,
    restrict: 'AE',
    link: function(scope, elem, attrs) {
      var leafletNode = angular.element(elem.children()[0]);
      // If height is specified, then move it to the template, otherwise use default
      leafletNode.css('height', attrs.height || "300px");
    },
    controller: ['$scope', 'GeoFiles', function($scope, GeoFiles) {
      $scope.defaults =  {
        scrollWheelZoom: false,
        maxZoom: 18
      };

      $scope.center = {
        lat: 22.298,
        lng: 114.151,
        zoom: 12
      };

      GeoFiles.getDistricts().then(function(data) {$scope.geojson = {data: data};});
    }],
    template: '<leaflet center="center" defaults="defaults" geojson="geojson"></leaflet>'
  }
});