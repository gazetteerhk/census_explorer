'use strict';

angular.module('frontendApp')
  .controller('GetDataCtrl', function ($scope) {
  	$scope.api_prefix = 'http://golden-shine-471.appspot.com/api';
  	$scope.raw_json_prefix = 'http://hupili.net/projects/hk_census/data-clean/';
  	$scope.raw_json_archive = 'http://hupili.net/projects/hk_census/data-clean.tar.gz';

  });