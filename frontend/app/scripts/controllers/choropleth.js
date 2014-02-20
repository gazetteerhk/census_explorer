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

    var _medianParserFactory = function(cfgObject) {
      return function(data) {
        var d = CensusAPI.joinGroups(data.groups, 'area');
        var scale = d3.scale.ordinal().domain(data.options.row).range(d3.range(data.options.row.length));
        cfgObject.scale = scale;
        return d;
      };
    };

    // 14 categories total
    var _medianMonthlyIncomeColors = _.clone(colorbrewer.Reds['7']).reverse().concat(colorbrewer.Greens['7']);
    var _medianMonthlyIncomeConfig = {
      colors: _medianMonthlyIncomeColors,
      valueVar: 'row'
    };

    var _medianHouseholdSizeConfig = {
      colors: colorbrewer.Blues[6],
      valueVar: 'row'
    };

    var _medianAgeConfig = {
      colors: _.clone(colorbrewer.Reds['9']).reverse().concat(colorbrewer.Greens['9']),
      valueVar: 'row'
    };

    // Generic configuration for value indicators
    // Color scale is handled by hkChoropleth
    var _valueConfig = {
      valueVar: 'value'
    };

    var _pctParserFactory = function(rowsToAggregate) {
      return function(data) {
        var d = CensusAPI.asPercentage(CensusAPI.joinData(data.data), 'area');
        var areaHash = {};
        var rows = rowsToAggregate;
        _.forEach(d, function(datum) {
          if (_.contains(rows, datum.row)) {
            if (_.isUndefined(areaHash[datum.area])) {
              areaHash[datum.area] = 0;
            }
            areaHash[datum.area] += datum.value;
          }
        });

        var res = [];
        _.forOwn(areaHash, function(v, k) {
          res.push({area: k, value: (v * 100)});
        });
        return res;
      };
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
      // Not very interesting
      {
        name: 'Median age of the population',
        params: _.extend(_.clone(Indicators.queries.age, true), Indicators.queries.areaMedianModifier),
        config: _medianAgeConfig,
        parser: _medianParserFactory(_medianAgeConfig)
      },
      {
        name: '% of population under 15',
        params: _.clone(Indicators.queries.age, true),
        config: _valueConfig,
        parser: _pctParserFactory(['h7_0', 'h8_5', 'h9_10'])

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
        params: _.extend(_.clone(Indicators.queries.householdSize, true), Indicators.queries.areaMedianModifier),
        config: _medianHouseholdSizeConfig,
        parser: _medianParserFactory(_medianHouseholdSizeConfig)
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
        parser: _medianParserFactory(_medianMonthlyIncomeConfig)
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
        parser: _medianParserFactory(_medianMonthlyIncomeConfig)
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
        parser: _medianParserFactory(_medianMonthlyIncomeConfig)
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