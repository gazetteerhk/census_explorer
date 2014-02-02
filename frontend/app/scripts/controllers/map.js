'use strict'

var MapCtrl = function($scope, $http, GeoFiles, AreaSelection) {
  $scope.selection = AreaSelection.getModel();
};



angular.module('frontendApp')
    .controller('MapCtrl', MapCtrl);