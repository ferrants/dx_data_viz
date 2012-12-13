var http = require('http');
    fileSystem = require('fs'),
    path = require('path'),
    util = require('util');

http.createServer(function (req, response) {

  if (req.url == '/list'){
    fileSystem.readdir('data', function(errp, files){
      console.log('Checking Filesystem');
      console.log(files);
      response.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin' : '*'
      });
      response.end(JSON.stringify(files));
    });
  }else{
    var filePath = path.join(__dirname, 'data' + req.url);
    var stat = fileSystem.statSync(filePath);

    response.writeHead(200, {
      'Content-Type': 'text/csv',
      'Access-Control-Allow-Origin' : '*',
      'Content-Length': stat.size
    });

    var readStream = fileSystem.createReadStream(filePath);
    util.pump(readStream, response);
  }

}).listen(9615);




