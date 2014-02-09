'use strict';

angular.module('frontendApp')
  .controller('TestCtrl', ['$scope', 'GeoMappings', '$http', function ($scope, GeoMappings, $http) {
    // Generate some dummy data

//    var url = 'http://137.189.97.90:5901/api/?aggregate=median&return=groups&return=options&groupby=area&table=18&column=n118_households&projector=value&projector=row';
    var url = 'http://137.189.97.90:5901/api/?aggregate=median&return=groups&return=options&groupby=area&table=20&projector=value&projector=row';
    $http.get(url).success(function(data){
      console.log(data);
        //NOTE:
        //    Do not plot by .value. They are just the min, max, median number.
        //    What we want to plot is .row, which are categorical information.
        //    The following code creates a general map from categories to numerical values.
        //TODO:
        //    Try to find better curving function to make the colorscheme visually clearer.
        var m = {};
        for (var i=0; i < data.options.row.length; i++){
          m[data.options.row[i]] = i
        }
      $scope.areaData =_.map(data.groups, function(area,k) {
        var v = m[area.row[0]];
        return {code: k, value: v};
      }); 
    });

    // $scope.newData = function() {
    //   $scope.districtData = _.map(GeoMappings.getAllDistricts(), function(district) {
    //     return {code: district, value: Math.random() * 0};
    //   });

    //   $scope.areaData = _.map(GeoMappings.getAllAreas(), function(area){
    //     return {code: area, value: Math.random() * 0};
    //   });
    // };
    // $scope.newData();

    $scope.indicators = [
      {name: 'foo', identifier: 'bar'},
      {name: 'bar', identifier: 'baz'}
    ];

    $scope.groups = [
      {name: 'Both sexes', identifier: 'both'},
      {name: 'Male', identifier: 'male'},
      {name: 'Female', identifier: 'female'},
    ];

    $scope.mapLevel = 'ca';
    $scope.theData = $scope.areaData;
  }]);