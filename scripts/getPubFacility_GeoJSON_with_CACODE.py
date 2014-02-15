# -*- coding: utf8 -*-
# Requirement:
#   1) a folder "data" which contains all the public facility csv files
#   2) Environment Variables graphically in Windows
#       add a system variable: GDAL_DATA and the value is C:\Program Files (x86)\QGIS Dufour\share\gdal
#   Reference: http://stackoverflow.com/questions/14444310/how-to-set-the-gdal-data-environment-variable-to-point-to-the-directory-containi
#   3) library
#      - xlwt : for writing xls file 
#      - chardet: for determine the file encoding
#
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
#   Solution: call fixedCSV()
  


import os
import csv
import codecs

from os import listdir
from os.path import isfile, join

import xlwt 
import chardet

import json
import subprocess 

#columns we want to extract
WANTEDCOLS = [
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

OGR2OGR_PATH = '"C:/Program Files (x86)/QGIS Dufour/bin/ogr2ogr.exe"'
# the setting file for ogr2ogr command
PATH_TO_VRT_FILE = "C:/tmp/test/settings.vrt" # must be full path
# the GeoJSON file  which contains constituency area information
HK_CA_POLYGON_FILE = 'HKConstituencyArea.json'

OUTPUT_FILENAME = "pub_facility.geojson"
OUTPUT_WITH_CACODE_FILENAME = "pub_facility_with_CACODE.geojson"


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

#fix CSV file - fix the entry about LIBRARY_LCSD_20131213.csv
def fixCSV():
    newlines = []
    base_path = os.path.abspath("./data")
    originalText = "Tsz Lok Community Residents' Association\t\t\t\t\t\t\tTsz Lok Community Residents' Association"
    replacementText = "Tsz Lok Community Residents' Association"
    
    #get file LIBRARY_LCSD_20131213.csv
    filepath = base_path + "\LIBRARY_LCSD_20131213.csv"    
    
    infile = codecs.open(filepath,'r', encoding='utf-16-le')    
    for line in infile:        
        if originalText in line:            
            newlines.append(line.replace(originalText,replacementText))
        else:
            newlines.append(line)
    infile.close()

    outfile = codecs.open(filepath, 'w', encoding='utf-16-le')
    outfile.writelines(newlines)
    outfile.close()

#combineCSV_as_xls_file(outfn) - based on the WANTEDCOLS, extract the corrsponding data and combine all the data into a single excel file
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
    for data in WANTEDCOLS:
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
        #print filename
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
                if (col in WANTEDCOLS):                                        
                    colIdx[col] = columnName.index(col)                     
            
            
            #read rest of the rows in the csv file            
            for row in sr:
                if len(row) > 0:
                    columnData =  extractColumns(row)  

                    #get the correspondind wanted columns and save to csv file
                    colNum = 0 #reset
                    for key in WANTEDCOLS:
                        #get the index                        
                        idx = colIdx[key]    

                        data = columnData[idx].replace('"', "")
                        
                        
                        udata = unicode(data.decode('UTF-8'))
                        sheet.write(rowNum, colNum, udata) 
                        colNum = colNum+1
                        
                    rowNum = rowNum+1
    workbook.save(outfn) 

#combineCSV_as_csv_file(outfn) - based on the WANTEDCOLS, extract the corrsponding data and combine all the data into a single csv file
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
    for data in WANTEDCOLS:                   
        header.append(data[1:-1]) #remove leading and tailing double quote
    
    csvWriter.writerow(header)

    # for each of the file 
    for filepath in onlyfiles:        
        #form the full file path
        refFile_path = os.path.join(base_path, filepath)

        #get the file name without extension
        filename, _ = os.path.splitext(filepath)
        #print filename
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
                if (col in WANTEDCOLS):                                        
                    colIdx[col] = columnName.index(col)                     
            
            
            #read rest of the rows in the csv file            
            for row in sr:
                if len(row) > 0:
                    columnData =  extractColumns(row)                      

                    #get the correspondind wanted columns and save to csv file
                    rowData = []                    
                    for key in WANTEDCOLS:
                        #get the index                        
                        idx = colIdx[key]    

                        #data = columnData[idx].replace('"', "")
                        data =  columnData[idx][1:-1] # remove leading and tailing double quote 
                        
                        rowData.append(data)
                    
                    #write to file                      
                    csvWriter.writerow(rowData)
              

    ff.close()    

# pnpoly(coords, point) - check the point in polygon
# parameter
#   coords - list of [x, y] coordinates
#   point - [x, y] coordinates
#reference: http://stackoverflow.com/questions/217578/point-in-polygon-aka-hit-test
def pnpoly(coords, point):
    nvert = len(coords)
    vertx = []
    verty = []
    for element in coords:
        vertx.append(element[0])
        verty.append(element[1])
    vertx.append(vertx[0])
    verty.append(verty[0])
    testx = point[0]
    testy = point[1]
    
    j=nvert-1
    c = False
    for i in range(nvert):
        if (((verty[i]>testy) != (verty[j]>testy)) and (testx < (vertx[j]-vertx[i]) * (testy-verty[i]) / (verty[j]-verty[i]) + vertx[i]) ):
            c = not c
        j=i

    return c


# addCACODEProperty(polygonJSONfn) - scan through the GeoJSON file, 
#   for each public facility location, check it belongs to which constituency area (CA)
#   and then create a new property "CACODE" and store the corrsponding location
#   (e.g. Post Offices, Oi Man Post Office located at CA G22)
#   Also, this function will remove irrevlant properties about EASTING and NORTHING
# parameter
#   polygonJSONfn - the GeoJSON file name which contains constituency area information
#   pubFacilityJSONfn - the GeoJSON file name which contains public facility information
#   outputfn - output file name
def addCACODEProperty(polygonJSONfn, pubFacilityJSONfn, outputfn):
    #read json file
    json_data = open(polygonJSONfn)
    data = json.load(json_data)
    json_data.close()

    CACoords = {}

    # for each features
    numOfFeatures = len(data['features'])
    for i in range(numOfFeatures):
        #get coordinates
        ca = data['features'][i]['properties']['CACODE']    
        coords =  data['features'][i]['geometry']['coordinates'][0] 
        CACoords[ca] = coords   

    #print "prepared the CACoords dict!"

    pub_facility_json_data = open(pubFacilityJSONfn)
    pub_facility_data = json.load(pub_facility_json_data)
    pub_facility_json_data.close()

    numOfPubFacility = len(pub_facility_data['features'])

    #for each public facility, create placeholder
    #  remove EASTING and NORTHING
    for i in range(numOfPubFacility):
        pub_facility_data['features'][i]['properties']['CACODE']    = "-"
        del pub_facility_data['features'][i]['properties']['EASTING']
        del pub_facility_data['features'][i]['properties']['NORTHING']

    #for each CA
    print "Please wait for a while... It takes some time..."
    for ca, coords in CACoords.items():
        #print ca
        #form polygon
        #polygon = Polygon(*coords)
        #for each public facility   
        for i in range(numOfPubFacility):
            #if there is no CACODE, do the checking             
            if pub_facility_data['features'][i]['properties']['CACODE'] == "-":
                location = pub_facility_data['features'][i]['geometry']['coordinates']
                #point = Point(location)
                #check if it is in or out           
                #if polygon.encloses_point(point):
                #   print pub_facility_data['features'][i]['properties']['ENGLISH CATEGORY']                                                
                #   print pub_facility_data['features'][i]['properties']['ENGLISH NAME']                                                

                if pnpoly(coords, location):                
                    pub_facility_data['features'][i]['properties']['CACODE'] = ca   
                    #print pub_facility_data['features'][i]['properties']['ENGLISH CATEGORY']                                               
                    #print pub_facility_data['features'][i]['properties']['ENGLISH NAME']   
        


    # output the file in utf-8, but maintain the Chinese characters
    s = json.dumps(pub_facility_data, indent=2, ensure_ascii=False)
    open(outputfn, 'w+').write(s.encode('utf-8'))

# randomCheck(polygonJSONfn, pubFacilityJSONfn) - random select a polygon and then look for the which pubFacility belongs to it
#   polygonJSONfn - the GeoJSON file name which contains constituency area information
#   pubFacilityJSONfn - the GeoJSON file name which contains public facility information
# Requirement:  sympy 
# Note: long processing time...
# checked
#  Total number of public facility in C21 : 15
def randomCheck(polygonJSONfn, pubFacilityJSONfn):  
    from sympy import Polygon
    from sympy.geometry import Point
    import random
    totalMatch = 0
    #read json file
    json_data = open(polygonJSONfn)
    data = json.load(json_data)
    json_data.close()

    CACoords = {}

    # for each features
    numOfFeatures = len(data['features'])
    #get a random number
    idx = random.randint(0, numOfFeatures-1)

    ca = data['features'][idx]['properties']['CACODE']  
    #print ca
    coords =  data['features'][idx]['geometry']['coordinates'][0]
    #form polygon
    polygon = Polygon(*coords)

    pub_facility_json_data = open(pubFacilityJSONfn)
    pub_facility_data = json.load(pub_facility_json_data)
    pub_facility_json_data.close()

    numOfPubFacility = len(pub_facility_data['features'])
    print "Please wait for a while... It takes some time..."
    #for each public facility   
    for i in range(numOfPubFacility):       
        location = pub_facility_data['features'][i]['geometry']['coordinates']
        point = Point(location)
        #check if it is in or out           
        if polygon.encloses_point(point):
            print pub_facility_data['features'][i]['properties']['ENGLISH CATEGORY'], 
            print pub_facility_data['features'][i]['properties']['ENGLISH NAME']                                                
            totalMatch = totalMatch + 1


    print "Total number of public facility in ", ca, ":", totalMatch
    

if __name__ == "__main__":
    #check all the csv file encoding
    #check_encoding()

    #check the difference column amony all csv files
    #check_for_differences()    

    #fix csv file()
    fixCSV()
    print "Fix CSV - DONE!"

    #combine csv files
    #combineCSV_as_xls_file('combine.xls')

    #combine csv files and save as single csv file
    combineCSV_as_csv_file('combine.csv')
    print "Combine files as single csv file  - DONE!"

    #call ogr2ogr command
        
    commandLine = OGR2OGR_PATH + " -f GeoJSON " + OUTPUT_FILENAME + " -s_srs EPSG:2326 " + PATH_TO_VRT_FILE + " -t_srs EPSG:4326"
    proc = subprocess.Popen(commandLine)  
    proc.wait() #wait until it finish
    print "Export GeoJSON in WRS84  - DONE!"  


    addCACODEProperty(HK_CA_POLYGON_FILE, OUTPUT_FILENAME, OUTPUT_WITH_CACODE_FILENAME)
    print "Add CACODEProperty to GeoJSON! - DONE!"    
    
    #randomCheck('HKConstituencyArea.json', 'pub_facility.geojson')
    