# -*- coding: utf-8 -*-
from collections import Counter
import os
from log import logger
from constituency_area_data import all_files, base_path
import xlrd
import json
#import sh
import itertools
import pprint
import multiprocessing

from table_meta_data import TABLE_META_DATA
#TABLE_META_DATA = [
#        {
#        'name': 'household', 
#        'header': ['A114', 'E114'], 
#        'body': ['A115', 'E126']
#        }
#]
OUTPUT_PREFIX = 'data-clean'

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


def translate_sheet(book):
    sheetNum = [0, 1, 2] #0 - Traditional, 1 - Simplifed, 2 - English    
    tables = {}
    translateDict = {}
    count = 0
    for (i, md) in enumerate(TABLE_META_DATA):       
        #heck the header
        #extract the field on different sheets

        header = md['header'] #['H41', 'N41']
        body = md['body'] #['A7', 'E13']        
        name = md['name'] # 'Place of Study'
        
        column_names = {}
        #get different language sheet in excel
        for i in sheetNum:
            sheet = book.sheet_by_index(i)
            row1, col1 = conversion(header[0])
            row2, col2 = conversion(header[1])
            body_row1, body_col1 = conversion(body[0])
            body_row2, body_col2 = conversion(body[1])
            #actually we only need to extract the row name in the body            
            #print row1, col1

            #get the name and remove empty string
            #get the col name
            column_names[i] = [x for x in [sheet.cell(row1, j).value for j in range(col1,col2+1)] if x] 
            #get the row name
            column_names[i] = column_names[i] + [x for x in [sheet.cell(j, body_col1).value for j in range(body_row1, body_row2+1)] if x] 
            
        #for each column_name, find out T, S, E and then store them
        
        for c in range(len(column_names[0])):            
            traditional_col = column_names[0][c]
            simplified_col = column_names[1][c]
            english_col = column_names[2][c]            
            #print temp
            #translateDict[str(english_col)] = json.dumps(temp, ensure_ascii=False).encode('utf-8')
            print type(traditional_col)
            print type(simplified_col)
            print type(english_col)
            translateDict[english_col] = {'T':traditional_col, 'S':simplified_col,'E':english_col}

            #translateDict[str(english_col)] = temp
        
        #print len(translateDict)
    return translateDict
       
    
from constituency_areas import english, simplified, traditional

def _to_area_code_mapping(origin):
    #_tmp = [(v,k) for (k,v) in d.items() for d in origin.values()]
    _tmp = {}
    for d in origin.values():
        for (k, v) in d.items():
            _tmp[v] = k
    return _tmp

MAPPING_AREA_CODE_ENGLISH = _to_area_code_mapping(english)
MAPPING_AREA_CODE_SIMPLIFIED = _to_area_code_mapping(simplified)
MAPPING_AREA_CODE_TRADITIONAL = _to_area_code_mapping(traditional)

def add_meta_info(table_data, area, sheet_name):
    mapping = {'sheet0': MAPPING_AREA_CODE_TRADITIONAL,
            'sheet1': MAPPING_AREA_CODE_SIMPLIFIED,
            'sheet2': MAPPING_AREA_CODE_ENGLISH}[sheet_name]
    table_data['meta'].update({'area': mapping[area.lower()]})
    lang = {'sheet0': 'traditional',
            'sheet1': 'simplified',
            'sheet2': 'english'}[sheet_name]
    table_data['meta'].update({'language': lang})
    return table_data

def process_one_file(fn):
    area = fn[:3]
    #fullpath = os.path.join('data', fn)    
    fullpath = fn #toby     
    wb = xlrd.open_workbook(fullpath)
    
    translate_dict = translate_sheet(wb)
    #print type(translate_dict)   
    #print len(translate_dict)
    #print translate_dict
    with open('translate.json', 'w') as outfile:
        result = json.dumps(translate_dict, indent=2, ensure_ascii=False).encode('utf-8')

    outfile.close()
    print 'done'

if __name__ == '__main__':
    #read the file
    process_one_file('C:/[DATA]/census_explorer/translate.xlsx')
    