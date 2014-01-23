from collections import Counter
import os
from log import logger
from constituency_area_data import all_files, base_path
import xlrd


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


def check_row_names():
    """
    Checks that columns A and H in all of the workbooks match up.
    Just a simple check to see if we need to do more complicated parsing

    Really slow, I think because of opening each file.
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

    for f in all_files:
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


