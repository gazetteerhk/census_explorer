'use strict';

angular.module('frontendApp')
  .controller('ProfilesCtrl', ['$scope', 'AreaSelection', 'CensusAPI', 'Indicators', function($scope, AreaSelection, CensusAPI, Indicators) {
    $scope.selection = AreaSelection.getModel();

    // Storage for svg and chart elements
    // {elemId: {svg: svgElement, chart: chartElement}, ...}
    $scope._charts = {};


    // Because each column is unique to a table, we don't have to filter on table
    var baseQuery = {
      column: [
        // Age
        'l6_male',
        'm6_female',
        // Ethnicity
        'tab0_male',
        'tab0_female',
        // Language
        'e18_both',
        // Occupation
        'l81_male',
        'm81_female',
        // Industry
        'l95_male',
        'm95_female',
        // Individual monthly income
        'c77_male',
        'd77_female'
      ],
      projector: ['value', 'row', 'column'],
      return: ['data', 'options']
    };

    $scope.$watch('selection', function() {
      if($scope.selection.selectedAreas().length == 0) {
        return;
      }

      var query = new CensusAPI.Query(baseQuery);

      var areas = $scope.selection.selectedAreas();

      // Get the name of the area to display
      if (areas.length > 1) {
        // Selected a district
        var districtCode = areas[0][0];
        $scope.selectionName = i18n.t('district.' + districtCode);
      } else {
        // Selected an area
        $scope.selectionName = i18n.t('area.' + areas[0]);
      }

      // Add the selected area to the filter
      query.addParam('area', areas);

      query.fetch().then(function(res) {
        $scope._rawResponse = res;
        console.log("Response");
        console.log(res);
        $scope._queryData = CensusAPI.joinData(res.data);
        $scope.redrawCharts();
      });
    }, true);

    $scope.redrawCharts = function() {
      $scope._drawAge();
      $scope._drawEthnicity();
      $scope._drawLanguage();
    };

    var _clearChart = function(selector) {
      if (!_.isUndefined($scope._charts[selector])) {
        $scope._charts[selector].svg.remove();
      }
    };

    var _addChartToCache = function(selector, svg, chart) {
      $scope._charts[selector] = {svg: svg, chart: chart};
    };

    $scope._drawAge = function() {
      var elemSelector = "#profile-age";
      _clearChart(elemSelector);

      // Get the data
      // Should be in the form [{row: ageGroup, male: malePopulation, female: femalePopulation}]
      var ageHash = {};
      _.forEach($scope._queryData, function(val) {
        if (val.column === 'l6_male') {
          if (_.isUndefined(ageHash[val.row])) {
            ageHash[val.row] = {male: 0, female: 0};
          }
          ageHash[val.row].male -= val.value; // Male is on the left side, so negative
        } else if (val.column === 'm6_female') {
          if (_.isUndefined(ageHash[val.row])) {
            ageHash[val.row] = {male: 0, female: 0};
          }
          ageHash[val.row].female += val.value;
        }
      });

      var data = [];
      _.forOwn(ageHash, function(val, row) {
        var transRow = i18n.t('row.' + row);
        data.push({'Age Group': transRow, Gender: 'Female', Population: val.female});
        data.push({'Age Group': transRow, Gender: 'Male', Population: val.male});
      });

      // Make the chart
      var svg = dimple.newSvg(elemSelector, undefined, 300);
      var chart = new dimple.chart(svg, data);
      chart.setBounds("13%", 0, "85%", "85%");
      chart.addMeasureAxis('x', 'Population');
      var y = chart.addCategoryAxis('y', 'Age Group');
      y.addOrderRule(_.map(Indicators.ordering.ageGroup, function(k) {return i18n.t('row.' + k);}), true);
      chart.addSeries('Gender', dimple.plot.bar);
      chart.addLegend("75%", "77%", "30%", "10%");
      chart.draw();
      _addChartToCache(elemSelector, svg, chart);
    };

    $scope._drawEthnicity = function() {
      var elemSelector = "#profile-ethnicity";
      _clearChart(elemSelector);

      // Filter out the data we want
      var filtered = _.filter($scope._queryData, function(val) {return (['tab0_male', 'tab0_female'].indexOf(val.column) > -1);})
      var grouped = CensusAPI.sumBy(filtered, ['row', 'column']);  //  Need this to handle district aggregates
      // Grouped is {row,column: value}
      // Reshape the grouped aggregate to a data array
      var data = [];
      _.forOwn(grouped, function(val, key) {
        var split = key.split(',');
        data.push({Ethnicity: i18n.t('row.' + split[0]), Gender: i18n.t('column.' + split[1]), Population: val});
      });

      var svg = dimple.newSvg(elemSelector, undefined, 300);
      var chart = new dimple.chart(svg, data);
      chart.setBounds(65, 15, "70%", "81%");
      chart.addCategoryAxis('x', ['Gender']);
      chart.addPctAxis('y', 'Population');
      chart.addSeries('Ethnicity', dimple.plot.bar);
//      chart.addLegend(0, 0, "100%", "10%");
      chart.draw();
      _addChartToCache(elemSelector, svg, chart);
    };

    $scope._drawLanguage = function() {
      var elemSelector = "#profile-language";
      _clearChart(elemSelector);

      var filtered = _.filter($scope._queryData, function(val) {return val.column === "e18_both";});
      var grouped = CensusAPI.sumBy(filtered, ['row']);
      var data = [];
      _.forOwn(grouped, function(val, key) {
        data.push({Language: i18n.t('row.' + key), 'All people': '', Population: val});
      });

      var svg = dimple.newSvg(elemSelector, undefined, 300);
      var chart = new dimple.chart(svg, data);
      chart.setBounds(65, 15, "70%", "81%");
      chart.addCategoryAxis('x', 'All People');
      chart.addPctAxis('y', 'Population');
      chart.addSeries('Language', dimple.plot.bar);
//      chart.addLegend(0, 0, "100%", "10%");
      chart.draw();
      _addChartToCache(elemSelector, svg, chart);
    };
}]);