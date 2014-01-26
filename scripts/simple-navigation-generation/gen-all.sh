#!/bin/bash

set -xe

rm -f cmd.sh
touch cmd.sh

root="../data-clean"
echo ./gen-one-dir.sh $root >> cmd.sh

for area in `ls -1 $root | grep -v 'index.html'`
do
	echo ./gen-one-dir.sh $root/$area >> cmd.sh
	for sheet in `ls -1 $root/$area | grep -v 'index.html'`
	do
		echo ./gen-one-dir.sh $root/$area/$sheet >> cmd.sh
	done
done

xargs -P20 -a cmd.sh -i sh -c '{}'
