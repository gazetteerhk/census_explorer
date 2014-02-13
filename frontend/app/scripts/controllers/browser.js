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

    var data = [{name: "Moroni", age: 50},
                {name: "Tiancum", age: 43},
                {name: "Jacob", age: 27},
                {name: "Nephi", age: 29},
                {name: "Enos", age: 34},
                {name: "Tiancum", age: 43},
                {name: "Jacob", age: 27},
                {name: "Nephi", age: 29},
                {name: "Enos", age: 34},
                {name: "Tiancum", age: 43},
                {name: "Jacob", age: 27},
                {name: "Nephi", age: 29},
                {name: "Enos", age: 34},
                {name: "Tiancum", age: 43},
                {name: "Jacob", age: 27},
                {name: "Nephi", age: 29},
                {name: "Enos", age: 34}];
    $scope.tableParams = new ngTableParams({
        page: 1,            // show first page
        count: 10           // count per page
    }, {
        total: data.length, // length of data
        getData: function($defer, params) {
            $defer.resolve(data.slice((params.page() - 1) * params.count(), params.page() * params.count()));
        }
    });

}]);