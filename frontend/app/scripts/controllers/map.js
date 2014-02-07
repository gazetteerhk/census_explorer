'use strict'

var MapCtrl = function($scope, $http, GeoFiles, AreaSelection) {
  $scope.selection = AreaSelection.getModel();
  $scope.clearAndRedraw = function() {
    $scope.selection.clearSelected();
    $scope.$broadcast('redrawMap');
  }
};



angular.module('frontendApp')
    .controller('MapCtrl', MapCtrl);