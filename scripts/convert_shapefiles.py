# The new shapefiles have slightly different properties.
# Districts have DC_CODE, while areas have DC_CODE and CA
# Standardize by renaming to simply CODE and concatenate DC_CODE and CA
import json


DC_FILE = 'dc_polygon.geo.json'
NEW_DC_FILE = 'dc_polygon.geo.json'
CA_FILE = 'ca_polygon.geo.json'
NEW_CA_FILE = 'ca_polygon.geo.json'


with open(DC_FILE, 'rb') as fl:
    dc = json.loads(fl.read())

for f in dc['features']:
    f['properties']['CODE'] = f['properties']['DC_CODE']

with open(NEW_DC_FILE, 'wb') as fl:
    a = fl.write(json.dumps(dc))

with open(CA_FILE, 'rb') as fl:
    ca = json.loads(fl.read())

for f in ca['features']:
    f['properties']['CODE'] = f['properties']['DC_CODE'] + f['properties']['CA']

with open(NEW_CA_FILE, 'wb') as fl:
    fl.write(json.dumps(ca))
