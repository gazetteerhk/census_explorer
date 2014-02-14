'use strict';

// API browser
angular.module('frontendApp').controller('BrowserCtrl', ['$scope', 'CensusAPI', 'ngTableParams', function($scope, CensusAPI, ngTableParams) {
  // Selected options
  $scope.model = {};
  // Available options
  $scope.options = {};

  // Build the query from the model filters
  $scope.refresh = function() {
    var q = new CensusAPI.Query($scope.model);
    q.addParam('return', 'options');

    q.fetch().then(function(data) {
      $scope.options = data.options;
      $scope.meta = data.meta;
      console.log('data');
      console.log(data);

      $scope.tableParams = new ngTableParams({
        page: 1,            // show first page
        count: 10           // count per page
      }, {
        total: data.meta.length, // length of data
        getData: function($defer, params) {
          $scope.skip = (params.page() - 1) * params.count();
          $scope.count = params.count();
          var current_view_q = new CensusAPI.Query($scope.model);
          current_view_q.addParam('return', 'options,data');
          current_view_q.addParam('projector', 'region,district,area,table,row,column,value');
          current_view_q.addParam('skip', $scope.skip);
          current_view_q.addParam('count', $scope.count);
          current_view_q.fetch().then(function(data){
            $defer.resolve(CensusAPI.joinData(data.data));
          })
        }
      });

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