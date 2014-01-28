#!/bin/bash

echo usual build
grunt build

echo clean bower_components, so that 'dist/*' is ready for gh-pages
rm -rf dist/bower_components

echo dimple does not provide bower compatible bower.json
fn="bower_components/dimple/dist/dimple.v1.1.3.js"
mkdir -p dist/`dirname $fn`
cp app/$fn dist/$fn

