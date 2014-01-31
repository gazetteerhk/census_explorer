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
    scope: true,
    restrict: 'AE',
    link: function(scope, elem, attrs) {
      var leafletNode = angular.element(elem.children()[0]);
      // If height is specified, then move it to the template, otherwise use default
      leafletNode.css('height', attrs.height || "300px");

      // Need relative positioning for overlay
      elem.css('position', 'relative');
    },
    controller: ['$scope', 'GeoFiles', function($scope, GeoFiles) {
      // Default initializations
      $scope.defaults =  {
        scrollWheelZoom: false,
        maxZoom: 18
      };

      $scope.center = {
        lat: 22.298,
        lng: 114.151,
        zoom: 12
      };

      var defaultStyle = {
        color: "#2b8cbe",
        fillOpacity: 0.2,
        weight: 3
      };

      var highlightedStyle = {
        color: "#000",
        fillOpacity: 0,
        weight: 6
      };

      var mouseoverHandler = function(e) {
        var layer = e.target;
        console.log(e.target);
        layer.setStyle(highlightedStyle);
        if (!L.Browser.ie && !L.Browser.opera) {
          layer.bringToFront();
        }

        $scope.highlightedFeature = e.target.feature.properties.DCCODE;
      };

      var resetStyle = function(e) {
        // Can't use resetStyle because we don't have access to the GeoJSON object
        var layer = e.target;
        layer.setStyle(defaultStyle);
        delete $scope.highlightedFeature;
      };

      var clickHandler = function(e) {

      };

      var onEachFeature = function(feature, layer) {
        layer.on({
          mouseover: mouseoverHandler,
          mouseout: resetStyle
        });

      };

      // Loading the map layers
      GeoFiles.getDistricts().then(function(data) {
        $scope.districts = {
          data: data,
          style: defaultStyle,
          onEachFeature: onEachFeature // Need handlers here
        };
      });

      GeoFiles.getAreas().then(function(data) {
        $scope.areas = {
          data: data,
          style: undefined // need a function here for each district
        };
      });
    }],
    template: '<leaflet center="center" defaults="defaults" geojson="districts"></leaflet><div class="map-overlay" ng-show="highlightedFeature">{{ highlightedFeature }}</div>'
  }
});