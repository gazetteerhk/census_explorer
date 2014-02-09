import collections
import urllib
import pandas
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

@app.route('/api/')
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

    response = {'data': [], 'options': {}}

    # Parse the arguments
    # Filters:
    filters = ['region', 'district', 'area', 'table', 'row', 'column']
    # Functions:
    options = bool(int(request.args.get('options', 1)))
    groupby = parse_argument(request.args.get('groupby', None))
    aggregate = parse_argument(request.args.get('aggregate', None))

    df = df_census
    logger.info('df len: %d', len(df))
    for f in filters:
        #TODO:
        #    Process a list of args
        fval = parse_argument(request.args.getlist(f, None))
        if fval:
            df = df[df[f] == fval[0]]
        logger.info('df len: %d', len(df))

    # Options
    if options:
        options_list = response['options']
        for f in filters:
            options_list[f] = list(df[f].unique())

    logger.info('API process time: %s', time.time() - _time_start)
    return jsonify(response)

if __name__ == '__main__':
    # Run this script directly
    # NOTE: 
    #     Make debug=False in production
    app.run(host="0.0.0.0", port=8080, debug=True)
    #app.run(host="0.0.0.0", port=8080, debug=False)
