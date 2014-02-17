'use strict';

angular.module('frontendApp')
  .controller('ChoroplethCtrl', ['$scope', 'CensusAPI', 'Indicators', function ($scope, CensusAPI, Indicators) {


    $scope.refresh = function(){
      var query = new CensusAPI.Query($scope.selectedIndicator.params);

      var promise = query.fetch().then(function(response) {
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
        name: '',
        params: null,
        config: null,
        parser: null
      },
      // Gender / Age
      {
        name: 'Male to female ratio',
        params: null,
        config: null,
        parser: null
      },
      {
        name: 'Median age of the population',
        params: null,
        config: null,
        parser: null
      },
      {
        name: '% of population under 15',
        params: null,
        config: null,
        parser: null
      },
      {
        name: '% of population over 65',
        params: null,
        config: null,
        parser: null
      },
      // Ethnicity
      {
        name: '% of population that is non-Chinese',
        params: null,
        config: null,
        parser: null
      },
      {
        name: '% of population that is Indonesian or Filipino',
        params: null,
        config: null,
        parser: null
      },
      // Family and housing
      {
        name: '% of population that is divorced or separated',
        params: null,
        config: null,
        parser: null
      },
      {
        name: 'Median household size',
        params: null,
        config: null,
        parser: null
      },
      {
        name: '% of households in public rental housing',
        params: null,
        config: null,
        parser: null
      },
      {
        name: '% of households that own their home',
        params: null,
        config: null,
        parser: null
      },
      {
        name: '% of households renting their home',
        params: null,
        config: null,
        parser: null
      },
      {
        name: 'Median monthly household rent payment',
        params: _.extend(_.clone(Indicators.queries.householdRent, true), Indicators.queries.areaModeModifier),
        config: _medianMonthlyIncomeConfig,
        parser: _medianMonthlyIncomeParser
      },
      {
        name: 'Median monthly household mortgage payment',
        params: null,
        config: null,
        parser: null
      },
      // Education
      {
        name: 'Most common level of education',
        params: null,
        config: null,
        parser: null
      },
      {
        name: '% of population with a post-secondary education',
        params: null,
        config: null,
        parser: null
      },
      {
        name: '% of students tha travel to another district for school',
        params: null,
        config: null,
        parser: null
      },
      // Income and work
      {
        name: 'Median monthly household income',
        params: _.extend(_.clone(Indicators.queries.householdIncome, true), Indicators.queries.areaMedianModifier),
        config: _medianMonthlyIncomeConfig,
        parser: _medianMonthlyIncomeParser
      },
      {
        name: '% of households making less than HK$25,000 per month (HK median is $23,000)',
        params: null,
        config: null,
        parser: null
      },
      {
        name: 'Most common monthly income',
        params: _.extend(_.clone(Indicators.queries.householdIncome, true), Indicators.queries.areaModeModifier),
        config: _medianMonthlyIncomeConfig,
        parser: _medianMonthlyIncomeParser
      },
      {
        name: 'Most common occupation for men',
        params: null,
        config: null,
        parser: null
      },
      {
        name: 'Most common occupation for women',
        params: null,
        config: null,
        parser: null
      },
      {
        name: 'Most common industry for men',
        params: null,
        config: null,
        parser: null
      },
      {
        name: 'Most common industry for women',
        params: null,
        config: null,
        parser: null
      },
      {
        name: '% of workers that travel to another district for work',
        params: null,
        config: null,
        parser: null
      },
      // Misc
      {
        name: 'Residence stability (% of population that lived in the same area 5 years ago)',
        params: null,
        config: null,
        parser: null
      },
    ];

    $scope.mapLevel = 'ca';
    $scope.theData = $scope.areaData;
  }]);