import collections
import urllib
import pandas
import numpy
from flask import Flask, jsonify, request

app = Flask(__name__)

import logging
# From /scripts/logger.py
logger = logging.getLogger('log')
logger.setLevel(logging.DEBUG)
log_formatter = logging.Formatter('%(asctime)s - %(module)s - %(levelname)s - %(message)s',
                                          datefmt='%Y-%m-%d %H:%M:%S')
# Log to console
logstream = logging.StreamHandler()
logstream.setLevel(logging.INFO)
logstream.setFormatter(log_formatter)
logger.addHandler(logstream)


def _load_dataframe():
    logger.info('Load combined census.csv')
    return pandas.io.parsers.read_csv('data/combined/census.csv', dtype={'table': 'str'})
df_census = _load_dataframe()

@app.route('/')
def index():
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

def _project_dataframe(df, projectors):
    data = {}
    for p in projectors:
        data[p] = list(df[p])
    return data

def _agg_identity(df):
    return df

# To test the aggregate interface
def _agg_first(df):
    return df[:1]

_agg_sum = _agg_identity
_agg_median = _agg_identity
_agg_min = _agg_identity
_agg_max = _agg_identity

@app.route('/api/')
def api():
    """
    API Endpoint for accessing the data
    Takes query parameters in order to filter the dataset down

    Arguments:
    ----------
    region:

    district:

    area: constituency areas
        Comma separated string of CA codes -- "a01,a02", etc.

    table: table name
        Comma separated string of the tables requested.  Must be urlencoded - "ethnicity"

    row: row name
        Comma separated string of the rows.  Urlencoded - "chinese"

    column: column name
        Comma separated string of the columns.  Urlencoded - "male"

    return: [ret, ...]
       * 'data'
       * 'groups'
       * 'options'

    projector: 
       * same as filters

    Returns:
    --------
    JSON response, of the form:
    {
        data: [
            {
                region: [string, ...],
                district: [string, ...],
                area: [string, ...],
                table: [string, ...],
                row: [string, ...],
                column: [string, ...],
                value: [float, ...]
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
    # Filters:
    filters = ['region', 'district', 'area', 'table', 'row', 'column']
    # Projectors:
    projectors = parse_argument(request.args.getlist('projector', None))
    if not projectors:
        projectors = ['value']
    # Functions:
    ret_options = parse_argument(request.args.getlist('return', None))
    if not ret_options:
        ret_options = ['data', 'groups', 'options']
    #NOTE: Can not parse_argument on it, or the str converts to a list
    groupby = request.args.get('groupby', None)
    #NOTE: Can not parse_argument on it, or the str converts to a list
    aggregate = request.args.get('aggregate', None)

    response = {'meta': {}}

    # Filters
    df = df_census
    logger.info('df len: %d', len(df))
    for f in filters:
        fvals = parse_argument(request.args.getlist(f, None))
        if fvals:
            logger.info('filters %s: %s', f, fvals)
            df = df[reduce(lambda a, b: a | (df[f] == b), fvals, 
                pandas.Series([False] * len(df), index=df.index))]
        logger.info('df len: %d', len(df))

    response['meta']['length'] = len(df)

    # Options
    options = {}
    for f in filters:
        options[f] = list(df[f].unique())

    # Projectors
    data = _project_dataframe(df, projectors)

    # Groupby and Aggregate
    groups = {}
    if groupby:
        if aggregate:
            agg_func = {
                    'sum': _agg_sum,
                    'median': _agg_median,
                    'max': _agg_max,
                    'min': _agg_min,
                    'first': _agg_first,
                    }[aggregate]
        else:
            agg_func = _agg_identity
        df['groupby'] = df[groupby]
        for name, group in df.groupby(groupby):
            groups[name] = _project_dataframe(agg_func(group), projectors)

    if 'data' in ret_options:
        response['data'] = data
    if 'groups' in ret_options:
        response['groups'] = groups
    if 'options' in ret_options:
        response['options'] = options

    response['meta']['success'] = True

    logger.info('API process time: %s', time.time() - _time_start)
    return jsonify(response)

if __name__ == '__main__':
    # Run this script directly
    # NOTE: 
    #     Make debug=False in production
    app.run(host="0.0.0.0", port=8080, debug=True)
    #app.run(host="0.0.0.0", port=8080, debug=False)
