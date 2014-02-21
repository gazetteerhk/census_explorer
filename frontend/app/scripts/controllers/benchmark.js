angular.module('frontendApp').controller('BenchmarkCtrl', ['$scope', 'CensusAPI', 'Indicators', '$q', function($scope, CensusAPI, Indicators, $q) {
  $scope.isRunning = false;
  $scope.results = [];

  $scope.run = function() {
    $scope.isRunning = true;

    var startTime, counter, endTime, q;
    counter = 0;
    startTime = Date.now();

    $scope.allRequests = [];

    _.forOwn(Indicators.queries, function(v, k) {
      var thisStart = Date.now();
      console.log('Indicator: ' + k);
      q = new CensusAPI.Query(v);
      var promise = q.fetch().then(function(res) {
        var thisEnd = Date.now() - thisStart;
        console.log("Got response in " + (thisEnd) + "ms");
        console.log(res);
        $scope.results.push({indicator: k, time: thisEnd});
      });
      counter += 1;

      $scope.allRequests.push(promise);
    });

    $q.all($scope.allRequests).then(function(res) {
      endTime = Date.now() - startTime;
      console.log("Total time for all indicators: " + (endTime) + "ms");
      console.log("Avg " + (endTime / counter) + " per request");
    });
  };
}]);