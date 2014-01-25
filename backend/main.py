from flask import Flask, jsonify, request
import models
import urllib


app = Flask(__name__)

@app.route('/')
def hello_world():
    return 'Census Explorer'


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
    # Parse the arguments
    ca = parse_argument(request.args.get('ca', None))
    table = parse_argument(request.args.get('table', None))
    row = parse_argument(request.args.get('row', None))
    column = parse_argument(request.args.get('column', None))
    options = bool(int(parse_argument(request.args.get('options', 0))))

    # Incrementally build the query
    query = models.Datapoint.query()
    if ca is not None:
        query = query.filter(models.Datapoint.constituency_area.code.IN(ca))
    if table is not None:
        query = query.filter(models.Datapoint.table.IN(table))
    if row is not None:
        query = query.filter(models.Datapoint.row.IN(row))
    if column is not None:
        query = query.filter(models.Datapoint.column.IN(column))

    res = {}

    if options or all([ca is None, table is None, row is None, column is None]):
        option_res = {}

    return jsonify(ca=ca, table=table, row=row, column=column)


if __name__ == '__main__':
    app.run(host="0.0.0.0")
