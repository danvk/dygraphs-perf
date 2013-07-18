#!/bin/bash
set -o errexit

this_dir=$(pwd)
dygraph_dir=$(pwd)/../dygraphs

for commit in $(cat commits.txt); do
  cd $dygraph_dir
  git reset --hard $commit
  cd $this_dir

  ./size.sh
done
