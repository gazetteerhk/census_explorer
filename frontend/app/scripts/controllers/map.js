'use strict'

angular.module('frontendApp').controller('MapCtrl', ['$scope', '$http', 'GeoFiles', 'AreaSelection', function($scope, $http, GeoFiles, AreaSelection) {
  $scope.selection = AreaSelection.getModel();
  $scope.clearAndRedraw = function() {
    $scope.selection.clearSelected();
    $scope.$broadcast('redrawMap');
  }
}]);