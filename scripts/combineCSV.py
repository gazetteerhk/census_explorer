# -*- coding: utf8 -*-
# Requirement:
#   - xlwt : for writing xls file
#   - a folder "data" which contains all the public facility csv files
# Issues:
# 1. No English Name for Recycling Organisations and Collection Points 錦發五金家品有限公司 - 天恩 
# 2. No English Address for all the country Park
# 3. Wrong extraction for Tsz Lok Community Residents' Association
#   This is due to there are the tab is appears in the English name field, it was a delimiter
#
#  
# After obtain the csv file
# 1) need to manually fix issue #3
# 2) save the file to csv 
# 3) use qgis to generate the geojson file

import os
import csv
import codecs

from os import listdir
from os.path import isfile, join
import xlwt 

#run in windows console
#import sys     
#reload(sys)      
#sys.setdefaultencoding('utf8')

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

def extractColumnHeader(row):
    return extractColumns(row[0])

def extractColumns(row):    
    columnName = row.split("\t")
    #remove empty string from list 
    cols = filter(len, columnName)                        
    
    #fix the problem about the 1st column header
    if 'ENGLISH CATEGORY' in cols[0]:
        cols[0] = '"ENGLISH CATEGORY"'

    return cols

def combineCSV():    
    base_path = os.path.abspath("./data")
    
    onlyfiles = [ f for f in listdir(base_path) if isfile(join(base_path,f)) ]
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
    workbook.save('combine.xls')      
    
    

if __name__ == "__main__":
    
    combineCSV()    
    print "done!"

    