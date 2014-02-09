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

angular.module('frontendApp').factory('CensusAPI', ['$log', '$http', function($log, $http) {
  var svc = {};
  svc.endpointURL = 'http://golden-shine-471.appspot.com/api';

  var Query = function(filters) {
    /*
     * Object for handling queries to the Census API
     * Filters are added with methods on the object
     *
     * If constructor is passed an object, then that becomes the filters
     */
    if (_.isObject(filters)) {
      this._filters = _.clone(filters);
    } else {
      this._filters = {
        ca: [],
        table: [],
        column: [],
        row: []
      };
    }
  };

  Query.prototype.addFilter = function(field, values) {
    /*
     * Adds a filter to query object
     * The field determines which field to filter on, and values is appended to the internal filter hash for that field
     *
     * Arguments:
     * ----------
     * field: string, 'ca', 'table', 'column', or 'row
     * values: array of strings, or string
     *
     * Returns: null
     */

    var valid_fields = ['ca', 'table', 'column', 'row'];
    if (_.indexOf(valid_fields, field) === -1) {
      throw String(field) + "is not a valid field for filtering";
    }

    if (_.isArray(values)) {
      // Concatenate the array
      this._filters[field] = _.union(this._filters[field], values);
    } else {
      this._filters[field] = _.union(this._filters[field], [values]);
    }

    $log.debug(this._filters);
  };

  Query.prototype.fetch = function() {
    /*
     * Sends the request to the API with the provided filters
     *
     * Returns:
     * --------
     * Promise object encapsulating
     */

    var promise = $http.get(svc.endpointURL, {params: this._filters});

    return promise;
  };

  svc.Query = Query;

  return svc;
}]);
