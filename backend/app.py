from flask import Flask
from flask_restful import Resource, Api, reqparse
from flask_cors import CORS, cross_origin
import numpy as np

app = Flask(__name__)
api = Api(app)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'


parser = reqparse.RequestParser()
parser.add_argument('knot')

class HelloWorld(Resource):
    def get(self):
        return {'hello': 'world'}

class Knot(Resource):
    def post(self):
        args = parser.parse_args()
        knot_vertices = args['knot']
        knot_vertices = np.array(knot_vertices)
        print(knot_vertices)
        return args['knot']


api.add_resource(HelloWorld, '/')
api.add_resource(Knot, '/knot')

if __name__ == '__main__':
    app.run(debug=True)
