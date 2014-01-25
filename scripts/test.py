from collections import Counter
import os
from log import logger
from constituency_area_data import all_files, base_path
import xlrd
import json
import sh
import itertools
import pprint

def conversion(cellPosition):
    row = ord(cellPosition[0]) - ord('A') #convert letter to ASCII, then suyb
    col = int(cellPosition[1:]) - 1 # minus 1
    return col, row

def extract(fn):
    wb = xlrd.open_workbook(fn)
    st = wb.sheet_by_index(2)
    column_names = [st.cell(5, j).value for j in range(0,5)]
    data = []
    for i in range(6,13):
        cells = [st.cell(i, j).value for j in range(0,5)]
        data.append(dict(zip(column_names, cells)))
    print data
    print json.dumps(data, indent=2)

def extract_table(sheet, name, header, body):
    # header: (A6, E6)
    # body: (A7, E13)
    row1, col1 = conversion(header[0])
    row2, col2 = conversion(header[1])
    column_names = [sheet.cell(row1, j).value for j in range(col1,col2+1)]

    row1, col1 = conversion(body[0])
    row2, col2 = conversion(body[1])
    data = []
    last_primary_cat = None
    for i in range(row1,row2+1):
        #cat = sheet.cell(i, col1)
        #if cat.startswith('  '):
        #cells = [sheet.cell(i, j).value for j in range(col1+1,col2+1)]
        cells = [sheet.cell(i, j).value for j in range(col1,col2+1)]
        data.append(dict(zip(column_names, cells)))
    
    #print json.dumps(data, indent=2)
    return data

#from table_meta_data import TABLE_META_DATA
TABLE_META_DATA = [
        {
        'name': 'household', 
        'header': ['A114', 'E114'], 
        'body': ['A115', 'E126']
        }
]

def extract_sheet(book, index):
    st = book.sheet_by_index(index)
    tables = {}
    for (i, md) in enumerate(TABLE_META_DATA):
        data = extract_table(st, **md)
        #print json.dumps(data, indent=2)
        #tables[md['name']] = data
        tables['table' + str(i)] = data
    return tables

def extract_book(filename):
    # 0: CH T
    # 1: CH S
    # 2: EN
    wb = xlrd.open_workbook(filename)
    sheets = {}
    for i in [0, 1, 2]:
        tables = extract_sheet(wb, i)
        sheets['sheet' + str(i)] = tables
    return sheets

if __name__ == '__main__':
    OUTPUT_PREFIX = 'data-clean'
    sh.rm('-rf', OUTPUT_PREFIX)
    sh.mkdir('-p', OUTPUT_PREFIX)
    for fn in sh.ls('data').split():
        area = fn[:3]
        fullpath = os.path.join('data', fn)
        sheets = extract_book(fullpath)
        for (sn, sd) in sheets.iteritems():
            for (tn, td) in sd.iteritems():
                output_dir = os.path.join(OUTPUT_PREFIX, area, sn)
                sh.mkdir('-p', output_dir)
                output_path = os.path.join(output_dir, tn) + '.json'
                json.dump(td, open(output_path, 'w'))
        break

    #for f in all_files:
    #    base_sheet_name = f[:3]
    #    filepath = os.path.join(base_path, f)
    #    logger.info("Checking file {}".format(f))
    #    wb = xlrd.open_workbook(filepath)

