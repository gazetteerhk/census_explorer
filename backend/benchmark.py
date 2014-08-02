#!/bin/bash

import random
import requests
import grequests
import time

NUM_TEST_URLS = 100
NUM_CONCURRENT_CLIENTS = 10
MAX_NUM_AREAS = 100
MIN_NUM_AREAS = 80

prefix = 'http://localhost:8080/api/?'

url = prefix + 'return=options'
r = requests.get(url)
options = r.json()['options']

areas = options['area']
tables = options['table']

def random_areas(areas, num):
    # Note, this is in-place operation
    random.shuffle(areas)
    return areas[:num]

print 'start to gen test URLs'

# Generate test URLs
urls = []
# Filter by table and area
for i in range(1, NUM_TEST_URLS):
    url = prefix + '&'.join([
                'area=' + ','.join(random_areas(areas, random.randint(1, MAX_NUM_AREAS))), 
                'table=' + str(random.choice(tables)),
                'return=' + 'data,options',
                ])
    urls.append(url)
# Filter by table, group by area and aggregate
for i in range(1, NUM_TEST_URLS):
    url = prefix + '&'.join([
                'area=' + ','.join(random_areas(areas, random.randint(MIN_NUM_AREAS, MAX_NUM_AREAS))), 
                'table=' + str(random.choice(tables)),
                'gropuby=area',
                'aggregate=', random.choice(['sum', 'median', 'min', 'max']),
                'return=' + 'groups,options',
                ])
    urls.append(url)
# Shuffle
random.shuffle(urls)
print 'generated %s URLs' % len(urls)

print 'start to test URLs'

def _report_elapsed(r, *args, **kwargs):
    print('url={0}, elapsed={1}'.format(r.url, r.elapsed))

grequests.map((grequests.get(u, callback=_report_elapsed) for u in urls), size=NUM_CONCURRENT_CLIENTS)
