#!/bin/bash
#
# Prints out performance numbers for whatever commit dygraphs is currently on.

set -o errexit

this_dir=$(pwd)
dygraph_dir=$(pwd)/../dygraphs

cd $dygraph_dir
./generate-combined.sh

cd $this_dir
phantomjs phantom-perf.js 1000 100 1 10

cd $dygraph_dir
git co dygraph-combined.js

cd $this_dir
