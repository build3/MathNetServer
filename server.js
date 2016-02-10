"use strict";
//server.js
var port     = 8888;
var server_sockets = require('./server_sockets');
var http = require('http');
var server = http.createServer().listen(port);
console.log('The magic happens on port ' + port);

server_sockets(server, "");
