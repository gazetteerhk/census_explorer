# -*- coding: utf-8 -*-

from collections import defaultdict
from log import logger

ERRATA = defaultdict(dict)

# Language order follows original table, to reduce typos
ERRATA.update({
        'c43_under': {
            'T': '十五歲以下',
            'S': '十五岁以下',
            'E': 'Age Under 15',
            },
        'd43_and': {
            'T': '十五歲及以上',
            'S': '十五岁及以上',
            'E': 'Age 15 and Over',
            },
        'c146_households': {
            'T': '有家庭住戶居住的屋宇單位數目',
            'S': '有家庭住户居住的屋宇单位数目',
            'E': 'Quarters Occupied by Domestic Households',
            },
        'd146_households': {
            'T': '家庭住戶數目',
            'S': '家庭住户数目',
            'E': 'Domestic Households',
            },
        'e146_of': {
            'T': '每千個屋宇單位的平均家庭住戶數目',
            'S': '每千个屋宇单位的平均家庭住户数目',
            'E': 'Average Number of Domestic Households per 1000 Units of Quarters',
            },
        'l118_active': {
            'T': '從事經濟活動的家庭住戶數目#',
            'S': '从事经济活动的家庭住户数目#',
            'E': 'Economically Active Households #',
            },
        'n118_households': {
            'T': '所有家庭住戶數目',
            'S': '所有家庭住户数目',
            'E': 'All Domestic Households',
            },
        'n143_with': {
            'T': '有按揭供款或借貸還款的家庭住戶數目',
            'S': '有按揭供款或借贷还款的家庭住户数目',
            'E': 'Domestic Households with Mortgage or Loan',
            },
        'n162_they': {
            'T': '居於租住居所的家庭住戶數目',
            'S': '居于租住居所的家庭住户数目',
            'E': 'Domestic Households Renting the Accommodation They Occupy',
            },
})

logger.info('len of ERRATA: %d', len(ERRATA))

import pandas
df = pandas.io.parsers.read_csv('https://docs.google.com/spreadsheet/pub?key=0Asi0lKkzNhjsdENOYnVKaXE0RFR2VC1BOVcwM1lMZkE&output=csv')

for i, row in df.iterrows():
    identifier = row['identifier']
    language = row['language']
    canonical_name = row['canonical_name']
    remove = row['remove']
    if (not identifier.endswith('none')) and canonical_name and (remove != 'REMOVE ROW'):
        ERRATA[identifier][language] = canonical_name

logger.info('len of ERRATA: %d', len(ERRATA))
