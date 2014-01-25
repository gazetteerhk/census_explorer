from collections import Counter
import os
from log import logger
from constituency_area_data import all_files, base_path
import xlrd
import json

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
    for i in range(row1,row2+1):
        cells = [sheet.cell(i, j).value for j in range(col1,col2+1)]
        data.append(dict(zip(column_names, cells)))
    
    #print json.dumps(data, indent=2)
    return data

from table_meta_data import TABLE_META_DATA

def extract_sheet(book, index):
    st = book.sheet_by_index(index)
    for md in TABLE_META_DATA:
        data = extract_table(st, **md)
        print json.dumps(data, indent=2)


if __name__ == '__main__':
    #extract('data/A01.xlsx')
    wb = xlrd.open_workbook('data/A01.xlsx')
    extract_sheet(wb, 2)

    #for f in all_files:
    #    base_sheet_name = f[:3]
    #    filepath = os.path.join(base_path, f)
    #    logger.info("Checking file {}".format(f))
    #    wb = xlrd.open_workbook(filepath)

