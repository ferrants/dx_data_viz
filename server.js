var http = require('http');
    fileSystem = require('fs'),
    path = require('path'),
    util = require('util');

http.createServer(function (req, response) {
  var filePath = path.join(__dirname, 'data/viewability_dxmetrics.2012-11-01_2012-11-02.csv');
  var stat = fileSystem.statSync(filePath);

  response.writeHead(200, {
    'Content-Type': 'text/csv',
    'Access-Control-Allow-Origin' : '*',
    'Content-Length': stat.size
  });

  var readStream = fileSystem.createReadStream(filePath);
  util.pump(readStream, response);

}).listen(9615);




