import collections
from flask import Flask, jsonify, request
import models
import urllib
from google.appengine.api import memcache
import hashlib

app = Flask(__name__)

import logging

from models import Admin

@app.route('/')
def hello_world():
    return 'Census Explorer'

def require_admin(func):
    def decorated(*args, **kwargs):
        r = list(Admin.query(Admin.name=='admin'))
        if len(r) == 0 or (r[0].enabled == True and r[0].token == request.args.get('token', None)):
            # len(r) == 0: init admin
            return func(*args, **kwargs)
        else:
            return "404"
    # Without the following line, you will see the error:
    #   "View function mapping is overwriting an existing endpoint"
    decorated.__name__ = func.__name__
    return decorated

def cache_it(func):
    def decorated(*args, **kwargs):
        #logging.warning((request.query_string))
        key = hashlib.md5((request.path + request.query_string).encode('utf-8')).hexdigest()
        logging.warning('key: %s', key)
        res = memcache.get(key)
        if not res:
            cache_time = 300
            res = func(*args, **kwargs)
            memcache.add(key, res, cache_time)
        return res
    decorated.__name__ = func.__name__
    return decorated

@app.route('/_admin/init/')
@require_admin
def admin_init():
    import random
    admin = Admin(id="0", enabled=True, name='admin',
            token=hashlib.md5(str(random.random()).encode('utf-8')).hexdigest()[:16])
    admin.put()
    return 'OK'

@app.route('/upload/<constituency_area>/<sheet_name>/<table>/', methods = ['POST'])
@require_admin
def upload(constituency_area, sheet_name, table):
    import json
    from models import *
    #logging.warning(str(request.data))
    # request.data contains the raw HTTP request body IFF Flask does not know the type...
    data = json.loads(str(request.data))
    first_column_name = data['meta']['first_column_name']
    table_name = data['meta']['name']
    for d in data['data']:
        row = d.pop(first_column_name)
        for (k, v) in d.items():
            constituency_area = constituency_area.lower()
            language = {'sheet0': u'traditional',
                    'sheet1': u'simplified',
                    'sheet2': u'english'}[sheet_name]
            table = table_name #.decode('utf-8')
            column = k.strip() #.decode('utf-8')
            row = row.strip() #.decode('utf-8')
            value = v
            _info = (constituency_area, language, table, row, column, value)
            #logging.warning(str(_info))
            ok = True

            if value == u'':
                # missing value
                ok = False

            if ok:
                _id = hashlib.md5((u'%s %s %s %s %s %s' % _info).encode('utf-8')).hexdigest()
                constituency_area_key = list(ConstituencyArea.query(ConstituencyArea.code == constituency_area))[0].key
                #logging.warning(constituency_area_key)
                dp = Datapoint(id=_id, 
                        constituency_area=constituency_area_key,
                        language=language,
                        table=table,
                        column=column,
                        row=row,
                        value=value)
                #logging.warning(dp)
                dp.put()
    return "OK"


def parse_argument(query_string):
    """
    Takes a raw query_string from the request parameters, and returns a
    list of url decoded strings that can be used in the filtering.

    If query_string is None, then returns None
    """
    if query_string is None:
        return None
    res = urllib.unquote_plus(query_string).split(',')
    return res


@app.route('/api')
@cache_it
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
    import time
    _time_start = time.time()

    # Parse the arguments
    ca = parse_argument(request.args.get('ca', None))
    table = parse_argument(request.args.get('table', None))
    row = parse_argument(request.args.get('row', None))
    column = parse_argument(request.args.get('column', None))
    options = bool(int(request.args.get('options', 0)))

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

    return jsonify(**res)

if __name__ == '__main__':
    app.run(host="0.0.0.0")
