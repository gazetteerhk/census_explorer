'use strict';


angular.module('frontendApp').factory('CensusAPI', ['$log', '$http', '$q', function($log, $http, $q) {
  var svc = {};
//  svc.endpointURL = 'http://137.189.97.90:5901/api';

  //TODO:
  //    An application scope configuration entry to store the server_prefix
  //    Expose this to a config block or something
  svc.endpointURL = 'http://192.168.222.3:8080/api/';

  svc._baseFilters = {
    area: {},
    table: {},
    column: {},
    row: {},
    projector: {},
    return: {},
    groupby: {},
    aggregate: {}
  };

  svc.joinData = function(data) {
    /*
     * Given a data hash of structure
     * {
     *   area: ['a01', 'a02'],
     *   value: [1, 2]
     * }
     *
     * Returns an array of structure:
     * [
     *   {
     *     area: 'a01',
     *     value: 1
     *   },
     *   {
     *     area: 'a02',
     *     value: 2
     *   }
     * ]
     */

    var len = _.values(data)[0].length;
    var res = [];
    var thisDatum;
    var dataKeys = _.keys(data);

    for (var i=0; i<len; i++) {
      thisDatum = {};
      _.forEach(dataKeys, function(key) {
        thisDatum[key] = data[key][i];
      });
      res.push(thisDatum);
    }

    return res;
  };

  svc.asPercentage = function(data, grouping) {
    /*
     * Given an array of data objects:
     * [
     *   {
     *     area: 'a01',
     *     table: 1,
     *     value: 1
     *   },
     *   {
     *     area: 'a02',
     *     table: 1,
     *     value: 2
     *   }
     * ]
     *
     * Returns a new array of data objects with value replaced as the percentage of the total within the grouping
     *
     * The grouping is specified as either a string or an array of strings representing data keys, and the total is taken to be the
     * sum of the values over unique combinations of the groups.
     * For example, if grouping were 'table', then the values from both objects in the array above would be added to gether
     * to get the table total
     */

    // Check the grouping
    return undefined;

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
      throw '[CensusAPI]: "' + String(param) + '" is not a valid parameter';
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

  var _prepFilters = function(filters) {
    /*
     * Converts objects in the filters dictionary to comma separated strings
     */
    var theFilters = _.omit(filters, function(val, key) {return _.isEmpty(val);});

    return _.mapValues(theFilters, function(val) {
      return _.keys(val).join(',');
    });
  };

  Query.prototype.fetch = function() {
    /*
     * Sends the request to the API with the provided filters
     *
     * Returns:
     * --------
     * Promise object
     */

    var deferred = $q.defer();
    $http.get(svc.endpointURL, {params: _prepFilters(this._filters), cache: true}).then(function(res) {
      deferred.resolve(res.data);
    });

    return deferred.promise;
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