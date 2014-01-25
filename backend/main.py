from flask import Flask, jsonify, request
import models


app = Flask(__name__)

@app.route('/')
def hello_world():
    return 'Hello World!'


@app.route('/api')
def api():
    print request.args
    return jsonify(message='Nothing here')


if __name__ == '__main__':
    app.run(host="0.0.0.0")
