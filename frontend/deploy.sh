#!/usr/bin/env bash
# A general gh-pages deploy script
# Adapted from:
# https://github.com/hupili/5carts/blob/master/deploy.sh

dir_input="dist"
dir_output="dist_to_gh_pages"
remote_url=`git config --get remote.origin.url`
cur_time=`date`

rm -rf $dir_output
mkdir -p $dir_output
cp -r $dir_input/* $dir_output

cd $dir_output

git init .
git checkout --orphan gh-pages
git remote add deploy $remote_url
git add .
git add -u .
git commit -m "Update Site: $cur_time"
git push deploy gh-pages --force

cd -

