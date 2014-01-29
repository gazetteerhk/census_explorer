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
            # Filter out null/none value.
            # NOTE: 
            #    * 0 is meaningful and we will keep it.
            #    * 0 visually appears as '-' in original XLS file.
            if value != '':
                datapoints.append((region, district, area, table, row, column, value))
    logger.info('Add %s values from %s', len(datapoints), filename)
    return datapoints

def get_all_json_files():
    files = []
    for area in geo_naming.ALL_AREA_CODES:
        for table in range(21): # 0 - 20
            filename = '%s/areas/%s/table%s.json' % (config.DIR_DATA_CLEAN_JSON, area.upper(), table)
            district = geo_naming.MAP_AREA_TO_DISTRICT[area]
            region = geo_naming.MAP_AREA_TO_REGION[area]
            files.append((region, district, area, str(table), filename))
    return files

def get_all_data_points():
    files = get_all_json_files()
    #files = get_all_json_files()[0:1]
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
    #print len(datapoints)
    return datapoints

def load_trans_dataframe(filename, key_name, value_name, language):
    data = json.load(open(filename))
    #print data
    return pd.DataFrame([(k, v[language]) for (k, v) in data.items()], columns=[key_name, value_name])

#def translate_one(df, language, filename, key_name, value_name):
#    return df.merge(
#            load_trans_dataframe(path.join(config.DIR_DATA_GEO_NAME, filename), key_name, value_name, language), 
#            on=key_name)

def translate_datapoints(df, language):
    #return translate_one(df, language, 'translation-regions.json', 'region', 'region_name'
    #        ).translate_one(df, language, 'translation-regions.json', 'region', 'region_name'
    #        )
    dataframe_region = load_trans_dataframe(path.join(config.DIR_DATA_GEO_NAME, 'translation-regions.json'), 'region', 'region_name', language)
    dataframe_district = load_trans_dataframe(path.join(config.DIR_DATA_GEO_NAME, 'translation-districts.json'), 'district', 'district_name', language)
    dataframe_area = load_trans_dataframe(path.join(config.DIR_DATA_GEO_NAME, 'translation-areas.json'), 'area', 'area_name', language)
    dataframe_table = load_trans_dataframe(path.join(config.DIR_DATA_CLEAN_JSON, 'translation-table.json'), 'table', 'table_name', language)
    dataframe_row = load_trans_dataframe(path.join(config.DIR_DATA_CLEAN_JSON, 'translation-row.json'), 'row', 'row_name', language)
    dataframe_column = load_trans_dataframe(path.join(config.DIR_DATA_CLEAN_JSON, 'translation-column.json'), 'column', 'column_name', language)
    #print dataframe_region
    #print df.join(dataframe_region, on='region', rsuffix='_')
    return df.merge(
            dataframe_region, on='region'
            ).merge(
            dataframe_district, on='district'
            ).merge(
            dataframe_area, on='area'
            ).merge(
            dataframe_table, on='table'
            ).merge(
            dataframe_row, on='row'
            ).merge(
            dataframe_column, on='column'
            )

datapoints = get_all_data_points()
print len(datapoints)
df = pd.DataFrame(datapoints, columns = 'region district area table row column value'.split())

sh.mkdir('-p', config.DIR_DATA_COMBINED)
df.to_csv(path.join(config.DIR_DATA_COMBINED, 'census.csv'), encoding='utf-8')
#print translate_datapoints(df, 'E')[:10]
translate_datapoints(df, 'E').to_csv(path.join(config.DIR_DATA_COMBINED, 'census-e.csv'), encoding='utf-8')
translate_datapoints(df, 'S').to_csv(path.join(config.DIR_DATA_COMBINED, 'census-s.csv'), encoding='utf-8')
translate_datapoints(df, 'T').to_csv(path.join(config.DIR_DATA_COMBINED, 'census-t.csv'), encoding='utf-8')

