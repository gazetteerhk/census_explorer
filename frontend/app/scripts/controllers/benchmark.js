angular.module('frontendApp').controller('BenchmarkCtrl', ['$scope', 'CensusAPI', 'Indicators', '$q', function($scope, CensusAPI, Indicators, $q) {
  $scope.isRunning = false;
  $scope.results = [];

  $scope.run = function() {
    $scope.isRunning = true;
    $scope.canceler = $q.defer();
    $scope.results.length = 0;

    var startTime, counter, endTime, q;
    counter = 0;
    startTime = Date.now();
    $scope.allRequests = [];

    _.forOwn(Indicators.queries, function(v, k) {
      var thisStart = Date.now();
      console.log('Indicator: ' + k);
      q = new CensusAPI.Query(v);
      var promise = q.fetch({timeout: $scope.canceler.promise}).then(function(res) {
        var thisEnd = Date.now() - thisStart;
        console.log("Got response in " + (thisEnd) + "ms");
        console.log(res);
        counter += 1;
        $scope.results.push({indicator: k, time: thisEnd});
      });

      $scope.allRequests.push(promise);
    });

    $q.all($scope.allRequests).then(function(res) {
      endTime = Date.now() - startTime;
      console.log("Total time for all indicators: " + (endTime) + "ms");
      console.log("Avg " + (endTime / counter) + " per request");
    });
  };

  $scope.runSequential = function() {
    // run all the queries, but sequentially (e.g. next query is not started until the first one finishes)
    $scope.results.length = 0;
    $scope.isRunning = true;
    $scope.canceler = $q.defer();

    var startTime, counter, endTime, q;
    counter = 0;
    startTime = Date.now();
    var def = $q.defer();
    $scope.requestSequence = def.promise;

    _.forOwn(Indicators.queries, function(v, k) {
      var requestGetter = function() {
        var nextDefer = $q.defer();
        var thisStart = Date.now();
        console.log('Indicator: ' + k);
        q = new CensusAPI.Query(v);
        var promise = q.fetch({timeout: $scope.canceler.promise}).then(function(res) {
          var thisEnd = Date.now() - thisStart;
          console.log("Got response in " + (thisEnd) + "ms");
          console.log(res);
          $scope.results.push({indicator: k, time: thisEnd});
          counter += 1;
          nextDefer.resolve();
        });

        return nextDefer.promise;
      };

      $scope.requestSequence = $scope.requestSequence.then(requestGetter);
    });

    def.resolve();
  };

}]);