#!/bin/bash

set -xe

if [[ $# == 1 ]] ; then
	root="$1"
else
	echo "usage: $0 {root}"
	exit 255
fi

rm -f cmd.sh
touch cmd.sh

for dir in `find $root -type d`
do
	echo ./gen-one-dir.sh $dir >> cmd.sh
done

xargs -P20 -a cmd.sh -i sh -c '{}'
