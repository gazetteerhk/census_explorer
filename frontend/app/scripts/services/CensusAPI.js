'use strict';


angular.module('frontendApp').factory('CensusAPI', ['$log', '$http', '$q', function($log, $http, $q) {
  var svc = {};
  svc.endpointURL = 'http://137.189.97.90:5901/api';

  svc._baseFilters = {
    area: {},
    table: {},
    column: {},
    row: {},
    projector: {}
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
      this.addFilter(filters);
    }
  };

  var _isValidField = function(field) {
    var valid_fields = ['area', 'district', 'region', 'table', 'column', 'row', 'projector'];
    if (_.indexOf(valid_fields, field) === -1) {
      throw String(field) + " is not a valid field for filtering";
    }
  };

  Query.prototype._addSingleFieldFilter = function(field, values) {
    _isValidField(field);
    if (_.isArray(values)) {
      _.forEach(values, function(val) {
        this._filters[field][val] = true;
      }, this);
    } else {
      this._filters[field][values] = true;
    }
  };

  Query.prototype.addFilter = function(field, values) {
    if (_.isPlainObject(field)) {
      _.forOwn(field, function(vals, f) {
        this._addSingleFieldFilter.apply(this, [f, vals]);
      }, this);
    } else {
      this._addSingleFieldFilter(field, values);
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

  Query.prototype.fetchOptions = function() {
    /*
     * Sends an options only request
     */

    var filters = _.clone(this._filters, true);
    filters.return = ['options'];
    var deferred = $q.defer();

    $http.get(svc.endpointURL, {params: filters, cache: true}).success(function(data) {
      deferred.resolve(data.options);
    });
    return deferred.promise;
  };

  svc.Query = Query;

  return svc;
}]);