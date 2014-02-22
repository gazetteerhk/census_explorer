'use strict';

angular.module('frontendApp')
  .controller('ProfilesCtrl', ['$scope', 'AreaSelection', function($scope, AreaSelection) {

    $scope.selection = AreaSelection.getModel();


}]);