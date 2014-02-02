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
    priority: 10,
    compile: function(elem, attrs) {
      var leafletNode = angular.element(elem.children()[0]);
      // If height is specified, then move it to the template, otherwise use default
      leafletNode.css('height', attrs.height || "300px");

      // Need relative positioning for overlay
      elem.css('position', 'relative');

      // If an id is provided, move the id to the child element;
      // This is so that we can get the map object when we have multiple maps on the page
      if (!_.isUndefined(attrs.mapId)) {
        leafletNode.attr('id', attrs.mapId);
      }
    },
    controller: ['$scope', 'GeoFiles', '$attrs', 'AreaSelection', '$parse', 'leafletData', function($scope, GeoFiles, $attrs, AreaSelection, $parse, leafletData) {
      // Default initializations
      $scope.defaults =  {
        scrollWheelZoom: false,
        maxZoom: 18
      };

      // The zoom level after which areas are drawn
      var AREATHRESHOLD = 14;

      // Center object
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
      // Expose the map object
      // Returns a promise
      $scope.getMap = function() {
        if (!_.isUndefined($attrs.mapId)) {
          return leafletData.getMap($attrs.mapId);
        } else {
          return leafletData.getMap();
        }
      };

      // Styles
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
        fillColor: "#ff0",
        fillOpacity: 0.2,
        weight: 6,
        className: 'map-selected'
      };

      var _isArea = function(feature) {
        // Checks if a feature is an area
        return !_.isUndefined(feature.properties.CACODE);
      };

      // Styler that styles a layer based on whether it is selected or not
      var featureStyler = function(feature) {
        if (_isArea(feature) && $scope.selectedAreas.isSelected(feature.properties.CACODE)) {
          return selectedStyle;
        } else {
          return defaultStyle;
        }
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
        // only change the style if the area is not already selected
        if (!_isTriggeredByArea(e) || !$scope.selectedAreas.isSelected(e.target.feature.properties.CACODE)) {
          layer.setStyle(hoverStyle);
          if (!L.Browser.ie && !L.Browser.opera) {
            layer.bringToFront();
          }
        }

        $scope.hoveredFeature = e.target.feature.properties.DCCODE || e.target.feature.properties.CACODE;
      };

      var resetStyle = function(e) {
        // Can't use resetStyle because we don't have access to the GeoJSON object
        var layer = e.target;
        // Only reset if the area is not selected
        if (!_isTriggeredByArea(e) || !$scope.selectedAreas.isSelected(e.target.feature.properties.CACODE)) {
          layer.setStyle(defaultStyle);
        }
        $scope.hoveredFeature = undefined;
      };

      var _isTriggeredByArea = function(event) {
        // Checks if the event was sent by an area polygon
        return !_.isUndefined(event.target.feature.properties.CACODE);
      };

      var clickHandler = function(e) {
        // If the object is an area:
        if (_isTriggeredByArea(e)) {
          var caCode = e.target.feature.properties.CACODE;
          if ($scope.selectedAreas.isSelected(caCode)) {
            // If the object is already selected, unselect it
            e.target.setStyle(defaultStyle)
            $scope.selectedAreas.removeArea(caCode);
          } else {
            // If it isn't already selected, select it
            e.target.setStyle(selectedStyle)
            $scope.selectedAreas.addArea(caCode);
          }
        } else {
          // If the object is a district, center on the district and zoom in
          $scope.getMap().then(function(map) {
            map.fitBounds(e.target.getBounds());
            // Ensure that we zoom in far enough
            map.setZoom(AREATHRESHOLD);
          });

        }
      };

      var onEachFeature = function(feature, layer) {
        layer.on({
          mouseover: mouseoverHandler,
          mouseout: resetStyle,
          click: clickHandler
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
          style: featureStyler,
          onEachFeature: onEachFeature
        };
      });

      // If we zoom in further than >= 14, then switch over to the constituency areas layer
      $scope.$watch('center.zoom', function(newVal, oldVal) {
        if (newVal >= AREATHRESHOLD) {
          $scope.geojson = $scope.areas;
        } else {
          $scope.geojson = $scope.districts;
        }
      });

      // We have to set a watch on the selectedAreas to keep the map styling in sync
      // If it changes, then we need to getMap(), then loop through map._layers and update each layer
    }],
    template: '<leaflet center="center" defaults="defaults" geojson="geojson"></leaflet>' +
      '<div class="map-overlay" ng-show="hoveredFeature">{{ hoveredFeature }}</div><span>{{ center }}</span>'
  }
});