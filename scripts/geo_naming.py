# -*- coding: utf-8 -*-

# This script standardize geo naming issues resulted from multiple sources.
#    * districts and regions do not have code
#    * map from area to district and to region
#    * translation from region/ district/ area codes to natural language
#
# Functions:
#    * provide standard names for Python import
#    * output to JSON for use in other parts

#TODO:
#    Once matured, this script should be the only entrance for geo names

import json
import sh
from os import path
from collections import defaultdict

from log import logger
import constituency_areas
import config
import copy

# set to unique; list to make it JSON serializable
ALL_AREA_CODES = list(set([c.lower() for c in constituency_areas.ALL_AREA_CODES]))
ALL_DISTRICT_CODES = list(set(map(lambda c: c[0], ALL_AREA_CODES)))
ALL_REGION_CODES = ['hk', 'kl', 'nt']

# Manual code, the only information missing constituency_areas.py
_TRANSLATION_ALL_DISTRICT = {
        u'E': u'All Districts',
        u'S': u'所有地区',
        u'T': u'所有地區',
        }
TRANSLATION_REGIONS = {
        u'hk': {
            u'E': u'Hong Kong Island',
            u'S': u'香港岛',
            u'T': u'香港島',
            },
        u'kl': {
            u'E': u'Kowloon',
            u'S': u'九龙',
            u'T': u'九龍',
            },
        u'nt': {
            u'E': u'New Territories',
            u'S': u'新界',
            u'T': u'新界',
            },
        }

TRANSLATION_AREAS = dict([(c, {}) for c in ALL_AREA_CODES])
TRANSLATION_DISTRICTS = dict([(c, {}) for c in ALL_DISTRICT_CODES])

def translate_one_language(area_codes, language):
    import copy
    area_codes = copy.deepcopy(area_codes)
    # clean area_codes: only keep real "District Councils" now
    areas_all_district = area_codes.pop(_TRANSLATION_ALL_DISTRICT[language])
    areas_hk = area_codes.pop(TRANSLATION_REGIONS['hk'][language])
    areas_kl = area_codes.pop(TRANSLATION_REGIONS['kl'][language])
    areas_nt = area_codes.pop(TRANSLATION_REGIONS['nt'][language])

    for (name, code) in areas_all_district.iteritems():
        TRANSLATION_AREAS[code][language] = name

    for district_name in area_codes:
        # Pick any code under this district
        one_code = area_codes[district_name].values()[0]
        district_id = unicode(one_code[0].lower())
        #print district_id, one_code, district_name
        TRANSLATION_DISTRICTS[district_id][language] = district_name

translate_one_language(constituency_areas.AREA_CODE_ENGLISH, 'E')
translate_one_language(constituency_areas.AREA_CODE_SIMPLIFIED, 'S')
translate_one_language(constituency_areas.AREA_CODE_TRADITIONAL, 'T')

_area_codes = constituency_areas.AREA_CODE_ENGLISH
_language = 'E'

MAP_AREA_TO_REGION = {}
for region in ALL_REGION_CODES:
    for ac in _area_codes[TRANSLATION_REGIONS[region][_language]].values():
        MAP_AREA_TO_REGION[ac] = region
MAP_AREA_TO_DISTRICT = dict([(c, c[0]) for c in ALL_AREA_CODES])

MAP_DISTRICT_TO_REGION = dict(zip(MAP_AREA_TO_DISTRICT.values(), MAP_AREA_TO_REGION.values()))

GEO_TREE = {}
for region in ALL_REGION_CODES:
    GEO_TREE[region] = {}
    for district in ALL_DISTRICT_CODES:
        if MAP_DISTRICT_TO_REGION[district] == region:
            tmp = []
            for area in ALL_AREA_CODES:
                if MAP_AREA_TO_DISTRICT[area] == district:
                    tmp.append(area)
            GEO_TREE[region][district] = tmp


def output(obj, filename):
    json.dump(obj, open(path.join(config.DIR_DATA_GEO_NAME, filename), 'w'))


sh.mkdir('-p', config.DIR_DATA_GEO_NAME)
output(TRANSLATION_AREAS, 'translation-areas.json')
output(TRANSLATION_DISTRICTS, 'translation-districts.json')
output(TRANSLATION_REGIONS, 'translation-regions.json')
output(MAP_AREA_TO_REGION, 'map-area-to-region.json')
output(MAP_AREA_TO_DISTRICT, 'map-area-to-district.json')
output(MAP_DISTRICT_TO_REGION, 'map-district-to-region.json')
output(GEO_TREE, 'geo-tree.json')

