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
    'cgBusy',
    'angulartics',
    'angulartics.google.analytics'
  ])
  .config(['$routeProvider', function($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl'
      })
      .when('/choropleth', {
        templateUrl: 'views/choropleth.html',
        controller: 'ChoroplethCtrl'
      })
      .when('/profiles', {
        templateUrl: 'views/profiles.html',
        controller: 'ProfilesCtrl'
      })
      .when('/browser', {
        templateUrl: 'views/browser.html',
        controller: 'BrowserCtrl'
      })
      .otherwise({
        redirectTo: '/'
      })
  }]).run([function() {
    // We'll manually load the translation namespaces, because the config block
    // Appears to have some bugs in how it requests namespace files.
    // Specifically, having both the ns key and the fallbackNS key causes files to be requested
    // from the server twice.
    i18n.init({
      // lng: 'en-US', //removed to allow override by query string
      useCookie: false,
      useLocalStorage: false,
      detectLngQS: 'lang',
      fallbackLng: 'en-US',
      // Must have the ns key, even though we have the fallbackNS field, otherwise it doesn't properly load namespaces
      ns: {
        namespaces: ['generated_ns', 'human_ns'],
        defaultNs: 'human_ns'
      },
      // This line seems to cause double loading of namespace files if you use ng-i18next config block
      // But is required to have automatic fallback
      fallbackNS: ['human_ns', 'generated_ns'],
      load: 'current',
      resGetPath: 'locale/__lng__/__ns__-translation.json',
      getAsync: false // We'll block, since the translation files are pretty critical
    });


    BOOMR.init({
      beacon_url: "/boomerang.gif",
      BW: {
        enabled: false
      }
    });

    BOOMR.subscribe('before_beacon', trackInAnalytics);
    var pageType = "homepage"; // customize this
    var pageTitle = "Measuring pageSpeed in GA"; // customize this
    function trackInAnalytics(beacon) {
      try {
        if (!beacon.t_done || beacon.t_done < 0) return;
        var timeTaken = beacon.t_done;
        _gaq.push(['_trackEvent', pageType + 'PageLoad', getBucket(
          timeTaken), pageTitle, timeTaken]);
      } catch (e) {}
    }

    function getBucket(timeTaken) {
      var bucketString;
      var bucket = [1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000,
        5500, 6000, 6500, 7000, 7500, 8000, 9000, 10000, 15000, 20000,
        30000, 45000, 60000
      ];
      for (var b = 0; b < bucket.length; b++) {
        if (timeTaken < bucket[b]) {
          bucketString = '< ' + bucket[b] / 1000 + 's';
          break;
        }
      }
      if (!bucketString) bucketString = '> ' + bucket[bucket.length - 1] /
        1000 + 's';
      return bucketString;
    }
  }]);

angular.module('frontendApp').filter('translate', function() {
  return function(input, expression, translate) {
    if (_.isUndefined(input)) {
      return;
    }

    var prefix = (expression || {}).prefix;
    //else it is variable
    //TODO refactor the prefix design

    // if the translate toggle is not provided, then we should translate by default
    if (translate === false) {
      return input;
    } else {
      if (_.isUndefined(prefix) || _.isNull(prefix)) {
        return i18n.t(input, expression);
      } else {
        return i18n.t(prefix + '.' + input);
      }
    }
  }
});
