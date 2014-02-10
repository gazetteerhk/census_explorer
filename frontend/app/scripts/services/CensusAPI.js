'use strict';


angular.module('frontendApp').factory('CensusAPI', ['$log', '$http', '$q', function($log, $http, $q) {
  var svc = {};
  svc.endpointURL = 'http://137.189.97.90:5901/api';

  svc._baseFilters = {
    area: {},
    table: {},
    column: {},
    row: {},
    projector: {},
    options: {},
    groupBy: {}
  };

  var Query = function(filters) {
    /*
     * Object for handling queries to the Census API
     * Filters are added with methods on the object
     *
     * If constructor is passed an object, then that becomes the filters
     */

    this._filters = _.clone(svc._baseFilters, true);

    if (!_.isUndefined(filters)) {
      this.addParam(filters);
    }
  };

  var _isValidParam = function(param) {
    var valid_fields = _.keys(svc._baseFilters);
    if (_.indexOf(valid_fields, param) === -1) {
      throw String(param) + " is not a valid parameter";
    }
  };

  Query.prototype._addSingleParam = function(param, values) {
    _isValidParam(param);
    if (_.isArray(values)) {
      _.forEach(values, function(val) {
        this._filters[param][val] = true;
      }, this);
    } else if (_.isPlainObject(values)) {
      _.forEach(_.keys(values), function(val) {
        this._filters[param][val] = true;
      }, this);
    } else {
      this._filters[param][values] = true;
    }
  };

  Query.prototype.addParam = function(param, values) {
    if (_.isPlainObject(param)) {
      _.forOwn(param, function(vals, f) {
        this._addSingleParam.apply(this, [f, vals]);
      }, this);
    } else {
      this._addSingleParam(param, values);
    }
  };

  Query.prototype.fetch = function() {
    /*
     * Sends the request to the API with the provided filters
     *
     * Returns:
     * --------
     * Promise object
     */

    var promise = $http.get(svc.endpointURL, {params: this._filters, cache: true});

    return promise;
  };

  Query.prototype.clone = function() {
    /*
     * Returns a new Query instance with a copy of the parameters
     */

    return new Query(this._filters);
  };

  svc.Query = Query;

  return svc;
}]);