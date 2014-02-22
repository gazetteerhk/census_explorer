'use strict';

// API browser
angular.module('frontendApp').controller('BrowserCtrl', ['$scope', 'CensusAPI', 'ngTableParams', function($scope, CensusAPI, ngTableParams) {
  // Selected options
  var _defaultModel = {skip: 0, count: 5};
  $scope.model = _.clone(_defaultModel);
  // Available options
  $scope.options = {};

  // Build the query from the model filters
  $scope.refresh = function() {
    var q = new CensusAPI.Query($scope.model);
    q.addParam('return', 'options,data');
    q.addParam('projector', 'region,district,area,table,row,column,value');
    // q.addParam('skip', '0');
    // q.addParam('count', '5');

    q.fetch().then(function(response) {
      $scope.options = response.options;
      // Sort the areas and regions
      $scope.options.area = _.sortBy($scope.options.area);
      $scope.options.district = _.sortBy($scope.options.district);
      $scope.meta = response.meta;
      $scope.data = CensusAPI.joinData(response.data);
      //console.log('response');
      //console.log(response);

      $scope.tableParams = new ngTableParams({
        page: 1,            // show first page
        count: 5           // count per page
      }, {
        total: response.meta.length, // length of data
        getData: function($defer, params) {
          $scope.model['skip'] = (params.page() - 1) * params.count();
          $scope.model['count'] = params.count();
          var current_view_q = new CensusAPI.Query($scope.model);
          current_view_q.addParam('return', 'options,data');
          current_view_q.addParam('projector', 'region,district,area,table,row,column,value');
          current_view_q.addParam('skip', $scope.model['skip']);
          current_view_q.addParam('count', $scope.model['count']);
          current_view_q.fetch().then(function(response){
            $scope.data = CensusAPI.joinData(response.data);
            $defer.resolve($scope.data);
          })
        }
      });

      $scope.tableParams.page(1);
      //$scope.tableParams.reloadPages();
    });
  };

  // Clear all selections, or the selection for a single model field
  $scope.clear = function(field) {
    if (_.isUndefined(field)) {
      $scope.model = _.clone(_defaultModel);
    } else {
      delete $scope.model[field];
    }
    $scope.refresh();
  };

  $scope.refresh();

}]);
