'use strict';

angular.module('frontendApp')
  .controller('MediansCtrl', ['$scope', 'AreaSelection', function($scope, AreaSelection) {

    $scope.selection = AreaSelection.getModel();


}]);