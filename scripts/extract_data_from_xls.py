from collections import Counter
import os
import xlrd
import json
import sh
import itertools
import pprint
import multiprocessing

from log import logger
import config
from constituency_areas import ALL_FILES

base_path = os.path.abspath(config.DIR_DATA_DOWNLOAD)

def check_sheet(wb, tab_name, col, check_col):
    """
    Checks a sheet.

    Arguments:
    ----------
    col: integer
        Either 0 or 7, 0 for column a, 7 for column h

    check_col: list
        The list for the column to compare against

    tab_name: string
        The tab name to extract the column from

    wb: workbook object
        The workbook to use
    """
    matches = True
    tmp_sheet = wb.sheet_by_name(tab_name)
    tmp = [x.value for x in tmp_sheet.col(col)]
    error_rows = []
    if tmp != check_col:
        matches = False
        logger.warning(u"File tab {} column A differs:".format(tab_name))
        max_row = max(len(tmp), len(check_col))
        for i in range(max_row):
            if i < len(tmp) and i < len(check_col):
                if tmp[i] != check_col[i]:
                    error_rows.append(i)
                    logger.warning(u"Row {}, base is {}, file is {}".format(i + 1, check_col[i], tmp[i]))
            elif i >= len(tmp) and i < len(check_col):
                logger.warning(u"Row {}, base is {}, but doesn't exist in file".format(i + 1, check_col[i]))
            elif i< len(tmp) and i >= len(check_col):
                logger.warning(u"Row {}, doesn't exist in base, but in file is {}".format(i + 1, tmp[i]))

    if matches:
        return True
    else:
        return error_rows


def check_for_differences():
    """
    Checks that columns A and H in all of the workbooks match up.
    Just a simple check to see if we need to do more complicated parsing

    Really slow, I think because of opening each file.

    Here's the results of this:
    Counter({0: 1233, 11: 1224, 10: 1200, 9: 1191, 7: 1173, 12: 1023, 13: 1023, 14: 1023, 8: 708})
    Basically the problem is the ethnicity section, which seems to change sorts for each district.  Not a big problem.

    """
    # Make the base versions to compare against
    a01 = xlrd.open_workbook(os.path.join(base_path, 'A01.xlsx'))
    tmp_sheet = a01.sheet_by_name('A01e')
    base_english_a = [x.value for x in tmp_sheet.col(0)]
    base_english_h = [x.value for x in tmp_sheet.col(7)]
    tmp_sheet = a01.sheet_by_name('A01t')
    base_traditional_a = [x.value for x in tmp_sheet.col(0)]
    base_traditional_h = [x.value for x in tmp_sheet.col(7)]
    tmp_sheet = a01.sheet_by_name('A01s')
    base_simplified_a = [x.value for x in tmp_sheet.col(0)]
    base_simplified_h = [x.value for x in tmp_sheet.col(7)]
    counter = 0
    errors = 0
    frequency = Counter()

    for f in ALL_FILES:
        base_sheet_name = f[:3]
        filepath = os.path.join(base_path, f)
        logger.info("Checking file {}".format(f))
        wb = xlrd.open_workbook(filepath)

        # Check the sheets
        results = [
            check_sheet(wb, base_sheet_name + 'e', 0, base_english_a),
            check_sheet(wb, base_sheet_name + 'e', 7, base_english_h),
            check_sheet(wb, base_sheet_name + 's', 0, base_simplified_a),
            check_sheet(wb, base_sheet_name + 's', 7, base_simplified_h),
            check_sheet(wb, base_sheet_name + 't', 0, base_traditional_a),
            check_sheet(wb, base_sheet_name + 't', 7, base_traditional_h),
            ]

        # Results is a list of either lists or Trues.  If true, it means that check passed.
        # If it's a list, then it's a list of the row numbers where a mismatch occured.  We store these
        # so that we can quickly see which rows need extra attention
        [frequency.update(a) for a in results if a is not True]

        if all([x is True for x in results]):
            counter += 1
            logger.info(u"No errors in file {}".format(f))
        else:
            errors += 1
            counter += 1

    logger.info(u"{} files checked, {} mismatches".format(counter, errors))
    logger.info(u"Rows that had errors, and their frequency:")
    logger.info(frequency)

from table_meta_data import TABLE_META_DATA
# Sample:
#TABLE_META_DATA = [
#        {
#        'name': 'household', 
#        'header': ['A114', 'E114'], 
#        'body': ['A115', 'E126']
#        }
#]
OUTPUT_PREFIX = config.DIR_DATA_CLEAN_JSON
INPUT_PREFIX = config.DIR_DATA_DOWNLOAD

def cell_name_to_pos(cellPosition):
    #NOTE:
    #    only works for single letter column
    col = ord(cellPosition[0]) - ord('A') #convert letter to ASCII, then suyb
    row = int(cellPosition[1:]) - 1 # minus 1
    return row, col

def pos_to_cell_name(row, col):
    #NOTE:
    #    only works for single letter column
    return '%s%d' % (chr(col + ord('A')), row + 1)

def extract_table(sheet, table, name, header, body):
    # header: (A6, E6)
    # body: (A7, E13)
    row1, col1 = cell_name_to_pos(header[0])
    row2, col2 = cell_name_to_pos(header[1])
    #column_names = [sheet.cell(row1, j).value for j in range(col1,col2+1)]
    column_names = [get_identifier(sheet, table, row1, j) for j in range(col1,col2+1)]

    row1, col1 = cell_name_to_pos(body[0])
    row2, col2 = cell_name_to_pos(body[1])
    #row_names = [sheet.cell(i, col1).value for i in range(row1,row2+1)]
    row_names = [get_identifier(sheet, table, i, col1) for i in range(row1,row2+1)]

    data = []
    for i in range(row1, row2 + 1):
        data.append([sheet.cell(i, j).value for j in range(col1 + 1, col2 + 1)])
    #last_primary_cat = None
    #for i in range(row1,row2+1):
    #    cells = [sheet.cell(i, j).value for j in range(col1,col2+1)]
    #    data.append(dict(zip(column_names, cells)))
    
    return {
            'meta': {
                'table_id': table,
                'table_name': name,
                #'first_column_name': column_names[0]
                # other meta data
                },
            'row_names': row_names,
            'column_names': column_names,
            'data': data}

def extract_sheet(book, index):
    st = book.sheet_by_index(index)
    tables = {}
    for (i, md) in enumerate(TABLE_META_DATA):
        data = extract_table(st, i, **md)
        tables['table' + str(i)] = data
    return tables

def extract_book(filename):
    # 0: CH T
    # 1: CH S
    # 2: EN
    #NOTE:
    #    Only sheet English sheet is concerned.
    #    Other sheets can be easily reconstructed with identifier and translation.
    wb = xlrd.open_workbook(filename)
    return extract_sheet(wb, 2)
    #sheets = {}
    ##for i in [0, 1, 2]:
    #for i in [2]:
    #    tables = extract_sheet(wb, i)
    #    sheets['sheet' + str(i)] = tables
    #return sheets

from constituency_areas import MAPPING_AREA_CODE_TO_ENGLISH, MAPPING_AREA_CODE_TO_SIMPLIFIED, MAPPING_AREA_CODE_TO_TRADITIONAL

#def add_meta_info(table_data, area, sheet_name):
#    mapping = {'sheet0': MAPPING_AREA_CODE_TO_TRADITIONAL,
#            'sheet1': MAPPING_AREA_CODE_TO_SIMPLIFIED,
#            'sheet2': MAPPING_AREA_CODE_TO_ENGLISH}[sheet_name]
#    table_data['meta'].update({'area': mapping[area.lower()]})
#    lang = {'sheet0': 'traditional',
#            'sheet1': 'simplified',
#            'sheet2': 'english'}[sheet_name]
#    table_data['meta'].update({'language': lang})
#    return table_data

def process_one_file(fn):
    area = fn[:3]
    fullpath = os.path.join('data', fn)
    tables = extract_book(fullpath)
    for (tn, td) in tables.iteritems():
        output_dir = os.path.join(OUTPUT_PREFIX, 'areas', area)
        sh.mkdir('-p', output_dir)
        output_path = os.path.join(output_dir, tn) + '.json'
        #add_meta_info(td, area)
        td['meta']['area'] = area
        json.dump(td, open(output_path, 'w'))
    logger.info('process one xls done:' + fn)

import re
_IDENTIFIER_CLEANER = re.compile(ur'[\(\)\$#&,/]')
#_IDENTIFIER_BLANKS = re.compile(r'\s')
def get_identifier(sheet, table, row, col):
    value = unicode(sheet.cell(row, col).value)
    # clean and shorten human readable strings
    value = _IDENTIFIER_CLEANER.sub('', value)
    terms = value.strip().split()
    if terms:
        leading_term = terms[0]
    else:
        leading_term = None

    if table in [0]:
        # NOTE:
        #     Use table as prefix. 
        #     This is to solve problems in table1, 
        #     where the order can be different across areas.
        return ('tab%s_%s' % (table, leading_term)).lower()
    else:
        cell_name = pos_to_cell_name(row, col)
        return ('%s_%s' % (cell_name, leading_term)).lower()

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

        row1, col1 = cell_name_to_pos(header[0])
        row2, col2 = cell_name_to_pos(header[1])
        body_row1, body_col1 = cell_name_to_pos(body[0])
        body_row2, body_col2 = cell_name_to_pos(body[1])

        column_positions = [(row1, j) for j in range(col1, col2 + 1)]
        row_positions = [(j, body_col1) for j in range(body_row1, body_row2 + 1)]
        #TODO:
        #    rows and columns may be handled differently.
        #    e.g. rows like "1 - 1000" do carry some special information
        all_positions = column_positions + row_positions

        names = {}
        #get different language sheet in excel
        for i in sheetNum:
            sheet = book.sheet_by_index(i)
            names[i] = [unicode(sheet.cell(*pos).value).strip() for pos in all_positions]
        ids = [get_identifier(sheet, i, *pos) for pos in all_positions]

        for c in range(len(all_positions)):
            traditional_col = names[0][c]
            simplified_col = names[1][c]
            english_col = names[2][c]
            identifier = ids[c]
            translateDict[identifier] = {'T':traditional_col, 'S':simplified_col,'E':english_col}

    return translateDict

def gen_translation():
    fullpath = os.path.join(config.DIR_DATA_DOWNLOAD, 'A01.xlsx')
    wb = xlrd.open_workbook(fullpath)
    translate_dict = translate_sheet(wb)
    from translation_fix import ERRATA
    for identifier, trans in ERRATA.iteritems():
        translate_dict[identifier].update(trans)
    with open(os.path.join(config.DIR_DATA_CLEAN_JSON, 'translation.json'), 'w') as outfile:
        json.dump(translate_dict, outfile)

def main():
    logger.info('Start to parse individual xls files')
    sh.rm('-rf', OUTPUT_PREFIX)
    sh.mkdir('-p', OUTPUT_PREFIX)
    files = [fn for fn in sh.ls(INPUT_PREFIX).split()]
    pool = multiprocessing.Pool()
    pool.map(process_one_file, files)

    logger.info('Start to generate translation dicts')
    gen_translation()


if __name__ == '__main__':
    main()
