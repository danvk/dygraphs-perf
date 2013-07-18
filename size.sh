#!/bin/bash
#
# Prints out file size numbers for whatever commit dygraphs is currently on.
#
# The easiest way to do this is "./generate-combined.sh cat | wc -c", but this
# only works in newer versions of dygraphs. This approach always works.

set -o errexit

this_dir=$(pwd)
dygraph_dir=$(pwd)/../dygraphs

cd $dygraph_dir
./generate-combined.sh

wc -c dygraph-combined.js

git co dygraph-combined.js

cd $this_dir
