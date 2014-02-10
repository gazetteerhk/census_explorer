'use strict';

angular.module('frontendApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'ngAnimate',
  'leaflet-directive',
])
  .config(function ($routeProvider) {
    $routeProvider
      // .when('/', {
      //   templateUrl: 'views/main.html',
      //   controller: 'MainCtrl'
      // })
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/test', {
        templateUrl: 'views/test.html',
        controller: 'TestCtrl'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl'
      })
      .when('/getdata', {
        templateUrl: 'views/getdata.html',
        controller: 'GetDataCtrl'
      })
      .when('/discover', {
        templateUrl: 'views/discover.html',
        controller: 'DiscoverCtrl'
      })
      .when('/explore', {
        templateUrl: 'views/explore.html',
        controller: 'ExploreCtrl'
      })
      .when('/choropleth', {
        templateUrl: 'views/choropleth.html',
        controller: 'ChoroplethCtrl'
      })
      .when('/medians', {
        templateUrl: 'views/medians.html',
        controller: 'MediansCtrl'
      })
      .otherwise({
        redirectTo: '/'
      })
  });

