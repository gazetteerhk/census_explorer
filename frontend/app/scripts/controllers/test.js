'use strict';

angular.module('frontendApp')
  .controller('TestCtrl', ['$scope', 'GeoMappings', '$http', 'CensusAPI', function ($scope, GeoMappings, $http, CensusAPI) {

    $scope.refresh = function(){
      console.log('indicator:');
      console.log($scope.selectedIndicator);

      var defaultParams = {
        projector: ['area', 'value', 'row'],
        return: ['groups', 'options'],
        groupby: 'area'
      };

      var query = new CensusAPI.Query(defaultParams);
      query.addParam($scope.selectedIndicator.params);

      console.log("query filters:");
      console.log(query._filters);

      query.fetch().then(function(response) {
        console.log('response:');
        console.log(response);
        var d = $scope.selectedIndicator.parser(response);
        $scope.mapConfig = $scope.selectedIndicator.config;
        $scope.areaData = d;
      });

      /*
      $http.get(url).success(function(data){
        console.log(data);
        //NOTE:
        //    Do not plot by .value. They are just the min, max, median number.
        //    What we want to plot is .row, which are categorical information.
        //    The following code creates a general map from categories to numerical values.
        var m = {};
        for (var i=0; i < data.options.row.length; i++){
          m[data.options.row[i]] = i
        }
        $scope.areaData =_.map(data.groups, function(area,k) {
          var v = m[area.row[0]];
          //TODO:
          //    suggest data structure:
          //    - area: area
          //    - value: a numerical level for coloring purpose
          //    - name: the human readable category name, e.g. '>= 20000'.
          //            Can be used in legend.
          return {area: k, value: v};
        });
      });
      */
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
//      {name: 'Total population', identifier: {table: 0, column: 'tab0_both', row: 'tab0_total'}},
//      {name: 'Population of divorcees', identifier: {table: 2, column: 'e28_both', row: 'a32_divorced'}},
//      {name: 'Population of self-employed people', identifier: {table: 4, column: 'e61_both', row: 'a65_self-employed'}},
      {
        name: 'Median monthly income',
        params: {table: 18, column: 'n118_households', aggregate: 'median'},
        config: _medianMonthlyIncomeConfig,
        parser: _medianMonthlyIncomeParser
      },
      {
        name: 'Most common monthly income',
        params: {table: 18, column: 'n118_households', aggregate: 'max'},
        config: _medianMonthlyIncomeConfig,
        parser: _medianMonthlyIncomeParser
      },
      {
        name: 'Median housing rental amount',
        params: {table: 20, aggregate: 'median'},
        config: _medianMonthlyIncomeConfig,
        parser: _medianMonthlyIncomeParser
      }
    ];

    // init with one plot
//    $scope.selectedIndicator = $scope.indicators[0].identifier;
//    $scope.refresh();

    $scope.mapLevel = 'ca';
    $scope.theData = $scope.areaData;
  }]);