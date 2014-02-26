# -*- coding: utf-8 -*-

# Used for prepping and merging in the public facilities data.
# This pipeline is a bit fragmented.  Currently it expects a
# file name "pub_facility_cacode.geo.json" to exist in the data folder.
# This file should contain all the public facility points, with the CA Code
# as a property of each object.


import config
import json
import os
import geo_naming
from log import logger


def get_geojson_objects():
    with open(os.path.join(config.DIR_DATA_PREFIX, 'pub_facility_cacode.geo.json'), 'rb') as f:
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
            feat_id = u'f{}_{}'.format(counter, split[0].lower())
            counter += 1
            seen_categories.add(eng_name)
            res[feat_id] = {
                u'C': f['properties'][CHINESE_CATEGORY_KEY],  # Shortcut here, just use traditional for simplified
                u'E': eng_name,
                u'T': f['properties'][CHINESE_CATEGORY_KEY]
            }
    return res


def append_row_translations(features):
    # Need to add to translation-row.json for each category
    with open(os.path.join(config.DIR_DATA_CLEAN_JSON, 'translation-row.json'), 'rb') as f:
        row_translations = json.loads(f.read())
    new_translation = create_translation(features)
    for k, v in new_translation.items():
        if k not in row_translations:
            row_translations[k] = v
        else:
            logger.info("{} already in translation table".format(k))
    with open(os.path.join(config.DIR_DATA_CLEAN_JSON, 'translation-row.json'), 'wb') as f:
        f.write(json.dumps(row_translations))
    # For the table and the column, we'll just read from the human generated translations


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




"""
with open(os.path.join(config.DIR_DATA_CLEAN_JSON, 'translation-row.json'), 'w') as outfile:
    json.dump(translate_dict_row, outfile)
"""