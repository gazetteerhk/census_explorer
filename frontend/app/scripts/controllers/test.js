'use strict';

angular.module('frontendApp')
  .controller('TestCtrl', ['$scope', 'GeoMappings', '$http', function ($scope, GeoMappings, $http) {

$scope.refresh = function(){
  console.log('indicator:');
  console.log($scope.selectedIndicator);
  //TODO:
  //    An application scope configuration entry to store the server_prefix
  var server_prefix = 'http://137.189.97.90:5901';
  var url = server_prefix
    + '/api/?return=groups&return=options&groupby=area&projector=value&projector=row'
    + $scope.selectedIndicator;
  console.log('refresh with url:' + url);

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
          //TODO:
          //    suggest data structure:
          //    - area: area
          //    - value: a numerical level for coloring purpose
          //    - name: the human readable category name, e.g. '>= 20000'.
          //            Can be used in legend.
          return {code: k, value: v};
        }); 
      });
};

    $scope.indicators = [
      {name: 'The median monthly income across areas?', identifier: '&table=18&column=n118_households&aggregate=median'},
      {name: 'The mode (max frequency) of monthly income across areas?', identifier: '&table=18&column=n118_households&aggregate=max'},
      {name: 'The median rental fee across area?', identifier: '&table=20&aggregate=median'}
    ];

    // init with one plot
    $scope.selectedIndicator = '&table=18&column=n118_households&aggregate=median';
    $scope.refresh();

    $scope.mapLevel = 'ca';
    $scope.theData = $scope.areaData;
  }]);