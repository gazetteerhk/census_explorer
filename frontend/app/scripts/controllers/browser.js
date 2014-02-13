'use strict';

// API browser
angular.module('frontendApp').controller('BrowserCtrl', ['$scope', 'CensusAPI', function($scope, CensusAPI) {
  // Selected options
  $scope.model = {};
  // Available options
  $scope.options = {};

  // Build the query from the model filters
  $scope.refresh = function() {
    var q = new CensusAPI.Query($scope.model);
    q.addParam('return', 'options');
    q.addParam('skip', 0);
    q.addParam('count', 20);

    q.fetch().then(function(data) {
      $scope.options = data.options;
      $scope.meta = data.meta;
      $scope.data = data.data;
    });
  };

  // Clear all selections, or the selection for a single model field
  $scope.clear = function(field) {
    if (_.isUndefined(field)) {
      $scope.model = {};
    } else {
      delete $scope.model[field];
    }
    $scope.refresh();
  };

  $scope.refresh();
}]);