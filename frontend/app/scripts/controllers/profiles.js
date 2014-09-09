'use strict';

angular.module('frontendApp')
  .controller('ProfilesCtrl', ['$scope', 'AreaSelection', 'CensusAPI', 'Indicators', '$timeout', function($scope, AreaSelection, CensusAPI, Indicators, $timeout) {
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

      // Delay fetching so that the scrolling finishes first
      // Hurts response time on first query, but helps animation on later queries
      $timeout(function() {
        query.fetch().then(function(res) {
          $scope._rawResponse = res;
          $scope._queryData = CensusAPI.joinData(res.data);
          $scope.redrawCharts();
        });
      }, 300);

      // Scroll to the results section
      // Must delay this so that the section can show
      $timeout(function() {$('body').animate({scrollTop: $('#profile-charts').offset().top}, 'slow')}, 100);

    }, true);

    $scope.redrawCharts = function() {
      $scope._drawAge();
      $scope._drawEthnicity();
      $scope._drawLanguage();
      $scope._drawOccupation();
      $scope._drawIndustry();
      $scope._drawIncome();
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

      var filters = ['l6_male', 'm6_female'];
      var filtered = _.filter($scope._queryData, function(val) {return (filters.indexOf(val.column) > -1);});
      var grouped = CensusAPI.sumBy(filtered, ['row', 'column']);  //  Need this to handle district aggregates

      var data = [];
      _.forOwn(grouped, function(val, key) {
        var split = key.split(',');
        data.push({"Age Group": i18n.t('row.' + split[0]),
          Gender: i18n.t('column.' + split[1]),
          Population: split[1] === 'l6_male' ? (-1 * val) : val});
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
      chart.draw(1000);
      _addChartToCache(elemSelector, svg, chart);
    };

    $scope._drawEthnicity = function() {
      var elemSelector = "#profile-ethnicity";
      _clearChart(elemSelector);

      // Filter out the data we want
      var filters = ['tab0_male', 'tab0_female'];
      var filtered = _.filter($scope._queryData, function(val) {return (filters.indexOf(val.column) > -1);});
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
      chart.draw(1000);
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
      chart.draw(1000);
      _addChartToCache(elemSelector, svg, chart);
    };

    $scope._drawOccupation = function() {
      var elemSelector = "#profile-occupation";
       _clearChart(elemSelector);

      var filters = [
        'l81_male',
        'm81_female',
      ];
      var filtered = _.filter($scope._queryData, function(val) {return filters.indexOf(val.column) > -1;});
      var grouped = CensusAPI.sumBy(filtered, ['row', 'column']);
      var data = [];
      _.forOwn(grouped, function(val, key) {
        var split = key.split(',');
        data.push({Occupation: i18n.t('row.' + split[0]), 'Gender': i18n.t('column.' + split[1]), Population: val});
      });

      var svg = dimple.newSvg(elemSelector, angular.element(elemSelector).width()-20, 150);
      var chart = new dimple.chart(svg, data);
      chart.setBounds(65, 10, 490, 90);
      chart.addCategoryAxis('y', 'Gender');
      chart.addPctAxis('x', 'Population');
      chart.addSeries('Occupation', dimple.plot.bar);
//      chart.addLegend(0, 0, "100%", 20);
      chart.draw(1000);
      _addChartToCache(elemSelector, svg, chart);
    };

    $scope._drawIndustry = function() {
      var elemSelector = "#profile-industry";
      _clearChart(elemSelector);

      var filters = [
        'l95_male',
        'm95_female',
      ];
      var filtered = _.filter($scope._queryData, function(val) {return filters.indexOf(val.column) > -1;});
      var grouped = CensusAPI.sumBy(filtered, ['row', 'column']);
      var data = [];
      _.forOwn(grouped, function(val, key) {
        var split = key.split(',');
        data.push({Industry: i18n.t('row.' + split[0]), 'Gender': i18n.t('column.' + split[1]), Population: val});
      });

      var svg = dimple.newSvg(elemSelector, undefined, 150);
      var chart = new dimple.chart(svg, data);
      chart.setBounds(65, 10, 490, 90);
      chart.addCategoryAxis('y', 'Gender');
      chart.addPctAxis('x', 'Population');
      chart.addSeries('Industry', dimple.plot.bar);
//      chart.addLegend(0, 0, "100%", 20);
      chart.draw(1000);
      _addChartToCache(elemSelector, svg, chart);
    };

    $scope._drawIncome = function() {
      var elemSelector = "#profile-income";
      _clearChart(elemSelector);

      var filters = [
        'c77_male',
        'd77_female'
      ];
      var filtered = _.filter($scope._queryData, function(val) {return (filters.indexOf(val.column) > -1);});
      var grouped = CensusAPI.sumBy(filtered, ['row', 'column']);  //  Need this to handle district aggregates

      var data = [];
      _.forOwn(grouped, function(val, key) {
        var split = key.split(',');
        data.push({Income: i18n.t('row.' + split[0]),
          Gender: i18n.t('column.' + split[1]),
          Population: split[1] === 'c77_male' ? (-1 * val) : val});
      });

      // Make the chart
      var svg = dimple.newSvg(elemSelector, undefined, 350);
      var chart = new dimple.chart(svg, data);
      chart.setBounds(120, 0, 400, "85%");
      chart.addMeasureAxis('x', 'Population');
      var y = chart.addCategoryAxis('y', 'Income');
      y.addOrderRule(_.map(Indicators.ordering.income, function(k) {return i18n.t('row.' + k);}), true);
      chart.addSeries('Gender', dimple.plot.bar);
      chart.addLegend("75%", 10, "30%", "10%");
      chart.draw(1000);
      _addChartToCache(elemSelector, svg, chart);
    };


}]);