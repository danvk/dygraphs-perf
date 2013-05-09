#!/bin/bash
set -o errexit

this_dir=$(pwd)
dygraph_dir=$(pwd)/../github/dygraphs

for commit in $(cat commits.txt); do
  cd $dygraph_dir
  git reset --hard $commit
  cd $this_dir

  ./perf.sh
done
