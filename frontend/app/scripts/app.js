'use strict';

angular.module('frontendApp', [
    'ngTable',
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngRoute',
    'ngAnimate',
    'leaflet-directive',
    'jm.i18next',
    'ajoslin.promise-tracker',
    'cgBusy'
  ])
  .constant('serverPrefix', '/')
  .config(['$i18nextProvider', 'serverPrefix', function($i18nextProvider, serverPrefix) {
    // window.i18n.loadNamespaces(['human_ns', 'generated_ns'], function() { /* loaded */ });
    //auto init , not necessary to call i18.init()
    $i18nextProvider.options = {
      // lng: 'en-US', //removed to allow override by query string
      useCookie: false,
      useLocalStorage: false,
      fallbackLng: 'en-US',
      ns: 'human_ns',
      fallbackNS: ['generated_ns'],
      load: 'current',
      // fallbackLng:false,
      resGetPath: serverPrefix + 'locale/__lng__/__ns__-translation.json'
    };
  }])
  .config(['$routeProvider', function($routeProvider) {
    $routeProvider
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
      .when('/browser', {
        templateUrl: 'views/browser.html',
        controller: 'BrowserCtrl'
      })
      .otherwise({
        redirectTo: '/'
      })
  }]).run(['$i18next', function($i18next) {
    //hack to load explicitly extra namespace
    //i18next deps is needed to ensure window.i18n get init first
    window.i18n.loadNamespaces(['generated_ns'], function() { /* loaded */ });
  }]);
