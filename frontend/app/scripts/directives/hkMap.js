'use strict';

/*
 * @ngdoc directive
 * @name hkMap
 * @description
 * Directive for a map of Hong Kong with GeoJSON layers for district councils and constituency areas
 *
 * @param {string} [height="300px"] Height of the map.
 * @param {class} class Use the class declaration to set width in Bootstrap column system.
 * @param {object} selectedItems Object that stores which elements in the map are selected
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
    controller: ['$scope', 'GeoFiles', '$attrs', 'AreaSelection', '$parse', '$element', function($scope, GeoFiles, $attrs, AreaSelection, $parse, $element) {
      // Default initializations
      $scope.defaults =  {
        scrollWheelZoom: false,
        maxZoom: 18
      };

      if (_.isUndefined($attrs.mapCenter)) {
        $scope.center = {};
      } else {
        $scope.center = $parse($attrs.mapCenter)($scope);
      }

      if (_.isEmpty($scope.center)) {
        angular.extend($scope.center,
          {
            lat: 22.298,
            lng: 114.151,
            zoom: 12
          }
        );
      }

      var defaultStyle = {
        color: "#2b8cbe",
        fillOpacity: 0,
        weight: 3
      };

      var hoverStyle = {
        color: "#000",
        fillColor: "#2b8cbe",
        fillOpacity: 0.2,
        weight: 6
      };

      var selectedStyle = {
        color: "#ff0",
        fillOpacity: 0.2,
        weight: 6
      };

      // Model for tracking selected areas
      if (_.isUndefined($attrs.selectedAreas)) {
        $scope.selectedAreas = AreaSelection.getModel();
      } else {
        $scope.selectedAreas = $parse($attrs.selectedAreas)($scope);
      }

      // Handlers for interaction
      var mouseoverHandler = function(e) {
        var layer = e.target;
        console.log(e.target);
        layer.setStyle(hoverStyle);
        if (!L.Browser.ie && !L.Browser.opera) {
          layer.bringToFront();
        }

        $scope.hoveredFeature = e.target.feature.properties.DCCODE || e.target.feature.properties.CACODE;
      };

      var resetStyle = function(e) {
        // Can't use resetStyle because we don't have access to the GeoJSON object
        var layer = e.target;
        layer.setStyle(defaultStyle);
        $scope.hoveredFeature = undefined;
      };

      var clickHandler = function(e) {
        // When clicked, check if the object is already in the selectedItems hash
        // If it is, apply the defaultStyle and remove it from the hash
        // If it isn't, apply the selectedStyle and add it to the hash
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
        $scope.geojson = $scope.districts;
      });

      GeoFiles.getAreas().then(function(data) {
        $scope.areas = {
          data: data,
          style: defaultStyle,
          onEachFeature: onEachFeature
        };
      });

      // If we zoom in further than >= 14, then switch over to the constituency areas layer
      $scope.$watch('center.zoom', function(newVal, oldVal) {
        if (newVal >= 14) {
          $scope.geojson = $scope.areas;
        } else {
          $scope.geojson = $scope.districts;
        }
      });
    }],
    template: '<leaflet center="center" defaults="defaults" geojson="geojson"></leaflet>' +
      '<div class="map-overlay" ng-show="hoveredFeature">{{ hoveredFeature }}</div><span>{{ center }}</span>'
  }
});