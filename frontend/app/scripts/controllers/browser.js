'use strict';

// API browser
angular.module('frontendApp').controller('BrowserCtrl', ['$scope', 'CensusAPI', 'ngTableParams', function($scope, CensusAPI, ngTableParams) {
  // Selected options
  $scope.model = {};
  // Available options
  $scope.options = {};

  $scope.skip = 0;
  $scope.count = 20; 

  // Build the query from the model filters
  $scope.refresh = function() {
    var q = new CensusAPI.Query($scope.model);
    q.addParam('return', 'options,data');
    q.addParam('projector', 'area,value')
    q.addParam('skip', $scope.skip);
    q.addParam('count', $scope.count);

    q.fetch().then(function(data) {
      $scope.options = data.options;
      $scope.meta = data.meta;
      $scope.data = CensusAPI.joinData(data.data);
      console.log($scope.data);

    });
  };


  $scope.tableParams = new ngTableParams({
        page: 1,            // show first page
        count: 10           // count per page
      }, {
        total: , // length of data
        getData: function($defer, params) {
          $scope.skip = (params.page() - 1) * params.count();
          $scope.count = params.count();
          $defer.resolve($scope.data);
        }
      });

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