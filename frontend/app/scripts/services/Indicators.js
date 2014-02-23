'use strict';

/*
 * A collection of configurations for commonly used indicators
 */
angular.module('frontendApp').factory('Indicators', [function() {
  var svc = {};
  /*
   * Color Scales
   *
   * ColorBrewer provides scales for anything with less than 11 categories, but sometimes we need a bit more
   * For example, the tables with income information have 12-15 categories each.
   */
  var colors = {};

  /*
   * Parsers
   *
   * Parsers are callables that are given an API data object, and return a list of data objects that can be use by charts
   */

  /*
   * Ordering
   */
  var ordering = {};

  ordering.ageGroup = [
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
  ];

  svc.ordering = ordering;

  /*
   * Query Parameters
   *
   * Common query parameters
   */

  var queries = {};

  queries.areaMedianModifier = {
    groupby: 'area',
    aggregate: 'median',
    projector: ['value', 'row'],
    return: ['groups', 'options']
  };

  queries.areaModeModifier = {
    groupby: 'area',
    aggregate: 'max',
    projector: ['value', 'row'],
    return: ['groups', 'options']
  };

  queries.ethnicity = {
    table: 0,
    column: 'tab0_both',
    projector: ['area', 'value', 'row'],
    return: ['data', 'options']
  };

  queries.maritalStatus = {
    table: 2,
    column: 'e28_both',
    projector: ['area', 'value', 'row'],
    return: ['data', 'options']
  };

  queries.maritalStatusMale = {
    table: 2,
    column: 'c28_male',
    projector: ['area', 'value', 'row'],
    return: ['data', 'options']
  };

  queries.maritalStatusFemale = {
    table: 2,
    column: 'd28_female',
    projector: ['area', 'value', 'row'],
    return: ['data', 'options']

  };

  queries.educationalAttainment = {
    table: 3,
    column: 'e43_total',
    projector: ['area', 'value', 'row'],
    return: ['data', 'options']
  };

  queries.economicStatus = {
    table: 4,
    column: 'e61_both',
    projector: ['area', 'value', 'row'],
    return: ['data', 'options']
  };

  queries.economicStatusMale = {
    table: 4,
    column: 'c61_male',
    projector: ['area', 'value', 'row'],
    return: ['data', 'options']
  };

  queries.economicStatusFemale = {
    table: 4,
    column: 'd61_female',
    projector: ['area', 'value', 'row'],
    return: ['data', 'options']
  };

  queries.monthlyIncome = {
    table: 5,
    column: 'e77_both',
    projector: ['area', 'value', 'row'],
    return: ['data', 'options']
  };

  queries.monthlyIncomeMale = {
    table: 5,
    column: 'c77_male',
    projector: ['area', 'value', 'row'],
    return: ['data', 'options']
  };

  queries.monthlyIncomeFemale = {
    table: 5,
    column: 'd77_female',
    projector: ['area', 'value', 'row'],
    return: ['data', 'options']
  };

  queries.householdComposition = {
    table: 6,
    projector: ['area', 'value', 'row'],
    return: ['data', 'options']
  };

  queries.householdSize = {
    table: 7,
    projector: ['area', 'value', 'row'],
    return: ['data', 'options']
  };

  queries.householdHousingType = {
    table: 8,
    column: 'd146_households',
    projector: ['area', 'value', 'row'],
    return: ['data', 'options']
  };

  queries.housingTenure = {
    table: 9,
    projector: ['area', 'value', 'row'],
    return: ['data', 'options']
  };

  queries.individualHousingType = {
    table: 10,
    column: 'e168_both',
    projector: ['area', 'value', 'row'],
    return: ['data', 'options']
  };

  queries.individualHousingTypeMale = {
    table: 10,
    column: 'c168_male',
    projector: ['area', 'value', 'row'],
    return: ['data', 'options']
  };

  queries.individualHousingTypeFemale = {
    table: 10,
    column: 'd168_female',
    projector: ['area', 'value', 'row'],
    return: ['data', 'options']
  };

  queries.migration = {
    table: 11,
    projector: ['area', 'value', 'row'],
    return: ['data', 'options']
  };

  queries.age = {
    table: 12,
    column: 'n6_both',
    projector: ['area', 'value', 'row'],
    return: ['data', 'options']
  };

  queries.ageMale = {
    table: 12,
    column: 'l6_male',
    projector: ['area', 'value', 'row'],
    return: ['data', 'options']
  };

  queries.ageFemale = {
    table: 12,
    column: 'm6_female',
    projector: ['area', 'value', 'row'],
    return: ['data', 'options']
  };

  queries.placeOfStudy = {
    table: 14,
    projector: ['area', 'value', 'row'],
    return: ['data', 'options']
  };

  queries.placeOfWork = {
    table: 15,
    column: 'n61_both',
    projector: ['area', 'value', 'row'],
    return: ['data', 'options']
  };

  queries.placeOfWorkMale = {
    table: 15,
    column: 'l61_male',
    projector: ['area', 'value', 'row'],
    return: ['data', 'options']
  };

  queries.placeOfWorkFemale = {
    table: 15,
    column: 'm61_female',
    projector: ['area', 'value', 'row'],
    return: ['data', 'options']
  };

  queries.occupation = {
    table: 16,
    column: 'n81_both',
    projector: ['area', 'value', 'row'],
    return: ['data', 'options']
  };

  queries.occupationMale = {
    table: 16,
    column: 'l81_male',
    projector: ['area', 'value', 'row'],
    return: ['data', 'options']
  };

  queries.occupationFemale = {
    table: 16,
    column: 'm81_female',
    projector: ['area', 'value', 'row'],
    return: ['data', 'options']
  };

  queries.industry = {
    table: 17,
    column: 'n95_both',
    projector: ['area', 'value', 'row'],
    return: ['data', 'options']
  };

  queries.industryMale = {
    table: 17,
    column: 'l95_male',
    projector: ['area', 'value', 'row'],
    return: ['data', 'options']
  };

  queries.industryFemale = {
    table: 17,
    column: 'm95_female',
    projector: ['area', 'value', 'row'],
    return: ['data', 'options']
  };

  queries.householdIncome = {
    table: 18,
    column: 'n118_households',
    projector: ['area', 'value', 'row'],
    return: ['data', 'options']
  };

  queries.householdMortgage = {
    table: 19,
    projector: ['area', 'value', 'row'],
    return: ['data', 'options']
  };

  queries.householdRent = {
    table: 20,
    projector: ['area', 'value', 'row'],
    return: ['data', 'options']
  };

  svc.queries = queries;

  return svc;

}]);