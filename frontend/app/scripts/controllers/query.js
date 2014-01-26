'use strict';

angular.module('frontendApp')
  .controller('QueryCtrl', ['$scope', 'CensusAPI', function ($scope, CensusAPI) {
    $scope.api = new CensusAPI.Query();

  }]);