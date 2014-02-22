'use strict';

angular.module('frontendApp')
  .controller('TestCtrl', ['$scope', 'GeoMappings', '$http', 'CensusAPI', 'Indicators', 'promiseTracker',
                           function ($scope, GeoMappings, $http, CensusAPI, Indicators, promiseTracker) {

    $scope.refresh = function(){
      console.log('indicator:');
      console.log($scope.selectedIndicator);

      var query = new CensusAPI.Query($scope.selectedIndicator.params);

      console.log("query filters:");
      console.log(query._filters);

      var promise = query.fetch().then(function(response) {
        console.log('response:');
        console.log(response);
        var d = $scope.selectedIndicator.parser(response);
        $scope.mapConfig = $scope.selectedIndicator.config;
        $scope.areaData = d;
      });
    };

    /*
     * Median / mode income related indicators
     */

    // 14 categories total
    var _medianMonthlyIncomeColors = _.clone(colorbrewer.Reds['7']).reverse().concat(colorbrewer.Greens['7']);
    var _medianMonthlyIncomeConfig = {
      colors: _medianMonthlyIncomeColors,
      valueVar: 'row'
    };
    var _medianMonthlyIncomeParser = function(data) {
      var d = CensusAPI.joinGroups(data.groups, 'area');
      var scale = d3.scale.ordinal().domain(data.options.row).range(d3.range(14));
      _medianMonthlyIncomeConfig.scale = scale;
      return d;
    };

    $scope.indicators = [
      {
        name: 'Median monthly income',
        params: _.extend(_.clone(Indicators.queries.householdIncome, true), Indicators.queries.areaMedianModifier),
        config: _medianMonthlyIncomeConfig,
        parser: _medianMonthlyIncomeParser
      },
      {
        name: 'Most common monthly income',
        params: _.extend(_.clone(Indicators.queries.householdIncome, true), Indicators.queries.areaModeModifier),
        config: _medianMonthlyIncomeConfig,
        parser: _medianMonthlyIncomeParser
      },
      {
        name: 'Median housing rental amount',
        params: _.extend(_.clone(Indicators.queries.householdRent, true), Indicators.queries.areaModeModifier),
        config: _medianMonthlyIncomeConfig,
        parser: _medianMonthlyIncomeParser
      }
    ];

    $scope.mapLevel = 'ca';
    $scope.theData = $scope.areaData;
  }]);