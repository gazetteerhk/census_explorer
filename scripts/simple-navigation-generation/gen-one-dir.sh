#!/bin/bash

path=$1
ls -1 $path | grep -v 'index.html' | xargs -i echo "<a href={}>{}</a><br>" > $path/index.html
echo "done: $path"
