import json
import unittest
from google.appengine.ext import ndb
from google.appengine.ext import testbed
import main

# ARG not working

class APITest(unittest.TestCase):
    def setUp(self):
        self.testbed = testbed.Testbed()
        self.testbed.activate()
        self.testbed.init_datastore_v3_stub()
        main.app.config['TESTING'] = True
        self.app = main.app.test_client()

    def test_api_get_without_parameters(self):
        resp = self.app.get('/api?foo=1,2')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(json.loads(resp.data), {'message': 'Nothing here'})

    def test_api_no_results(self):
        pass

    def test_api_district_filter(self):
        pass

    def test_api_district_filter_all(self):
        pass

    def tearDown(self):
        self.testbed.deactivate()


if __name__ == '__main__':
    unittest.main()