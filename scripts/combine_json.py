import sh
import json
import multiprocessing
import pandas as pd
from os import path

import config
from log import logger
import geo_naming
import time

def json_to_data_points(args):
    # datapoints:
    # (region, district, area, table, row, column, value)
    region, district, area, table, filename = args
    datapoints = []
    raw = json.load(open(filename))
    # The first one corresponds to row headers
    raw['column_names'].pop(0)
    for i in range(len(raw['row_names'])):
        row = raw['row_names'][i]
        for j in range(len(raw['column_names'])):
            column = raw['column_names'][j]
            value = raw['data'][i][j]
            if value != '':
                datapoints.append((region, district, area, table, row, column, value))
    logger.info('Add %s values from %s', len(datapoints), filename)
    return datapoints

files = []
for area in geo_naming.ALL_AREA_CODES:
    for table in range(21): # 0 - 20
        filename = '%s/areas/%s/table%s.json' % (config.DIR_DATA_CLEAN_JSON, area.upper(), table)
        district = geo_naming.MAP_AREA_TO_DISTRICT[area]
        region = geo_naming.MAP_AREA_TO_REGION[area]
        files.append((region, district, area, table, filename))

#print json_to_data_points(files[0])
pool = multiprocessing.Pool()
#_start_time = time.time()
# 1. following reduce takes 16s
# datapoints = reduce(lambda a, b: a + b, pool.map(json_to_data_points, files), [])
# 2. following takes 0.7s
datapoints = []
for dps in pool.map(json_to_data_points, files):
    datapoints.extend(dps)
#print 'elapse', time.time() - _start_time
print len(datapoints)

sh.mkdir('-p', config.DIR_DATA_COMBINED)
df = pd.DataFrame(datapoints, columns = 'region district area table row column value'.split())
df.to_csv(path.join(config.DIR_DATA_COMBINED, 'census.csv'), encoding='utf-8')
