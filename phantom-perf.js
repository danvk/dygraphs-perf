// dygraphs command-line performance benchmark.
//
// Invoke as:
//
//   phantomjs phantom-perf.js 1000 100 5
//
// If the test succeeds, it will print out something like:
//
//   1000/100/5: 1336, 1309.4+/-43.4 ms (1284, 1245, 1336, 1346, 1336)
//
// This is median, mean +/- standard deviation, followed by a list of the individual
// times for each repetition, in milliseconds.

var system = require('system'),
    fs = require('fs');

var tmpfile = "tmp-dygraph-test-params.js";
var url = 'dygraph-many-points-benchmark.html';

function fail(msg){
  console.warn(msg);
  phantom.exit(1);
}

function assert(condition, msg){
  if (condition) return;
  fail(msg);
}

var config_file_template =
    "document.getElementById('points').value = (points);\n" +
    "document.getElementById('series').value = (series);\n" +
    "document.getElementById('(dataFormat)').selected = true;\n";
    "document.getElementById('repetitions').value = (repetitions);\n";
	    "document.getElementById('rollPeriod').value = (rollPeriod);\n";

var RunBenchmark = function(points, series, dataFormat, rollPeriod, repetitions, done_callback) {
  var page = require('webpage').create();

  // page.evalute() is seriously locked down.
  // This was the only way I could find to pass the parameters to the page.
  fs.write(tmpfile,
      config_file_template
        .replace("(points)", points)
        .replace("(series)", series)
        .replace("(dataFormat)", dataFormat)
        .replace("(rollPeriod)", rollPeriod)
        .replace("(repetitions)", repetitions),
      "w");

  page.open(url, function(status) {
    if (status !== 'success') {
      console.warn('Page status: ' + status);
      console.log(page);
      phantom.exit();
    }

    assert(page.injectJs(tmpfile), "Unable to inject JS.");
    fs.remove(tmpfile);

    var start = new Date().getTime();
    var rep_times = page.evaluate(function() {
      try {
        var rep_times = updatePlot();
        return rep_times;
      } catch(e) {
        return null;
      }
    });
    var end = new Date().getTime();
    var elapsed = (end - start) / 1000;
    done_callback(rep_times);
  });
};

function median(input) {
  var values = input.slice(0);
  values.sort();

  var half = Math.floor(values.length/2);

  if (values.length % 2) {
    return values[half];
  } else {
    return (values[half-1] + values[half]) / 2.0;
  }
}


var points, series, dataFormat, rollPeriod, repetitions;
if (5 != system.args.length) {
  console.warn('Usage: phantomjs phantom-driver.js (points) (series) (rollPeriod) (repititions)');
  phantom.exit();
}

points = parseInt(system.args[1]);
series = parseInt(system.args[2]);
dataFormat = system.args[3];
rollPeriod = parseInt(system.args[4]);
repetitions = parseInt(system.args[5]);
assert(points != null, "Couldn't parse " + system.args[1]);
assert(series != null, "Couldn't parse " + system.args[2]);
assert(dataFormat != null, "Couldn't parse " + system.args[3]);
assert(rollPeriod != null, "Couldn't parse " + system.args[4]);
assert(repetitions != null, "Couldn't parse " + system.args[5]);


RunBenchmark(points, series, dataFormat, rollPeriod, repetitions, function(rep_times) {
  if (!rep_times) {
    console.log('ERROR');
    phantom.exit();
  }

  var mean = 0.0, std = 0.0;
  rep_times.forEach(function(x) { mean += x; } );
  mean /= rep_times.length;
  rep_times.forEach(function(x) { std += Math.pow(x - mean, 2); });
  std = Math.sqrt(std / (rep_times.length - 1));

  console.log(points + '/' + series +'/' + rollPeriod + '/' + repetitions + ': ' +
      median(rep_times) + ', ' +
      mean.toFixed(1) + '+/-' + std.toFixed(1) + ' ms (' +
      rep_times.join(', ') + ')');
  phantom.exit();
});
