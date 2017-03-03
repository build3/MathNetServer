"use strict";
//server.js
var port     = 8889;
var server_sockets = require('./server_sockets');
var http = require('http');
var server = http.createServer(
function (req, res) {
  setTimeout(function() {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Hello World\n');
  }, 200);
}
	).listen(port);
server.timeout = 0;
server.setTimeout(600000);
console.log(server.timeout);
console.log('The magic happens on port ' + port);

server_sockets(server, "");
