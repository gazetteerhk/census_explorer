'use strict';

angular.module('frontendApp')
  .controller('TestCtrl', ['$scope', 'GeoMappings', '$http', 'CensusAPI', function ($scope, GeoMappings, $http, CensusAPI) {

    $scope.refresh = function(){
      console.log('indicator:');
      console.log($scope.selectedIndicator);

      var query = new CensusAPI.Query({
        projector: ['area', 'value', 'row'],
        return: ['data', 'groups'],
        groupby: 'area'
      });
      query.addParam($scope.selectedIndicator);

      console.log("query filters:");
      console.log(query._filters);

      query.fetch().then(function(data) {
        var d = CensusAPI.joinData(data.data);
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

    // TODO: These are just for show, because the asPercentage scaling is still a WIP
    $scope.indicators = [
      {name: 'Total population', identifier: {table: 0, column: 'tab0_both', row: 'tab0_total'}},
      {name: 'Population of divorcees', identifier: {table: 2, column: 'e28_both', row: 'a32_divorced'}},
      {name: 'Population of self-employed people', identifier: {table: 4, column: 'e61_both', row: 'a65_self-employed'}},
      //{name: 'Median monthly income', identifier: {table: 18, column: 'n118_households', aggregate: 'median'}}
    ];

    // init with one plot
    $scope.selectedIndicator = $scope.indicators[0].identifier;
    $scope.refresh();

    $scope.mapLevel = 'ca';
    $scope.theData = $scope.areaData;
  }]);