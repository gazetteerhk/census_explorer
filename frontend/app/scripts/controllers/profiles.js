'use strict';

angular.module('frontendApp')
  .controller('ProfilesCtrl', ['$scope', 'AreaSelection', 'CensusAPI', function($scope, AreaSelection, CensusAPI) {
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
        $scope._rawResponse = res;
        console.log("Response");
        console.log(res);
        $scope._queryData = CensusAPI.joinData(res.data);
        $scope.redrawCharts();
      });
    }, true);

    $scope.redrawCharts = function() {
      $scope._drawAge();
    };

    $scope._drawAge = function() {
      var elemSelector = "#profile-age";
      // clear the div
      if (!_.isUndefined($scope._charts[elemSelector])) {
        d3.select($scope._charts[elemSelector].svg).remove();
      }

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
        data.push({row: transRow, gender: 'Male', value: val.male});
        data.push({row: transRow, gender: 'Female', value: val.female});
      });

      var svg = dimple.newSvg(elemSelector, undefined, 300);
      var chart = new dimple.chart(svg, data);
      chart.addMeasureAxis('x', 'value');
      chart.addCategoryAxis('y', 'row');
      chart.addSeries('gender', dimple.plot.bar);
      chart.draw();
      $scope._charts[elemSelector] = {svg: svg, chart: chart};
    };
}]);