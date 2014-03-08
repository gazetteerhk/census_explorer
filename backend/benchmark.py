#!/bin/bash

import random
import requests
import time
import multiprocessing

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
for i in range(1, 1000):
    url = prefix + '&'.join([
                'area=' + ','.join(random_areas(areas, random.randint(1,100))), 
                'table=' + str(random.choice(tables)),
                'return=' + 'data,options',
                ])
    urls.append(url)

random.shuffle(urls)

def test_url(url):
    start_time = time.time()
    requests.get(url)
    print 'url:', url, 'time:', time.time() - start_time

print 'start to test URLs'

pool = multiprocessing.Pool()
pool.map(test_url, urls)
