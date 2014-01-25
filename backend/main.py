from flask import Flask, request, jsonify
app = Flask(__name__)

import logging

@app.route('/')
def hello_world():
    return 'Census Explorer'

@app.route('/upload/<constituency_area>/<sheet_name>/<table>/', methods = ['POST'])
def upload(constituency_area, sheet_name, table):
    import json
    import hashlib
    from models import *
    #return '%s %s %s' % (constituency_area, language, table)
    #return request.form['jsondata']
    #return jsonify(request.form)
    data = json.loads(str(request.form.keys()[0]))
    first_column_name = data['meta']['first_column_name']
    table_name = data['meta']['name']
    for d in data['data']:
        row = d.pop(first_column_name)
        for (k, v) in d.items():
            constituency_area = constituency_area.lower()
            language = {'sheet0': 'traditional',
                    'sheet1': 'simplified',
                    'sheet2': 'english'}[sheet_name]
            table = table_name
            column = k
            row = row
            value = v
            _info = (constituency_area, language, table, row, column, value)
            if all(_info):
                _id = hashlib.md5('%s %s %s %s %s %s' % _info).hexdigest()
                logging.warning(str(_info))
                constituency_area_key = list(ConstituencyArea.query(ConstituencyArea.code == constituency_area))[0].key
                logging.warning(constituency_area_key)
                if not value:
                    value = None
                dp = Datapoint(id=_id, 
                        constituency_area=constituency_area_key,
                        language=language,
                        table=table,
                        column=column,
                        row=row,
                        value=value)
                logging.warning(dp)
                dp.put()
    return "OK"

if __name__ == '__main__':
    app.run(host="0.0.0.0")
