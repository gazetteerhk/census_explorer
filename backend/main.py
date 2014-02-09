import collections
import urllib
from flask import Flask, jsonify, request

app = Flask(__name__)

import logging

@app.route('/')
def hello_world():
    return 'Census Explorer'

def parse_argument(query_string):
    """
    Takes a raw query_string from the request parameters, and returns a
    list of url decoded strings that can be used in the filtering.

    If query_string is None, then returns None
    """
    if query_string is None or len(query_string) == 0:
        return None
    # res = urllib.unquote_plus(query_string).split(',')
    res = map(urllib.unquote_plus, query_string)
    return res


@app.route('/api')
def api():
    """
    API Endpoint for accessing the data
    Takes query parameters in order to filter the dataset down

    Arguments:
    ----------
    ca: constituency areas
        Comma separated string of CA codes -- "a01,a02", etc.

    table: table name
        Comma separated string of the tables requested.  Must be urlencoded - "ethnicity"

    row: row name
        Comma separated string of the rows.  Urlencoded - "chinese"

    column: column name
        Comma separated string of the columns.  Urlencoded - "male"

    options: 0 or 1
        If options 1, then the response also includes an "options" key that
        lists the possible values for unspecified columns to further narrow the data down

        If there are no parameters provided, then options is 1 by default, and no data is returned

    Returns:
    --------
    JSON response, of the form:
    {
        data: [
            {
                constituency_area: {
                    name: string,
                    code: string,
                    district: string
                },
                table: string,
                row: string,
                column: string
                value: float or None
            },
            ...
        ],
        options: {
            table: []
        }
    }


    """

    return jsonify({'test hub': 'OK'})

    import time
    _time_start = time.time()

    # Parse the arguments
    ca = parse_argument(request.args.getlist('ca', None))
    table = parse_argument(request.args.getlist('table', None))
    row = parse_argument(request.args.getlist('row', None))
    column = parse_argument(request.args.getlist('column', None))
    options = bool(int(request.args.get('options', 0)))

    ca_obj_cache = None

    # Incrementally build the query
    query = models.Datapoint.query()
    if ca is not None:
        # constituency_area is a KeyProperty, so we need to retrieve these separately
        # Need to keep these objects later for
        ca_objs = models.ConstituencyArea.query(models.ConstituencyArea.code.IN(ca)).fetch()
        ca_obj_cache = dict((x.code, x) for x in ca_objs)
        ca_keys = [x.key for x in ca_objs]
        query = query.filter(models.Datapoint.constituency_area.IN(ca_keys))
    if table is not None:
        query = query.filter(models.Datapoint.table.IN(table))
    if row is not None:
        query = query.filter(models.Datapoint.row.IN(row))
    if column is not None:
        query = query.filter(models.Datapoint.column.IN(column))

    res = {}

    # If the query was filtered, then get the data
    no_filters_provided = all([ca is None, table is None, row is None, column is None])
    if not no_filters_provided:
        data = [x.to_dict() for x in query.fetch()]
        # Replace each constituency area with the actual entity
        # If the ca argument was not provided, we need to get a fetch
        if ca_obj_cache is None:
            ca = set([x['constituency_area'].id() for x in data])
            ca_objs = models.ConstituencyArea.query(models.ConstituencyArea.code.IN(list(ca))).fetch()
            ca_obj_cache = dict((x.code, x) for x in ca_objs)
        for d in data:
            ca_code = d['constituency_area'].id()
            d['constituency_area'] = ca_obj_cache[ca_code].to_dict()
        res['data'] = data

    if options or no_filters_provided:
        option_res = {}

        # Incrementally build the available options for other columns
        # We need to do this after building the initial query, since we
        # only want the options for columns that we didn't filter on

        # This method issues four queries, but will return fewer results in cases
        # When no filter parameters are provided.  Issuing one query with a projection
        # Will return all combinations of the distinct values
        if ca is None:
            tmp = [x.constituency_area for x in models.Datapoint.query(filters=query._Query__filters, projection=['constituency_area'], distinct=True).fetch()]
            tmp = models.ConstituencyArea.query(models.ConstituencyArea.key.IN(tmp))
            option_res['ca'] = [x.code for x in tmp]
        if table is None:
            tmp = models.Datapoint.query(filters=query._Query__filters, projection=['table'], distinct=True).fetch()
            option_res['table'] = [x.table for x in tmp]
        if row is None:
            tmp = models.Datapoint.query(filters=query._Query__filters, projection=['row'], distinct=True).fetch()
            option_res['row'] = [x.row for x in tmp]
        if column is None:
            tmp = models.Datapoint.query(filters=query._Query__filters, projection=['column'], distinct=True).fetch()
            option_res['column'] = [x.column for x in tmp]

        res['options'] = option_res

    res['meta'] = {}
    res['meta']['execution_time'] = time.time() - _time_start

    response = jsonify(**res)
    # Add the cross site request header
    response.headers["Access-Control-Allow-Origin"] = "*"

    return response

if __name__ == '__main__':
    app.run(host="0.0.0.0")
