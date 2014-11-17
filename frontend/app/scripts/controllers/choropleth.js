'use strict';

angular.module('frontendApp')
  .controller('ChoroplethCtrl', ['$scope', 'CensusAPI', 'Indicators', '$filter',function ($scope, CensusAPI, Indicators,$filter) {


    $scope.refresh = function(){
      var query = new CensusAPI.Query($scope.selectedIndicator.params);

      var promise = query.fetch().then(function(response) {
        var d = $scope.selectedIndicator.parser(response);
        $scope.mapConfig = $scope.selectedIndicator.config;
        $scope.areaData = d;
      });
    };

    var _genderRatioParams = {
      table: 12,
      column: ['l6_male', 'm6_female'],
      projector: ['area', 'value', 'row', 'column'],
      return: ['data', 'options']
    };

    var _genderRatioParser = function(data) {
      var d = CensusAPI.sumBy(CensusAPI.joinData(data.data), ['area', 'column']);
      // d is {area,column: sum, ...}, unpack into male and female hashes {area: value, ...}
      console.log(d);
      var resMale = {};
      var resFemale = {};

      _.forOwn(d, function(v, k) {
        var key = k.split(',');
        if (key[1] === 'l6_male') {
          resMale[key[0]] = v;
        } else if (key[1] === 'm6_female') {
          resFemale[key[0]] = v;
        }
      });
      console.log(resMale);
      console.log(resFemale);

      var res = [];

      _.forOwn(resMale, function(v, k) {
        res.push({area: k, value: (v / resFemale[k]) * 1000});
      });
      console.log(res);
      return res;
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
    var _medianMonthlyIncomeColors = _.clone(colorbrewer.Reds[7]).reverse().concat(colorbrewer.Greens[7]);
    var _medianMonthlyIncomeConfig = {
      colors: _medianMonthlyIncomeColors,
      valueVar: 'row'
    };

    var _medianHouseholdSizeConfig = {
      colors: colorbrewer.Blues[6],
      valueVar: 'row'
    };

    var _medianAgeConfig = {
      colors: _.clone(colorbrewer.Reds[9]).reverse().concat(colorbrewer.Greens[9]),
      valueVar: 'row'
    };

    var _modeEduAttainmentConfig = {
      colors: colorbrewer.Greens[7],
      valueVar: 'row'
    };

    var _modeOccupationConfig = {
      colors: colorbrewer.Paired[9],
      valueVar: 'row'
    };

    var _modeIndustryConfig = {
      colors: colorbrewer.Paired[11],
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
      // Gender / Age
      {
        name: 'mapper.options.male_to_female_ratio',
        params: _genderRatioParams,
        config: _valueConfig,
        parser: _genderRatioParser
      },
      // Not very interesting
      {
        name: 'mapper.options.median_age',
        params: _.extend(_.clone(Indicators.queries.age, true), Indicators.queries.areaMedianModifier),
        config: _medianAgeConfig,
        parser: _medianParserFactory(_medianAgeConfig)
      },
      {
        name: 'mapper.options.percent_population_under_15',
        params: Indicators.queries.age,
        config: _valueConfig,
        parser: _pctParserFactory(['h7_0', 'h8_5', 'h9_10'])

      },
      {
        name: 'mapper.options.percent_population_over_65',
        params: Indicators.queries.age,
        config: _valueConfig,
        parser: _pctParserFactory(['h20_65', 'h21_70', 'h22_75', 'h23_80', 'h24_85'])
      },
      // Ethnicity
      {
        name: 'mapper.options.percent_population_non_chinese',
        params: Indicators.queries.ethnicity,
        config: _valueConfig,
        parser: _pctParserFactory([
          "tab0_indonesian",
          "tab0_white",
          "tab0_others",
          "tab0_filipino",
          "tab0_korean",
          "tab0_indian",
          "tab0_japanese",
          "tab0_pakistani",
          "tab0_thai",
          "tab0_nepalese",
          "tab0_black",
          "tab0_sri-lankan",
          "tab0_vietnamese"
        ])
      },
      {
        name: 'mapper.options.percent_population_indo_filipino',
        params: Indicators.queries.ethnicity,
        config: _valueConfig,
        parser: _pctParserFactory(['tab0_filipino', 'tab0_indonesian'])
      },
      // Family and housing
      {
        name: 'mapper.options.population_divorced_separated',
        params: Indicators.queries.maritalStatus,
        config: _valueConfig,
        parser: _pctParserFactory(['a32_divorced', 'a33_separated'])
      },
      {
        name: 'mapper.options.median_household',
        params: _.extend(_.clone(Indicators.queries.householdSize, true), Indicators.queries.areaMedianModifier),
        config: _medianHouseholdSizeConfig,
        parser: _medianParserFactory(_medianHouseholdSizeConfig)
      },
      {
        name: 'mapper.options.percent_households_public_rental',
        params: _.clone(Indicators.queries.householdHousingType),
        config: _valueConfig,
        parser: _pctParserFactory(['a147_public'])
      },
      {
        name: 'mapper.options.percent_households_own',
        params: Indicators.queries.housingTenure,
        config: _valueConfig,
        parser: _pctParserFactory(['a156_with', 'a157_without'])
      },
      {
        name: 'mapper.options.percent_households_rent',
        params: Indicators.queries.housingTenure,
        config: _valueConfig,
        parser: _pctParserFactory(['a158_sole', 'a159_co-tenantmain'])
      },
      {
        name: 'mapper.options.median_monthly_rent',
        params: _.extend(_.clone(Indicators.queries.householdRent, true), Indicators.queries.areaMedianModifier),
        config: _medianMonthlyIncomeConfig,
        parser: _medianParserFactory(_medianMonthlyIncomeConfig)
      },
      {
        name: 'mapper.options.median_monthly_mortgage',
        params: _.extend(_.clone(Indicators.queries.householdMortgage, true), Indicators.queries.areaMedianModifier),
        config: _medianMonthlyIncomeConfig,
        parser: _medianParserFactory(_medianMonthlyIncomeConfig)
      },
      // Education
      {
        name: 'mapper.options.most_common_edu',
        params: _.extend(_.clone(Indicators.queries.educationalAttainment, true), Indicators.queries.areaModeModifier),
        config: _modeEduAttainmentConfig,
        parser: _medianParserFactory(_modeEduAttainmentConfig)
      },
      {
        name: 'mapper.options.percent_population_edu_post_sec',
        params: Indicators.queries.educationalAttainment,
        config: _valueConfig,
        parser: _pctParserFactory(['a51_diplomacertificate', 'a52_sub-degree', 'a53_degree'])
      },
      {
        name: 'mapper.options.percent_population_edu_students_travel',
        params: Indicators.queries.placeOfStudy,
        config: _valueConfig,
        parser: _pctParserFactory(['h44_hong', 'h45_kowloon', 'h46_new', 'h47_other'])
      },
      // Income and work
      {
        name: 'mapper.options.median_monthly_household_income',
        params: _.extend(_.clone(Indicators.queries.householdIncome, true), Indicators.queries.areaMedianModifier),
        config: _medianMonthlyIncomeConfig,
        parser: _medianParserFactory(_medianMonthlyIncomeConfig)
      },
      {
        name: 'mapper.options.percent_household_lower_income',
        params: Indicators.queries.householdIncome,
        config: _valueConfig,
        parser: _pctParserFactory(['h119_<',
                                   'h120_2000',
                                   'h121_4000',
                                   'h122_6000',
                                   'h123_8000',
                                   'h124_10000',
                                   'h125_15000',
                                   'h126_20000'])
      },
      {
        name: 'mapper.options.most_common_monthly_income',
        params: _.extend(_.clone(Indicators.queries.householdIncome, true), Indicators.queries.areaModeModifier),
        config: _medianMonthlyIncomeConfig,
        parser: _medianParserFactory(_medianMonthlyIncomeConfig)
      },
      {
        name: 'mapper.options.most_common_occupation_men',
        params: _.extend(_.clone(Indicators.queries.occupationMale, true), Indicators.queries.areaModeModifier),
        config: _modeOccupationConfig,
        parser: _medianParserFactory(_modeOccupationConfig)
      },
      {
        name: 'mapper.options.most_common_occupation_women',
        params: _.extend(_.clone(Indicators.queries.occupationFemale, true), Indicators.queries.areaModeModifier),
        config: _modeOccupationConfig,
        parser: _medianParserFactory(_modeOccupationConfig)
      },
      {
        name: 'mapper.options.most_common_industry_men',
        params: _.extend(_.clone(Indicators.queries.industryMale, true), Indicators.queries.areaModeModifier),
        config: _modeIndustryConfig,
        parser: _medianParserFactory(_modeIndustryConfig)
      },
      {
        name: 'mapper.options.most_common_industry_women',
        params: _.extend(_.clone(Indicators.queries.industryFemale, true), Indicators.queries.areaModeModifier),
        config: _modeIndustryConfig,
        parser: _medianParserFactory(_modeIndustryConfig)
      },
      {
        name: 'mapper.options.percent_workers_travel',
        params: Indicators.queries.placeOfWork,
        config: _valueConfig,
        parser: _pctParserFactory(['h64_hong', 'h65_kowloon', 'h66_new', 'h67_other', 'h68_no', 'h70_places'])
      },
      // Misc
      {
        name: 'mapper.options.residence_stability',
        params: Indicators.queries.migration,
        config: _valueConfig,
        parser: _pctParserFactory(['a191_moved', 'a192_remained'])
      },
    ];

    var tFilter = $filter('translate')

    angular.forEach($scope.indicators, function(indicator) {
      indicator.displayedName =  tFilter(indicator.name); 
      console.log(indicator.displayedName);
    })


    $scope.mapLevel = 'ca';
    $scope.theData = $scope.areaData;
  }]);