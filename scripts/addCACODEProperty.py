# -*- coding: utf8 -*-
# Requirement:
#	- the GeoJSON file  which contains constituency area information
#	- the GeoJSON file  which contains public facility information
#
# addCACODEProperty - can through the GeoJSON file, 
#	for each public facility location, check it belongs to which constituency area (CA)
#	and then create a new property "CACODE" and store the corrsponding location

import json


# pnpoly(coords, point) - check the point in polygon
# parameter
#	coords - list of [x, y] coordinates
#	point - [x, y] coordinates
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
#	for each public facility location, check it belongs to which constituency area (CA)
#	and then create a new property "CACODE" and store the corrsponding location
#	(e.g. Post Offices, Oi Man Post Office located at CA G22)
#	Also, this function will remove irrevlant properties about EASTING and NORTHING
# parameter
#	polygonJSONfn - the GeoJSON file name which contains constituency area information
#	pubFacilityJSONfn - the GeoJSON file name which contains public facility information
#	outputfn - output file name
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

	print "prepared the CACoords dict!"

	pub_facility_json_data = open(pubFacilityJSONfn)
	pub_facility_data = json.load(pub_facility_json_data)
	pub_facility_json_data.close()

	numOfPubFacility = len(pub_facility_data['features'])

	#for each public facility, create placeholder
	#  remove EASTING and NORTHING
	for i in range(numOfPubFacility):
		pub_facility_data['features'][i]['properties']['CACODE']	= "-"
		del pub_facility_data['features'][i]['properties']['EASTING']
		del pub_facility_data['features'][i]['properties']['NORTHING']

	#for each CA
	for ca, coords in CACoords.items():
		print ca
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
				#	print pub_facility_data['features'][i]['properties']['ENGLISH CATEGORY']												
				#	print pub_facility_data['features'][i]['properties']['ENGLISH NAME']												

				if pnpoly(coords, location):				
					pub_facility_data['features'][i]['properties']['CACODE'] = ca	
					#print pub_facility_data['features'][i]['properties']['ENGLISH CATEGORY']												
					#print pub_facility_data['features'][i]['properties']['ENGLISH NAME']	
		


	# output the file in utf-8, but maintain the Chinese characters
	s = json.dumps(pub_facility_data, indent=2, ensure_ascii=False)
	open(outputfn, 'w+').write(s.encode('utf-8'))

# randomCheck(polygonJSONfn, pubFacilityJSONfn) - random select a polygon and then look for the which pubFacility belongs to it
#	polygonJSONfn - the GeoJSON file name which contains constituency area information
#	pubFacilityJSONfn - the GeoJSON file name which contains public facility information
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
	print ca
	coords =  data['features'][idx]['geometry']['coordinates'][0]
	#form polygon
	polygon = Polygon(*coords)

	pub_facility_json_data = open(pubFacilityJSONfn)
	pub_facility_data = json.load(pub_facility_json_data)
	pub_facility_json_data.close()

	numOfPubFacility = len(pub_facility_data['features'])

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
	
	addCACODEProperty('HKConstituencyArea.json', 'pub_facility.geojson', 'pub_facility_with_CACODE.geojson')
	#randomCheck('HKConstituencyArea.json', 'pub_facility.geojson')
	print "done!"    