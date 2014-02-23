'use strict';

angular.module('frontendApp')
  .controller('ProfilesCtrl', ['$scope', 'AreaSelection', 'CensusAPI', function($scope, AreaSelection, CensusAPI) {

    $scope.selection = AreaSelection.getModel();


    // Because each column is unique to a table, we don't have to filter on table
    var baseQuery = {
      column: [
        // Age
        'l6_male',
        'm6_female',
        // Occupation
        'l81_male',
        'm81_female',
        // Industry
        'l95_male',
        'm95_female',
        // Individaul monthly income
        'c77_male',
        'd77_female',
      ],
      projector: ['value', 'row', 'column'],
      return: ['data', 'options']
    };

    $scope.$watch('selection', function() {
      var query = new CensusAPI.Query(baseQuery);

      // Add the selected area to the filter
      query.addParam('area', $scope.selection.selectedAreas());

      query.fetch().then(function(res) {
        $scope._queryData = res;
        console.log(res);
        $scope.redrawCharts();
      });
    }, true);

    $scope.redrawCharts = function() {

    };
}]);