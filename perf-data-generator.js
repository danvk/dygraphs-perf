
var DataGenerator = {};

DataGenerator.generateData = function(numPoints, numSeries, dataType, dataFormat){
  var data = [];
  var xmin = 0.0;
  var xmax = 2.0 * Math.PI;
  var delta = (xmax - xmin) / (numPoints - 1);
  var adj = .5;
  var y, val;
  for (var i = 0; i< numPoints; i++){
    var x = xmin + delta * i;
    var sample = [x];
    for (var j = 0; j< numSeries; j++) {
      if (dataType == "rand") {
        val = Math.pow(Math.random() - Math.random(), 7);
      } else {
        val = Math.sin(x + (j * adj));
      }
      switch(dataFormat){
      case "line":
        y = val;
        break;
      case "errorBar":
        y = [val,adj];
        break;
      case "customBar":
        y = [val-adj, val, val+adj];
        break;
      case "fractions":
        y = [val / 100, 100];
        break;
      default:
          throw("Invalid data format specified "+dataFormat);
      }
      sample.push(y);
    }
    data.push(sample);
  }
};