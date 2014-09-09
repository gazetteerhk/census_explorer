'use strict';

angular.module('frontendApp')
  .controller('ChoroplethCtrl', ['$scope', 'CensusAPI', 'Indicators', function ($scope, CensusAPI, Indicators) {


    $scope.refresh = function(type){
      var model;
      switch(type){
        case 'indicator': 
          model = $scope.selectedIndicator;
          break;
        case 'facility':
          model = $scope.selectedFacility;
          break;
        default:
          console.log('unrecognized type: ' + type);
          return;
      }

      var query = new CensusAPI.Query(model.params);

      var promise = query.fetch().then(function(response) {
        var d = model.parser(response);
        $scope.mapConfig = model.config;
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

    var _identityParser = function(response){
      return CensusAPI.joinData(response.data);
    }

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
        console.log(data);
        var d = CensusAPI.asPercentage(CensusAPI.joinData(data.data), 'area');
        console.log(d);
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
        name: 'Male to female ratio (1000s)',
        params: _genderRatioParams,
        config: _valueConfig,
        parser: _genderRatioParser
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
        params: Indicators.queries.age,
        config: _valueConfig,
        parser: _pctParserFactory(['h7_0', 'h8_5', 'h9_10'])

      },
      {
        name: '% of population over 65',
        params: Indicators.queries.age,
        config: _valueConfig,
        parser: _pctParserFactory(['h20_65', 'h21_70', 'h22_75', 'h23_80', 'h24_85'])
      },
      // Ethnicity
      {
        name: '% of population that is non-Chinese',
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
        name: '% of population that is Indonesian or Filipino',
        params: Indicators.queries.ethnicity,
        config: _valueConfig,
        parser: _pctParserFactory(['tab0_filipino', 'tab0_indonesian'])
      },
      // Family and housing
      {
        name: '% of population that is divorced or separated',
        params: Indicators.queries.maritalStatus,
        config: _valueConfig,
        parser: _pctParserFactory(['a32_divorced', 'a33_separated'])
      },
      {
        name: 'Median household size',
        params: _.extend(_.clone(Indicators.queries.householdSize, true), Indicators.queries.areaMedianModifier),
        config: _medianHouseholdSizeConfig,
        parser: _medianParserFactory(_medianHouseholdSizeConfig)
      },
      {
        name: '% of households in public rental housing',
        params: _.clone(Indicators.queries.householdHousingType),
        config: _valueConfig,
        parser: _pctParserFactory(['a147_public'])
      },
      {
        name: '% of households that own their home',
        params: Indicators.queries.housingTenure,
        config: _valueConfig,
        parser: _pctParserFactory(['a156_with', 'a157_without'])
      },
      {
        name: '% of households renting their home',
        params: Indicators.queries.housingTenure,
        config: _valueConfig,
        parser: _pctParserFactory(['a158_sole', 'a159_co-tenantmain'])
      },
      {
        name: 'Median monthly household rent payment',
        params: _.extend(_.clone(Indicators.queries.householdRent, true), Indicators.queries.areaMedianModifier),
        config: _medianMonthlyIncomeConfig,
        parser: _medianParserFactory(_medianMonthlyIncomeConfig)
      },
      {
        name: 'Median monthly household mortgage payment',
        params: _.extend(_.clone(Indicators.queries.householdMortgage, true), Indicators.queries.areaMedianModifier),
        config: _medianMonthlyIncomeConfig,
        parser: _medianParserFactory(_medianMonthlyIncomeConfig)
      },
      // Education
      {
        name: 'Most common level of education',
        params: _.extend(_.clone(Indicators.queries.educationalAttainment, true), Indicators.queries.areaModeModifier),
        config: _modeEduAttainmentConfig,
        parser: _medianParserFactory(_modeEduAttainmentConfig)
      },
      {
        name: '% of population with a post-secondary education',
        params: Indicators.queries.educationalAttainment,
        config: _valueConfig,
        parser: _pctParserFactory(['a51_diplomacertificate', 'a52_sub-degree', 'a53_degree'])
      },
      {
        name: '% of students that travel to another district for school',
        params: Indicators.queries.placeOfStudy,
        config: _valueConfig,
        parser: _pctParserFactory(['h44_hong', 'h45_kowloon', 'h46_new', 'h47_other'])
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
        name: 'Most common monthly income',
        params: _.extend(_.clone(Indicators.queries.householdIncome, true), Indicators.queries.areaModeModifier),
        config: _medianMonthlyIncomeConfig,
        parser: _medianParserFactory(_medianMonthlyIncomeConfig)
      },
      {
        name: 'Most common occupation for men',
        params: _.extend(_.clone(Indicators.queries.occupationMale, true), Indicators.queries.areaModeModifier),
        config: _modeOccupationConfig,
        parser: _medianParserFactory(_modeOccupationConfig)
      },
      {
        name: 'Most common occupation for women',
        params: _.extend(_.clone(Indicators.queries.occupationFemale, true), Indicators.queries.areaModeModifier),
        config: _modeOccupationConfig,
        parser: _medianParserFactory(_modeOccupationConfig)
      },
      {
        name: 'Most common industry for men',
        params: _.extend(_.clone(Indicators.queries.industryMale, true), Indicators.queries.areaModeModifier),
        config: _modeIndustryConfig,
        parser: _medianParserFactory(_modeIndustryConfig)
      },
      {
        name: 'Most common industry for women',
        params: _.extend(_.clone(Indicators.queries.industryFemale, true), Indicators.queries.areaModeModifier),
        config: _modeIndustryConfig,
        parser: _medianParserFactory(_modeIndustryConfig)
      },
      {
        name: '% of workers that travel to another district for work',
        params: Indicators.queries.placeOfWork,
        config: _valueConfig,
        parser: _pctParserFactory(['h64_hong', 'h65_kowloon', 'h66_new', 'h67_other', 'h68_no', 'h70_places'])
      },
      // Misc
      {
        name: 'Residence stability (% of population that lived in the same area 5 years ago)',
        params: Indicators.queries.migration,
        config: _valueConfig,
        parser: _pctParserFactory(['a191_moved', 'a192_remained'])
      },
      // Public facility 
      {
        name: '# of Government Wifi Premises)',
        params: {"table":"100","column":"n_facilities","row":"f39_govwifi","return":"data","projector": "area,row,value"},
        config: _valueConfig,
        parser: _identityParser
      },
      {
        name: '# of International Primary School)',
        params: {"table":"100","column":"n_facilities","row":"f46_international","return":"data","projector": "area,row,value"},
        config: _valueConfig,
        parser: _identityParser
      }
    ];

    $scope.facilities = [];
    var query = new CensusAPI.Query({
      "table":"100",
      "column":"n_facilities",
      "return":"options"
    })
    var promise = query.fetch().then(function(response){
      _.map(response.options.row, function(value){
        $scope.facilities.push({
          name: 'Public Facility:' + i18n.t('row.' + value),
          params: {"table":"100","column":"n_facilities","row":value,"return":"data","projector": "area,row,value"},
          config: _valueConfig,
          parser: _identityParser
        }); 
      });
    });

    $scope.mapLevel = 'ca';
    $scope.theData = $scope.areaData;
  }]);