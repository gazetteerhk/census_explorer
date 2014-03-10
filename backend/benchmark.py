#!/bin/bash

import random
import requests
import grequests
import time

NUM_TEST_URLS = 100
NUM_CONCURRENT_CLIENTS = 10
MAX_NUM_AREAS = 100

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

urls = []
for i in range(1, NUM_TEST_URLS):
    url = prefix + '&'.join([
                'area=' + ','.join(random_areas(areas, random.randint(1, MAX_NUM_AREAS))), 
                'table=' + str(random.choice(tables)),
                'return=' + 'data,options',
                ])
    urls.append(url)

random.shuffle(urls)

print 'start to test URLs'

def _report_elapsed(r, *args, **kwargs):
    print('url={0}, elapsed={1}'.format(r.url, r.elapsed))

grequests.map((grequests.get(u, callback=_report_elapsed) for u in urls), size=NUM_CONCURRENT_CLIENTS)
