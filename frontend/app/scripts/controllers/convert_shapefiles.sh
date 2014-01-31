#!/bin/sh

# some notes here on how to convert the shapefiles

# EPSG:2326 is HK 1980 grid system.
ogr2ogr -f "GeoJSON" ca_polygon.geo.json ./dcca2011_shp/dcca2011_polygon.shp -t_srs EPSG:4326 -s_srs EPSG:2326
ogr2ogr -f "GeoJSON" ca_label.geo.json ./dcca2011_shp/dcca2011_label.shp -t_srs EPSG:4326 -s_srs EPSG:2326

# Simplify significantly
# This keeps 30% of the points in the polygons
topojson -o ca_polygon.topo.json --simplify-proportion 0.3 -p CACODE ca_polygon.geo.json
topojson -o dc_polygon.topo.json --simplify-proportion 0.3 -p DCCODE dc_polygon.geo.json
