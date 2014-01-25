#!/bin/bash

echo "This script is dangerous."
echo "If you are sure to run it, press [enter], or ctrl+C"

read

set -xe

rm -f cmd.sh
touch cmd.sh

for fn in `find data-clean/ -name '*.json' | cut -c12- | sed 's/.json$//g' | grep sheet2 | head -n300`
#for fn in `find data-clean/ -name '*.json' | cut -c12- | sed 's/.json$//g'`
do
	#xargs -P 30 -i curl --data @data-clean/{}.json http://localhost:8080/upload/{}/
	echo $fn
	echo curl --data @data-clean/$fn.json http://localhost:8080/upload/$fn/ >> cmd.sh
done 

time cat cmd.sh | xargs -i -P 30 sh -c '{}'
