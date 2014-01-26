#!/bin/bash

echo "This script is dangerous."
echo "If you are sure to run it, press [enter], or ctrl+C"

read

set -xe

rm -f cmd.sh
touch cmd.sh

PREFIX=http://localhost:8080
#PREFIX="http://golden-shine-471.appspot.com"

#for fn in `cat list.failed | sed 's/.json$//g'`
for fn in `cat list.failed | sed 's/.json$//g' | head -n1`
#for fn in `find data-clean/ -name '*.json' | cut -c12- | sed 's/.json$//g' | grep sheet2`
#for fn in `find data-clean/ -name '*.json' | cut -c12- | sed 's/.json$//g' | grep sheet2 | head -n300`
#for fn in `find data-clean/ -name '*.json' | cut -c12- | sed 's/.json$//g'`
do
	#xargs -P 30 -i curl --data @data-clean/{}.json upload/{}/
	echo $fn
	echo "curl -XPOST -H 'Content-Type:application/json' --data @data-clean/$fn.json $PREFIX/upload/$fn/" >> cmd.sh
done 

time cat cmd.sh | xargs -i -P 30 bash -c '{}'
