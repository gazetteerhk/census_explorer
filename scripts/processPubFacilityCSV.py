# -*- coding: utf8 -*-
# Requirement:
#   a folder "data" which contains all the public facility csv files
#   - xlwt : for writing xls file
#   - chardet: for determine the file encoding
# Note: 
#   the current CSV is in encoding utf-16-le, need to decode as utf-8
#
# Other:
#   To check the encoding of all csv file, you can call check_encoding()
#   To check the column differences, you can call check_for_differences() 
# Issues:
# 1. No English Name for Recycling Organisations and Collection Points 錦發五金家品有限公司 - 天恩 
# 2. No English Address for all the country Park
# 3. Wrong extraction for Tsz Lok Community Residents' Association
#   This is due to there are the tab is appears in the English name field,
#   Solution: manually update LIBRARY_LCSD_20131213.csv, row# 187
#  
# After obtain the csv file
# 1) use qgis to generate the geojson file

import os
import csv
import codecs

from os import listdir
from os.path import isfile, join

import xlwt 
import chardet

#columns we want to extract
wantedCols = [
'"ENGLISH CATEGORY"',
'"中文類別"',
'"ENGLISH NAME"',
'"中文名稱"',
'"NORTHING"',     
'"EASTING"', 
'"ENGLISH ADDRESS"', 
'"中文地址"',
'"TELEPHONE"', 
'"FAX NUMBER"', 
'"OPENING HOURS"',
'"EMAIL ADDRESS"',            
'"WEBSITE"'] 

#reference: http://stackoverflow.com/questions/9177820/python-utf-16-csv-reader
class Recoder(object):
    def __init__(self, stream, decoder, encoder, eol='\r\n'):
        self._stream = stream
        self._decoder = decoder if isinstance(decoder, codecs.IncrementalDecoder) else codecs.getincrementaldecoder(decoder)()
        self._encoder = encoder if isinstance(encoder, codecs.IncrementalEncoder) else codecs.getincrementalencoder(encoder)()
        self._buf = ''
        self._eol = eol
        self._reachedEof = False

    def read(self, size=None):
        r = self._stream.read(size)
        raw = self._decoder.decode(r, size is None)
        return self._encoder.encode(raw)

    def __iter__(self):
        return self

    def __next__(self):
        if self._reachedEof:
            raise StopIteration()
        while True:
            line,eol,rest = self._buf.partition(self._eol)
            if eol == self._eol:
                self._buf = rest
                return self._encoder.encode(line + eol)
            raw = self._stream.read(1024)
            if raw == '':
                self._decoder.decode(b'', True)
                self._reachedEof = True
                return self._encoder.encode(self._buf)
            self._buf += self._decoder.decode(raw)
    next = __next__

    def close(self):
        return self._stream.close()

#check_encoding() - read all the public facility csv columns and look for the encoding
def check_encoding():    
    base_path = os.path.abspath("./data") 
    onlyfiles = [ f for f in listdir(base_path) if isfile(join(base_path,f)) ]
    headers = {}
    # for each of the file 
    for filepath in onlyfiles:        
        #form the full file path
        refFile_path = os.path.join(base_path, filepath)
        
        rawdata = open(refFile_path, "r").read()
        result = chardet.detect(rawdata)
        charenc = result['encoding']
        print charenc


# check_for_differences() - read all the public facility csv columns and look for
#  1) Common column headers among all csv files
#  2) Unique column headers among all csv files
def check_for_differences():    
    base_path = os.path.abspath("./data") 
    onlyfiles = [ f for f in listdir(base_path) if isfile(join(base_path,f)) ]
    headers = {}
    # for each of the file 
    for filepath in onlyfiles:        
        #form the full file path
        refFile_path = os.path.join(base_path, filepath)

        #get the file name without extension
        filename, _ = os.path.splitext(filepath)

        #open the csv file   
        with open(refFile_path,'rb') as f:
            #decode file first
            sr = Recoder(f, 'utf-16le', 'utf-8')
            #only get the first row
            headerRow = csv.reader(sr).next()
            #force to replace 
        headers[filename] = headerRow   
    
    
    #get all the unique column names    
    columnList = []
    for header in headers:          
        columnName = headers[header][0].split("\t")       
        
        #remove empty string from list 
        columnName = filter(len, columnName)
        numOfColumn = len(columnName)
        columnList.extend(columnName)


    uniqueColumns = set(columnList)
    print "Total number of unique columns: ", len(uniqueColumns)
    # print them out
    for i in uniqueColumns:
        if 'ENGLISH CATEGORY' in i:
            i = '"ENGLISH CATEGORY"'
        print unicode(i.decode('UTF-8'))

    #same column names among 79 tables 
    sameColumnList = []
    firstTime = True
    for header in headers:
        if firstTime:
            sameColumnList = headers[header][0].split("\t")
            sameColumnList = filter(len, sameColumnList) #remove empty string from list    
            firstTime = False
            continue
        
        columnName = headers[header][0].split("\t")      
        #remove empty string from list 
        columnName = filter(len, columnName)        
        #check if it existed in previous csv file
        sameColumnList = set(columnName) & set(sameColumnList)

    sameColumnList = set(sameColumnList)
    print "Total number of same columns among all csv: ", len(sameColumnList)
    # print them out
    for i in sameColumnList:
        #Because the csv file in utf-16-le, the first column header
        # with extra string \ufeff e.g. \ufeff"ENGLISH CATEGORY"
        # it needs to remove \ufeff for the first column header
        if 'ENGLISH CATEGORY' in i:
            i = '"ENGLISH CATEGORY"'
        print unicode(i.decode('UTF-8'))

#extractColumnHeader(row) - extract the column header 
def extractColumnHeader(row):
    return extractColumns(row[0])

#extractColumns(row) - extract the column content 
def extractColumns(row):    
    columnName = row.split("\t")
    #remove empty string from list 
    cols = filter(len, columnName)                        
    
    #fix the problem about the 1st column header
    if 'ENGLISH CATEGORY' in cols[0]:
        cols[0] = '"ENGLISH CATEGORY"'

    return cols


#combineCSV_as_xls_file(outfn) - based on the wantedCols, extract the corrsponding data and combine all the data into a single excel file
#parameter
#   outfn - output excel file name, e.g. combine.xls
def combineCSV_as_xls_file(outfn):    
    base_path = os.path.abspath("./data")
    
    onlyfiles = [ f for f in listdir(base_path) if isfile(join(base_path,f)) and f.endswith('.csv') ]
    #write to file
    workbook = xlwt.Workbook()
    sheet = workbook.add_sheet('data')
    rowNum = 0

    #prepare the header
    colNum = 0
    for data in wantedCols:
        udata = unicode(data.decode('UTF-8'))
        sheet.write(rowNum, colNum, udata.replace('"',"")) 
        colNum = colNum + 1
    rowNum = rowNum+1


    # for each of the file 
    for filepath in onlyfiles:        
        #form the full file path
        refFile_path = os.path.join(base_path, filepath)

        #get the file name without extension
        filename, _ = os.path.splitext(filepath)
        print filename
        #open the csv file   
        with open(refFile_path,'rb') as f:
            #decode file first
            sr = Recoder(f, 'utf-16le', 'utf-8')
            #get the first row
            headerRow = csv.reader(sr).next()
            #extract the column name first
            columnName = extractColumnHeader(headerRow)
            
            #get the index about which column we should extract
            #colIdx = []
            colIdx = {}
            for col in columnName:                
                if (col in wantedCols):                                        
                    colIdx[col] = columnName.index(col)                     
            
            
            #read rest of the rows in the csv file            
            for row in sr:
                if len(row) > 0:
                    columnData =  extractColumns(row)  

                    #get the correspondind wanted columns and save to csv file
                    colNum = 0 #reset
                    for key in wantedCols:
                        #get the index                        
                        idx = colIdx[key]    

                        data = columnData[idx].replace('"', "")
                        
                        
                        udata = unicode(data.decode('UTF-8'))
                        sheet.write(rowNum, colNum, udata) 
                        colNum = colNum+1
                        
                    rowNum = rowNum+1
    workbook.save(outfn) 

#combineCSV_as_csv_file(outfn) - based on the wantedCols, extract the corrsponding data and combine all the data into a single csv file
#parameter
#   outfn - output csv file name, e.g. combine.csv
def combineCSV_as_csv_file(outfn):    
    base_path = os.path.abspath("./data")
    
    onlyfiles = [ f for f in listdir(base_path) if isfile(join(base_path,f)) and f.endswith('.csv') ]
    #write to csv file
    ff = open(outfn, 'wb')
    ff.write(codecs.BOM_UTF8) #ensure utf-8 output
    csvWriter = csv.writer(ff)

    #write the header        
    header = []
    for data in wantedCols:                   
        header.append(data[1:-1]) #remove leading and tailing double quote
    
    csvWriter.writerow(header)

    # for each of the file 
    for filepath in onlyfiles:        
        #form the full file path
        refFile_path = os.path.join(base_path, filepath)

        #get the file name without extension
        filename, _ = os.path.splitext(filepath)
        print filename
        #open the csv file   
        with open(refFile_path,'rb') as f:
            #decode file first
            sr = Recoder(f, 'utf-16le', 'utf-8')
            #get the first row
            headerRow = csv.reader(sr).next()
            #extract the column name first
            columnName = extractColumnHeader(headerRow)
            
            #get the index about which column we should extract            
            colIdx = {}
            for col in columnName:                
                if (col in wantedCols):                                        
                    colIdx[col] = columnName.index(col)                     
            
            
            #read rest of the rows in the csv file            
            for row in sr:
                if len(row) > 0:
                    columnData =  extractColumns(row)                      

                    #get the correspondind wanted columns and save to csv file
                    rowData = []                    
                    for key in wantedCols:
                        #get the index                        
                        idx = colIdx[key]    

                        #data = columnData[idx].replace('"', "")
                        data =  columnData[idx][1:-1] # remove leading and tailing double quote 
                        
                        rowData.append(data)
                    
                    #write to file                      
                    csvWriter.writerow(rowData)
              

    ff.close()    
    

if __name__ == "__main__":
    #check all the csv file encoding
    #check_encoding()

    #check the difference column amony all csv files
    #check_for_differences()    

    #combine csv files
    #combineCSV_as_xls_file('combine.xls')

    #combine csv files and save as single csv file
    combineCSV_as_csv_file('combine.csv')
    print "done!"    