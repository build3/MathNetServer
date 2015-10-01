//server.js
var express = require('express');
var app  = express();
var port     = 8888;
var path = require('path');
var server_sockets = require('./server_sockets');

// Sets the public directory as location of html files for routing
app.set('views', __dirname + '/public');

// Sets engine to render html files using handlebars
app.set('view engine', 'html');
app.engine('html', require('hbs').__express);

// Sets static file location to public directory
app.use(express.static(path.join(__dirname, '/public')));

require('./routes/index.js')(app); // load our routes

var server = app.listen(port);
console.log('The magic happens on port ' + port);

server_sockets(server, "");
