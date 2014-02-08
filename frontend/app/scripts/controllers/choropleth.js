'use strict';

angular.module('frontendApp')
  .controller('ChoroplethCtrl', ['$scope', 'Mappings', function ($scope, Mappings) {
    // Generate some dummy data
    $scope.districtData = _.map(Mappings.getAllDistricts(), function(district) {
      return {code: district, value: Math.random() * 100};
    });

    $scope.areaData = _.map(Mappings.getAllAreas(), function(area){
      return {code: area, value: Math.random() * 100};
    });

    $scope.mapLevel = 'ca';
  }]);