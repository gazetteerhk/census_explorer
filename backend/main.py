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
            language = {'sheet0': u'traditional',
                    'sheet1': u'simplified',
                    'sheet2': u'english'}[sheet_name]
            table = table_name #.decode('utf-8')
            #logging.warning(k)
            #logging.warning(type(k))
            column = k #.decode('utf-8')
            row = row #.decode('utf-8')
            value = v
            _info = (constituency_area, language, table, row, column, value)
            logging.warning(str(_info))
            ok = True

            if value == u'':
                # missing value
                ok = False

            if ok:
                _id = hashlib.md5((u'%s %s %s %s %s %s' % _info).encode('utf-8')).hexdigest()
                constituency_area_key = list(ConstituencyArea.query(ConstituencyArea.code == constituency_area))[0].key
                logging.warning(constituency_area_key)
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
