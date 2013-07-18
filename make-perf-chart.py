#!/usr/bin/python
"""
Pulls in performance testing data for a list of commits and outputs a nice web view.

Usage:
  git log --first-parent --pretty=format:"%h|%an|%ad|%s" --date=short | ../dygraphs-perf/make-perf-chart.py ../dygraphs-perf/perf-by-commit.txt

"""

import fileinput
import sys
import re
import json

perf_by_commit_file = sys.argv[1]
del sys.argv[1]

commit_to_perf = {}
last_commit = None
for line in file(perf_by_commit_file):
  m = re.match(r'^HEAD is now at ([^ ]+) ', line)
    
  if m:
    last_commit = m.group(1)
    continue

  if line == 'ERROR\n':
    last_commit = None
    continue

  assert last_commit
  m = re.match(r'^([0-9/]+): ([0-9.]+), ([0-9.]+)\+/-([0-9.]+) ms \(([^)]*)\)', line)

  if m:
    params, median, mean, std, samples = m.groups()
    median = float(median)
    mean = float(mean)
    std = float(std)
    samples = [int(x) for x in samples.split(', ')]

  else:
    # for file size analysis
    m = re.match(r'^ *([0-9]+) dygraph-combined.js', line)
    assert m, line

    size, = m.groups()
    median = float(size)
    std = 0.0

  if median != 0:
    # zeroes are always due to errors
    commit_to_perf[last_commit] = (median, std)
  last_commit = None

sys.stderr.write('Loaded data on %d commits\n' % len(commit_to_perf))

# Lines look like:
# c3fa4a7 Add a command-line performance test
history = []  # (mean, std, commit, desc) tuples
for line in fileinput.input():
  commit, author, date, desc = line.strip().split('|')

  if commit in commit_to_perf:
    mean, std = commit_to_perf[commit]
    history.append( (mean, std, commit, desc, date, author) )

  else:
    sys.stderr.write('Could not match %s\n' % commit)

sys.stderr.write('Outputting data on %d commits\n' % len(history))

history.reverse()

print "var data = %s;" % json.dumps(history)
