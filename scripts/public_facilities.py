# -*- coding: utf-8 -*-

# Used for prepping and merging in the public facilities data.
# This pipeline is a bit fragmented.  Currently it expects a
# file name "pub_facility_cacode.geo.json" to exist in the data folder.
# This file should contain all the public facility points, with the CA Code
# as a property of each object.


import config
import json
import os


def get_geojson_objects():
    with open(os.path.join(config.DIR_DATA_PREFIX, 'pub_facility_cacode.geo.json'), 'rb') as f:
        a = json.loads(f.read())
    return a['features']


CHINESE_CATEGORY_KEY = u'\u4e2d\u6587\u985e\u5225'  # 中文类别
FACILITIES_TABLE_NUMBER = '100'  # Start at 100, to avoid collisions with the automatically generated table
FACILITIES_COLUMN_ID = 'n_facilities'


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
            feat_id = 'f{}_{}'.format(counter, split[0].lower())
            counter += 1
            seen_categories.add(eng_name)
            res[feat_id] = {
                'C': f['properties'][CHINESE_CATEGORY_KEY],  # Shortcut here, just use traditional for simplified
                'E': eng_name,
                'T': f['properties'][CHINESE_CATEGORY_KEY]
            }
    return res


"""
with open(os.path.join(config.DIR_DATA_CLEAN_JSON, 'translation-row.json'), 'w') as outfile:
    json.dump(translate_dict_row, outfile)
"""