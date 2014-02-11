'use strict';

/*
 * @ngdoc directive
 * @name hkMap
 * @description
 * Directive for a map of Hong Kong with GeoJSON layers for district councils and constituency areas
 *
 * @param {string} [height="300px"] Height of the map.
 * @param {class} class Use the class declaration to set width in Bootstrap column system.
 * @param {object} selectedAreas Object that stores which elements in the map are selected
 * @params {} singleSelect If this attribute is present, then only a single district or area is allowed to be selected at once
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
        scrollWheelZoom: true,
        maxZoom: 18
      };

      $scope._singleSelect = _.has($attrs, 'singleSelect');

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
      $scope._defaultStyle = {
        color: "#2b8cbe",
        fillOpacity: 0,
        weight: 3
      };

      $scope._hoverStyle = {
        color: "#000",
        fillColor: "#2b8cbe",
        fillOpacity: 0.2,
        weight: 6
      };

      $scope._partiallySelectedStyle = {
        color: "#ff0",
        fillColor: "#ff0",
        fillOpacity: 0.2,
        weight: 6
      };

      $scope._selectedStyle = {
        color: "#2ca25f",
        fillColor: "#2ca25f",
        fillOpacity: 0.2,
        weight: 6
      };

      // TODO: Add partially selected district styling

      // Styler that styles a layer based on whether it is selected or not
      var featureStyler = function(feature) {
        var code = feature.properties.CODE;
        if ($scope.selectedAreas.isSelected(code)) {
          return $scope._selectedStyle;
        } else {
          return $scope._defaultStyle;
        }
      };

      // Model for tracking selected areas
      if (_.isUndefined($attrs.selectedAreas)) {
        $scope.selectedAreas = AreaSelection.getModel();
      } else {
        $scope.selectedAreas = $parse($attrs.selectedAreas)($scope);
      }

      // We have to set a watch on the selectedAreas to keep the map styling in sync
      // If it changes, then we need to getMap(), then loop through map._layers and update each layer's style
      // But, we can't use a watch on the selectedAreas object, otherwise layers get styled twice when clicking on the map
      var _applyStylesToMap = function(map) {
        // Given a map, loop through the layers in the map and apply the appropriate style given
        // the current state of selectedAreas
        var layers = _.values(map._layers);
        _.forEach(layers, function(layer) {
          if (!_.isUndefined(layer.feature) &&
            !_.isUndefined(layer.feature.properties)) {
            layer.setStyle(featureStyler(layer.feature));
          }
        });
      };

      var _redrawMap = function() {
         $scope.getMap().then(function(map){
          _applyStylesToMap(map);
        });
      };
      // So instead, use a listener.
      $scope.$on('redrawMap', function() {
        console.log('redrawing map');
        _redrawMap();
      });

      // Handlers for interaction
      var mouseoverHandler = function(e) {
        var layer = e.target;
        var code = _getLayerCode(e);
        // only change the style if the area is not already selected
        if (!$scope.selectedAreas.isSelected(code)) {
          layer.setStyle($scope._hoverStyle);
          if (!L.Browser.ie && !L.Browser.opera) {
            layer.bringToFront();
          }
        }

        $scope.hoveredFeature = code;
      };

      var resetStyle = function(e) {
        // Can't use resetStyle because we don't have access to the GeoJSON object
        var layer = e.target;
        var code = _getLayerCode(e);
        // Only reset if the area is not selected
        if (!$scope.selectedAreas.isSelected(code)) {
          layer.setStyle($scope._defaultStyle);
        }
        $scope.hoveredFeature = undefined;
      };

      var _getLayerCode = function(e) {
        return e.target.feature.properties.CODE;
      };

      var clickHandler = function(e) {
        // If the object is an area:
        var code = _getLayerCode(e);

        // If single select is turned on, then clear map state before doing anything else
        if ($scope._singleSelect === true) {
          // We use redraw map instead of directly removing the style on the last selected layer
          // Also clearing the state early handles a couple edge cases, mostly involving zooming in to areas from districts
          // - select district -> zoom in -> click on already selected area
          // - select district -> zoom in -> select area
          $scope.selectedAreas.clearSelected();
          _redrawMap();
        }

        if ($scope.selectedAreas.isSelected(code)) {
          // If the object is already selected, unselect it
          e.target.setStyle($scope._hoverStyle);
          $scope.selectedAreas.removeArea(code);
        } else {
          // If it isn't already selected, select it
          e.target.setStyle($scope._selectedStyle);
          $scope.selectedAreas.addArea(code);
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
          style: featureStyler,
          onEachFeature: onEachFeature
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
      $scope.$watch('center.zoom', function(newVal) {
        if (newVal >= AREATHRESHOLD) {
          $scope.geojson = $scope.areas;
        } else {
          $scope.geojson = $scope.districts;
        }
      });

    }],
    template: '<leaflet center="center" defaults="defaults" geojson="geojson"></leaflet>' +
      '<div class="map-overlay" ng-show="hoveredFeature">{{ hoveredFeature }}</div>'
  }
});