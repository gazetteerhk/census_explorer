'use strict';

angular.module('frontendApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'ngAnimate'
])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl'
      })
      .when('/discover', {
        templateUrl: 'views/discover.html',
        controller: 'DiscoverCtrl'
      })
      .when('/explore', {
        templateUrl: 'views/explore.html',
        controller: 'ExploreCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });


angular.module('frontendApp').factory('CensusAPI', ['$log', '$http', function($log, $http) {
  var svc = {};

  var APIQuery = function() {
    /*
     * Object for handling queries to the Census API
     * Filters are added with methods on the object
     */
    this._filters = {
      ca: [],
      table: [],
      column: [],
      row: []
    };
  };

  APIQuery.prototype.addFilter = function(field, values) {
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
      this.filters[field] = _.union(this._filters[field], [values]);
    }
  };


  return svc;
}]);
