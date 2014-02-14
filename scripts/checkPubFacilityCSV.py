# This script used to read all the public facility csv columns and look for
#  1) Common column headers among all csv files
#  2) Unique column headers among all csv files
# Requirement:
#   a folder "data" which contains all the public facility csv files
# to run this script
#   python check
# Note: 
#   the current CSV is in encoding utf-16-le, need to decode as utf-8
#   reference: http://stackoverflow.com/questions/9177820/python-utf-16-csv-reader
# Other:
#   to check the encoding of all csv file, you can uncomment line#141


import os
import csv
import codecs

from os import listdir
from os.path import isfile, join


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

def check_encoding():
    import chardet
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



    

if __name__ == "__main__":
    #check all the csv file encoding
    #check_encoding()
    check_for_differences()
    
    
    print "done!"

    