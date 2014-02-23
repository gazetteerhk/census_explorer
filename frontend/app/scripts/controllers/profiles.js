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
    };

    $scope._drawAge = function() {
      var elemSelector = "#profile-age";
      // clear the div
      if (!_.isUndefined($scope._charts[elemSelector])) {
        $scope._charts[elemSelector].svg.remove();
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
        data.push({'Age Group': transRow, Gender: 'Female', Population: val.female});
        data.push({'Age Group': transRow, Gender: 'Male', Population: val.male});
      });

      var svg = dimple.newSvg(elemSelector, undefined, 300);
      var chart = new dimple.chart(svg, data);
      chart.setBounds("13%", 0, "85%", "85%");
      chart.addMeasureAxis('x', 'Population');
      var y = chart.addCategoryAxis('y', 'Age Group');
      y.addOrderRule(_.map([
        'h7_0',
        'h8_5',
        'h9_10',
        'h10_15',
        'h11_20',
        'h12_25',
        'h13_30',
        'h14_35',
        'h15_40',
        'h16_45',
        'h17_50',
        'h18_55',
        'h19_60',
        'h20_65',
        'h21_70',
        'h22_75',
        'h23_80',
        'h24_85'
      ], function(k) {return i18n.t('row.' + k);}), true);
      chart.addSeries('Gender', dimple.plot.bar);
      chart.addLegend("75%", "77%", "30%", "10%");
      chart.draw();
      $scope._charts[elemSelector] = {svg: svg, chart: chart};
    };
}]);