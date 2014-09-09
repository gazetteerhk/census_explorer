'use strict';


angular.module('frontendApp').factory('CensusAPI', ['$log', '$http', '$q', function($log, $http, $q) {
  var svc = {};
  
  //TODO:
  //    An application scope configuration entry to store the server_prefix
  //    Expose this to a config block or something
  svc.endpointURL = 'http://128.199.138.207:8080/api/';
//  svc.endpointURL = 'http://137.189.97.90:5901/api/';
  //svc.endpointURL = 'http://192.168.222.3:8080/api/';

  // All possible parameter keys
  svc._baseFilters = {
    area: {},
    table: {},
    column: {},
    row: {},
    projector: {},
    return: {},
    groupby: {},
    aggregate: {},
    region: {},
    district: {},
    skip: {},
    count: {}
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

  svc.joinGroups = function(data, groupName) {
    /*
     * Given a groups hash of this structure:
     * {
     *   a01: {data hash object},
     *   a02: {data hash object}
     * }
     *
     * Get:
     * [
     *   {data object, groupName: a01},
     *   {data object, groupName: a02}
     * ]
     *
     * Calling joinGroup(data) will unpack and concatenate the data hashes using joinData
     * If groupName is provided, then the grouping key will be added to each element of the data hash
     */
    if (_.isString(groupName)) {
      var res = [];
      _.forOwn(data, function(d, k) {
        var unpacked = svc.joinData(d);
        _.forEach(unpacked, function(u) {u[groupName] = k;});
        res.push(unpacked);
      });
      return _.flatten(res);
    } else {
      return _.flatten(_.map(_.values(data), svc.joinData));
    }
  };

  svc.sumBy = function(data, grouping) {
    if (_.isString(grouping)) {
      grouping = [grouping];
    }

    var agg = {};
    _.forEach(data, function(d) {
      var key = _.map(grouping, function(g) {return d[g]}).join(',');
      if (!_.has(agg, key)) {
        agg[key] = 0;
      }
      agg[key] += d.value;
    });

    return agg;
  };

  svc.asPercentage = function(data, grouping) {
    /*
     * Given a data array
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
     * The grouping is specified as a string or an array of strings, and the total is taken to be the sum of the values with the same key value
     * For example, if grouping were 'table', then the values from both objects in the array above would be added together
     * to get the table total, then each value would be divided by the total to get the percentage.
     *
     * Providing an array of strings would get the totals for each combination of group values.
     */
    if (_.isString(grouping)) {
      grouping = [grouping];
    }

    var agg = svc.sumBy(data, grouping);
    var res = [];
    _.map(data, function(d) {
      var key = _.map(grouping, function(g) {return d[g];}).join(',');
      var newDatum = _.clone(d, true);
      // Avoid divide by 0
      if (agg[key] === 0 ){
        newDatum.value = 0;
      } else {
        newDatum.value = newDatum.value / agg[key];
      }
      res.push(newDatum);
    });

    return res;
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
    $http.get(svc.endpointURL, {params: _prepFilters(this._filters), cache: true, tracker: 'globalTracker'}).then(function(res) {
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