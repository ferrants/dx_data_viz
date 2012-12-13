var http = require('http');
    fileSystem = require('fs'),
    path = require('path'),
    util = require('util');

http.createServer(function (req, response) {
  fileSystem.readdir('data', function(err, files){
    console.log(files);
    if (req.url == '/list'){
      console.log('Checking Filesystem');
      response.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin' : '*'
      });
      response.end(JSON.stringify(files));
    }else if (files.indexOf(req.url.replace('/','')) != -1){
      var filePath = path.join(__dirname, 'data' + req.url);
      var stat = fileSystem.statSync(filePath);

      response.writeHead(200, {
        'Content-Type': 'text/csv',
        'Access-Control-Allow-Origin' : '*',
        'Content-Length': stat.size
      });

      var readStream = fileSystem.createReadStream(filePath);
      util.pump(readStream, response);
    }else{
      console.log("Unable to find " + req.url.replace('/',''));
      response.writeHead(404, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin' : '*'
      });
      response.end(JSON.stringify({'error': "Not Found"}));
    }
    
  });

}).listen(8082);




