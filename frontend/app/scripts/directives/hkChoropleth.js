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
 * @param {object} [map-config] A configuration object of the following form, all are optional and default values are shown:
 * {
 *   colors: colorbrew.Blues[5]  // The
 * }
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
      /*
       * Defaults and utilities
       */

      // Default initializations
      $scope.defaults =  {
        scrollWheelZoom: true,
        maxZoom: 18
      };

      $scope.layers = {
        baselayers: {
          googleRoadMap: {
            name: 'Google Streets',
            layerType: 'ROADMAP',
            type: 'google'
          }
        }
      };

      // Default map configuration
      var _defaultConfig = {
        colors: colorbrewer.Reds[5],  // Colors to use for the scale
        scale: null,  // a d3 scale object, if none is provided, then we'll quantize the data into buckets
        valueVar: 'value',  // The name of the property in each data object that should be plotted
        style: {
          fillOpacity: 0.5
        }  //  Any additional styles to apply to each layer.
      };

      // Fill level
      var FILLOPACITY = 0.5;

      // Map Center object
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

      // Accessor for _mapDataHash that handles lowercasing of area codes
      $scope._getValueFromArea = function(area) {
        if (_.isUndefined(area) || _.isUndefined($scope._mapDataHash)) {
          return;
        }
        area = area.toLowerCase();
        return $scope._mapDataHash[area];
      };

      /*
       * Map data
       */

      // Get the mapData object
      var _mapDataGetter = $parse($attrs.mapData);
      var _getMapData = function() {
        $scope._mapData = _mapDataGetter($scope);
        return $scope._mapData;
      };

      // Whenever the map data object changes, we have to re-parse the data and configurations,
      // then restyle the layers on the map
      $scope.$watch(_getMapData, function(newVal) {
        if (!_.isUndefined(newVal)) {
          _parseConfig();
          _parseData();
          _setupScales();
          _drawLegend();
          $scope.getMap().then(function(map){
            _applyStylesToMap(map);
          });
        }
      });

      // Parse the data into a hash object for easy access
      var _parseData = function() {
        // Also store a dict for looking up data
        $scope._mapDataHash = {};
        _.forEach($scope._mapData, function(val) {
          $scope._mapDataHash[val.area] = val[$scope._mapConfig.valueVar];
        });
      };

      // Parse the config object, set up the scales and colors
      var _parseConfig = function() {
         // Get the config object, if it exists
        var config = _.clone(_defaultConfig);
        if (!_.isUndefined($attrs.mapConfig)) {
          var configGetter = $parse($attrs.mapConfig)
          _.assign(config, configGetter($scope));
        }
        $scope._mapConfig = config;
      };

      var _setupScales = function() {
        if ($scope._mapConfig.scale === null) {
          var vals = _.sortBy(_.pluck($scope._mapData, $scope._mapConfig.valueVar));
          $scope._colorScale = d3.scale.quantize()
            .domain(vals)
            .range(d3.range(5));  // 5 here, but can configure later, maybe
        } else {
          $scope._colorScale = $scope._mapConfig.scale;
        }

        $scope._colors = $scope._mapConfig.colors;
      };

      // Draw the legend
      var _drawLegend = function() {
        var legendContainer = d3.select(".map-legend");
        var formatter = d3.format("0f");

        // Clear existing legend
        legendContainer.selectAll('ul').remove();

        var legend = legendContainer.append('ul');

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

        if (_.isUndefined($scope._colorScale.invertExtent)) {
          // Ordinal scale
          var textFunc =  function(d) {
            return i18n.t($scope._mapConfig.valueVar + '.' + $scope._colorScale.domain()[d]);
          };
        } else {
          var textFunc = function(d) {
            var r = $scope._colorScale.invertExtent(d);
            return formatter(r[0]) + " - " + formatter(r[1]);
          };
        }
        keys.append('span')
          .attr('class', 'key-label')
          .text(textFunc);
      };

      // Styles
      $scope._defaultStyle = {
        color: "#2b8cbe",
        fillOpacity: 0,
        weight: 0
      };

      // Styler that styles a layer based on whether it is selected or not
      // This is only called when data is present
      var featureStyler = function(feature) {
        var code = feature.properties.CODE;
        var style =  _.clone($scope._defaultStyle);
        if (!_.isUndefined($scope._mapConfig.style)) {
          _.extend(style, $scope._mapConfig.style);
        }
        //console.log('value of area:');
        //console.log($scope._getValueFromArea(code));
        //console.log($scope._colors[$scope._colorScale($scope._getValueFromArea(code))]);

        var value = $scope._getValueFromArea(code); 
        if (!_.isUndefined(value)){
          style.fillColor = $scope._colors[$scope._colorScale(value)];
        } else {
          // Show grey for NaN
          style.fillColor = '#aaaaaa';
        }

        return style;
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

      var _isArea = function(f) {
        return !_.isUndefined(f.properties.CA);
      };

      // Handlers for interaction
      var mouseoverHandler = function(e) {
        var layer = e.target;
        var code = _getLayerCode(e);
        layer.setStyle({weight: 3});
        if (!L.Browser.ie && !L.Browser.opera) {
          layer.bringToFront();
        }

        var prefix = _isArea(e.target.feature) ? "area." : "district.";
        $scope.hoveredFeature = prefix + code.toLowerCase();
        if (!_.isUndefined($scope._mapConfig)) {
          if (!_.isUndefined($scope._colorScale.invertExtent)) {
            // Heuristic for continuous scales (actually quantized scales)
            var formatter = d3.format("0f");
            $scope.hoveredFeatureValue = formatter($scope._getValueFromArea(code.toLowerCase()));
          } else {
            // If invertExtent doesn't exist, then we're dealing with a categorical scale
            $scope.hoveredFeatureValue = i18n.t($scope._mapConfig.valueVar + '.' + $scope._getValueFromArea(code.toLowerCase()));
          }
        }
      };

      var resetStyle = function(e) {
        // Can't use resetStyle because we don't have access to the GeoJSON object
        var layer = e.target;
        var code = _getLayerCode(e);
        layer.setStyle({weight: 0});

        $scope.hoveredFeature = undefined;
        $scope.hoveredFeatureCode = undefined;
      };

      var _getLayerCode = function(e) {
        return e.target.feature.properties.CODE;
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
        if (newVal == 'dc') {
          GeoFiles.getDistricts().then(function(data) {
            $scope.geojson = {
              data: data,
              style: $scope._defaultStyle,
              onEachFeature: onEachFeature
            };
          });
        } else {
          GeoFiles.getAreas().then(function(data) {
            $scope.geojson = {
              data: data,
              style: $scope._defaultStyle,
              onEachFeature: onEachFeature
            };
          });
        }
      });

      $scope.$on('redrawMap', function() {
        $scope.getMap().then(function(map){
          _applyStylesToMap(map);
        });
      });
    }],
    template: '<leaflet center="center" defaults="defaults" geojson="geojson" layers="layers"></leaflet>' +
      '<div class="map-overlay" ng-show="hoveredFeature">{{ hoveredFeature | translate }} - {{ hoveredFeatureValue }}</div>' +
      '<div class="map-legend"></div>'
  };
});
