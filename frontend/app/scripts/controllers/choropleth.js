'use strict';

angular.module('frontendApp')
  .controller('ChoroplethCtrl', ['$scope', 'GeoMappings', function ($scope, GeoMappings) {
    // Generate some dummy data
    $scope.newData = function() {
      $scope.districtData = _.map(GeoMappings.getAllDistricts(), function(district) {
        return {area: district, value: Math.random() * 100};
      });

      $scope.areaData = _.map(GeoMappings.getAllAreas(), function(area){
        return {area: area, value: Math.random() * 100};
      });
    };
    $scope.newData();

    $scope.indicators = [
      {name: 'foo', identifier: 'bar'},
      {name: 'bar', identifier: 'baz'}
    ];

    $scope.groups = [
      {name: 'Both sexes', identifier: 'both'},
      {name: 'Male', identifier: 'male'},
      {name: 'Female', identifier: 'female'},
    ];

    $scope.mapLevel = 'ca';
    $scope.theData = $scope.areaData;
  }]);