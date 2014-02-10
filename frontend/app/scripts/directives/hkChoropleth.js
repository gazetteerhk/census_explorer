'use strict';

/*
 * @ngdoc directive
 * @name hkChoropleth
 * @description
 * Directive for a map of Hong Kong with GeoJSON layers to show data spatially
 *
 * @param {string} [height="300px"] Height of the map.
 * @param {class} class Use the class declaration to set width in Bootstrap column system.
 * @param {array} map-data Array of objects with the data to be mapped
 * @param {object} [map-level="'ca'"] Either "ca" or "dc" for constituency areas or district councils.  Expects an object, so need to double quote
 *
 */

angular.module('frontendApp').directive('hkChoropleth', function() {
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

      //TODO:
      //    Try to find better curving function to make the colorscheme visually clearer.
      $scope._colors = colorbrewer.Blues[5];

      // The zoom level after which areas are drawn
      var AREATHRESHOLD = 14;
      // Fill level
      var FILLOPACITY = 0.5;

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
        weight: 2
      };

      var _isArea = function(feature) {
        // Checks if a feature is an area
        return !_.isUndefined(feature.properties.CACODE);
      };

      // Styler that styles a layer based on whether it is selected or not
      var featureStyler = function(feature) {
        var code = feature.properties.CACODE || feature.properties.DCCODE;
        var style = _.clone($scope._defaultStyle);
        style.fillColor = $scope._colors[$scope._colorScale($scope._getValueFromArea(code))];
        style.fillOpacity = FILLOPACITY;
        return style;
      };

      // Get the mapData object
      var _mapDataGetter = $parse($attrs.mapData);
      var _getMapData = function() {
        $scope._mapData = _mapDataGetter($scope);
        return $scope._mapData;
      };

      $scope.$watch(_getMapData, function() {
        console.log('data changed');
        _parseData();
        $scope.getMap().then(function(map){
          _applyStylesToMap(map);
        });
      });

      // Parse and quantize the data
      var _parseData = function() {
        var vals = _.sortBy(_.pluck($scope._mapData, 'value'));

        // Also store a dict for looking up data
        $scope._mapDataHash = {};
        _.forEach($scope._mapData, function(val) {
          $scope._mapDataHash[val.area] = val.value;
        });

        $scope._colorScale = d3.scale.quantize()
          .domain(vals)
          .range(d3.range(5));  // 5 here, but can configure later, maybe

        _drawLegend();
      };

      // Draw the legend
      var _drawLegend = function() {
        var legendContainer = d3.select(".map-legend");
        var formatter = d3.format("0f");

        // Clear existing legend
        legendContainer.selectAll('ul').remove();

        var legend = legendContainer.append('ul')
          .attr('class', 'Blues');

        var keys = legend.selectAll('li.key')
          .data($scope._colorScale.range());

        keys.enter().append('li')
          .attr('class', 'key');

        keys.append('span')
          .attr('class', 'key-symbol')
          .style('background-color', function(d) {
            return $scope._colors[d];
          })
          .style('opacity', FILLOPACITY);

        keys.append('span')
          .attr('class', 'key-label')
          .text(function(d) {
            var r = $scope._colorScale.invertExtent(d);
            return formatter(r[0]) + " - " + formatter(r[1]);
          });
      };

      // Accessor for _mapDataHash that handles lowercasing
      $scope._getValueFromArea = function(area) {
        if (_.isUndefined(area)) {
         return;
        }
        area = area.toLowerCase();
        return $scope._mapDataHash[area];
      };

      var _applyStylesToMap = function(map) {
        // Given a map, loop through the layers in the map and apply the appropriate style given
        var layers = _.values(map._layers);
        _.forEach(layers, function(layer) {
          if (!_.isUndefined(layer.feature) &&
            !_.isUndefined(layer.feature.properties)) {
            layer.setStyle(featureStyler(layer.feature));
          }
        });
      };

      // Handlers for interaction
      var mouseoverHandler = function(e) {
        var layer = e.target;
        var code = _getLayerCode(e);
        if (!L.Browser.ie && !L.Browser.opera) {
          layer.bringToFront();
        }

        $scope.hoveredFeature = code;
      };

      var resetStyle = function(e) {
        // Can't use resetStyle because we don't have access to the GeoJSON object
        var layer = e.target;
        var code = _getLayerCode(e);

        $scope.hoveredFeature = undefined;
      };

      var _isTriggeredByArea = function(event) {
        // Checks if the event was sent by an area polygon
        return !_.isUndefined(event.target.feature.properties.CACODE);
      };

      var _getLayerCode = function(e) {
        if (_isTriggeredByArea(e)) {
          return e.target.feature.properties.CACODE;
        } else {
          return e.target.feature.properties.DCCODE;
        }
      };

      var onEachFeature = function(feature, layer) {
        layer.on({
          mouseover: mouseoverHandler,
          mouseout: resetStyle
        });

      };

      // Loading the map layers
      // Watch the attribute value for mapLevel and set the geojson object based on that
      var _mapLevelParser = $parse($attrs.mapLevel);
      var _getMapLevel = function() {
        $scope._mapLevel = _mapLevelParser($scope);
        return $scope.mapLevel;
      };

      $scope.$watch(_getMapLevel, function(newVal) {
        console.log('level changed');
        if (newVal == 'dc') {
          GeoFiles.getDistricts().then(function(data) {
            $scope.geojson = {
              data: data,
              style: featureStyler,
              onEachFeature: onEachFeature
            };
          });
        } else {
          GeoFiles.getAreas().then(function(data) {
            $scope.geojson = {
              data: data,
              style: featureStyler,
              onEachFeature: onEachFeature
            };
          });
        }
      });

      $scope.$on('redrawMap', function() {
        console.log('redrawing map');
        $scope.getMap().then(function(map){
          _applyStylesToMap(map);
        });
      });
    }],
    template: '<leaflet center="center" defaults="defaults" geojson="geojson"></leaflet>' +
      '<div class="map-overlay" ng-show="hoveredFeature">{{ hoveredFeature }} - {{ _getValueFromArea(hoveredFeature) }}</div>' +
      '<div class="map-legend"></div>'
  };
});
