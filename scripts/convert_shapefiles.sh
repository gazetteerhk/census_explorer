#!/bin/sh

# some notes here on how to convert the shapefiles

# EPSG:2326 is HK 1980 grid system.
ogr2ogr -f "GeoJSON" ca_polygon.geo.json ./dcca2011_shp/dcca2011_polygon.shp -t_srs EPSG:4326 -s_srs EPSG:2326
ogr2ogr -f "GeoJSON" ca_label.geo.json ./dcca2011_shp/dcca2011_label.shp -t_srs EPSG:4326 -s_srs EPSG:2326

# For the land only files
ogr2ogr -f "GeoJSON" ca_polygon.geo.json ./dcca2011_shp/dcca_land.shp -t_srs EPSG:4326 -s_srs EPSG:2326
ogr2ogr -f "GeoJSON" dc_polygon.geo.json ./dcca2011_shp/dc_land.shp -t_srs EPSG:4326 -s_srs EPSG:2326

# Simplify significantly
# This keeps 30% of the points in the polygons
topojson -o ca_polygon.topo.json --simplify-proportion 0.3 -p CACODE -p ca_polygon.geo.json
topojson -o dc_polygon.topo.json --simplify-proportion 0.3 -p DCCODE dc_polygon.geo.json

# For the new land only objects
topojson -o ca_polygon.topo.json --simplify-proportion 0.08 -p CODE -p DC_CODE -p CA ca_polygon.geo.json
topojson -o dc_polygon.topo.json --simplify-proportion 0.08 -p CODE -p DC_CODE -p CA dc_polygon.geo.json
