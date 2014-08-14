# -*- coding: utf-8 -*-

# Used for prepping and merging in the public facilities data.
# This pipeline is a bit fragmented.  Currently it expects a
# file name "pub_facility_cacode.geo.json" to exist in the data folder.
# This file should contain all the public facility points, with the CA Code
# as a property of each object.
import urllib

import config
import json
import os
import geo_naming
from log import logger
import pandas as pd
from combine_json import translate_datapoints


FACILITY_FILE_URL = 'https://docs.google.com/uc?authuser=0&id=0B9xH-vwbR_tCU3drcG8xUHBESFE&export=download'


def get_geojson_objects():
    facility_file = os.path.join(config.DIR_DATA_PREFIX, 'pub_facility_cacode.geo.json')
    if not os.path.exists(facility_file):
        # Get it from the Google Drive
        logger.info("Facilities geojson file does not exist.  Downloading")
        urllib.urlretrieve(FACILITY_FILE_URL, facility_file)

    with open(facility_file, 'rb') as f:
        a = json.loads(f.read())
    return a['features']


CHINESE_CATEGORY_KEY = u'\u4e2d\u6587\u985e\u5225'  # 中文类别
FACILITIES_TABLE_NUMBER = u'100'  # Start at 100, to avoid collisions with the automatically generated table
FACILITIES_COLUMN_ID = u'n_facilities'


def create_translation(features):
    """
    Process the features to create a translation map of form
    {
        id: {C: translation, E, translation, T: translation},
        ...
    }
    """
    res = {}
    seen_categories = set()
    counter = 1
    for f in features:
        eng_name = f['properties']['ENGLISH CATEGORY']
        # Some first words are repeated, so we have to increment a counter for each category
        if eng_name not in seen_categories:
            split = eng_name.split(' ')
            feat_id = u'f{}_{}'.format(counter, ''.join(e for e in split[0].lower() if e.isalnum())) # strip special chars
            counter += 1
            seen_categories.add(eng_name)
            res[feat_id] = {
                u'S': f['properties'][CHINESE_CATEGORY_KEY],  # Shortcut here, just use traditional for simplified
                u'E': eng_name,
                u'T': f['properties'][CHINESE_CATEGORY_KEY]
            }
    return res


def append_row_translations(features, force=False):
    # Need to add to translation-row.json for each category
    with open(os.path.join(config.DIR_DATA_CLEAN_JSON, 'translation-row.json'), 'rb') as f:
        row_translations = json.loads(f.read())
    new_translation = create_translation(features)
    for k, v in new_translation.items():
        if k not in row_translations or force:
            row_translations[k] = v
        else:
            logger.info("{} already in translation table".format(k))
    with open(os.path.join(config.DIR_DATA_CLEAN_JSON, 'translation-row.json'), 'wb') as f:
        f.write(json.dumps(row_translations))

    # only need to add a single row for the tables and columns
    # We need to add these here for the translated, combined CSV files
    with open(os.path.join(config.DIR_DATA_CLEAN_JSON, 'translation-table.json'), 'rb') as f:
        table_translations = json.loads(f.read())
    if u'100' not in table_translations or force:
        table_translations[u'100'] = {
            u'S': u'\u516c\u5171\u8bbe\u65bd',
            u'E': u'Public Facilities',
            u'T': u'\u516c\u5171\u8a2d\u65bd'
        }
    else:
        logger.info("Table translation already in translation table")
    with open(os.path.join(config.DIR_DATA_CLEAN_JSON, 'translation-table.json'), 'wb') as f:
        f.write(json.dumps(table_translations))

    # Column translation
    with open(os.path.join(config.DIR_DATA_CLEAN_JSON, 'translation-column.json'), 'rb') as f:
        column_translation = json.loads(f.read())
    if u'n_facilities' not in column_translation or force:
        column_translation[u'n_facilities'] = {
            u'S': u'\u6570\u76ee',
            u'E': u'No. of Facilities',
            u'T': u'\u6578\u76ee'
        }
    else:
        logger.info("Column translation already in translation table")
    with open(os.path.join(config.DIR_DATA_CLEAN_JSON, 'translation-column.json'), 'wb') as f:
        f.write(json.dumps(column_translation))


def create_aggregate_datapoints(features):
    # Need to get datapoints to this form: (u'nt', u'p', u'p03', '0', u'tab0_chinese', u'tab0_male', 6884.0)
    # (region, district, area, table, row, column, value)
    # First, aggregate the data
    agg = {}
    table = str(FACILITIES_TABLE_NUMBER)
    column = FACILITIES_COLUMN_ID
    # Create a reverse translation to go from category name to code
    translation = create_translation(features)
    reverse_translation = dict((v['E'], k) for k, v in translation.items())
    for f in features:
        area = f['properties']['CACODE'].lower()
        row = reverse_translation[f['properties']['ENGLISH CATEGORY']]
        key = ','.join([area, row])
        if key not in agg:
            agg[key] = 0
        agg[key] += 1

    # Now unroll the aggregate
    # Some combinations of area and row may not exist in the aggregate, if there are no public facilities there
    # We want these rows to read 0, instead of not being present
    # Or do we?  This will generate 78 * 412 = 32136 rows
    # For now, lets just not add in rows with 0 value, but this is easy to change later
    # This only adds 4394 new rows
    dps = []
    for row in reverse_translation.values():
        for area in geo_naming.ALL_AREA_CODES:
            district = area[0]
            region = geo_naming.MAP_AREA_TO_REGION[area]
            key = ','.join([area, row])
            val = agg.get(key, None)
            if val is not None:
                dps.append((region, district, area, table, row, column, val))

    return dps


def append_new_datapoints(features):
    dps = create_aggregate_datapoints(features)
    # We'll just append directly to the CSVs
    logger.info('Total %d data points', len(dps))
    df = pd.DataFrame(dps, columns = 'region district area table row column value'.split())

    logger.info('Appending datapoints to CSV')
    df.to_csv(os.path.join(config.DIR_DATA_COMBINED, 'census.csv'), encoding='utf-8', index=False, mode='ab', header=False)

    logger.info('Write english datapoints to CSV')
    translate_datapoints(df, 'E').to_csv(os.path.join(config.DIR_DATA_COMBINED, 'census-e.csv'), encoding='utf-8', index=False, mode='ab', header=False)
    logger.info('Write simplified datapoints to CSV')
    translate_datapoints(df, 'S').to_csv(os.path.join(config.DIR_DATA_COMBINED, 'census-s.csv'), encoding='utf-8', index=False, mode='ab', header=False)
    logger.info('Write traditional datapoints to CSV')
    translate_datapoints(df, 'T').to_csv(os.path.join(config.DIR_DATA_COMBINED, 'census-t.csv'), encoding='utf-8', index=False, mode='ab', header=False)


def main():
    features = get_geojson_objects()
    logger.info("Appending translations to translation JSONs")
    append_row_translations(features)
    logger.info("Appending datapoints to CSVs")
    append_new_datapoints(features)


"""
with open(os.path.join(config.DIR_DATA_CLEAN_JSON, 'translation-row.json'), 'w') as outfile:
    json.dump(translate_dict_row, outfile)
"""

if __name__ == '__main__':
    main()

