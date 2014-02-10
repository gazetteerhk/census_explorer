#!/bin/bash

set -xe

if [[ $# == 1 ]] ; then
	root="$1"
else
	echo "usage: $0 {root}"
	exit 255
fi

find $root -name 'index.html' | xargs rm -f 

