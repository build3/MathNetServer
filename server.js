//server.js
var express = require('express');
var app  = express();
var port     = 8888;
var path = require('path');
var server_sockets = require('./public/js/server_sockets');


//var passport = require('passport');
//var session = require('express-session');

//require('./passport')(passport); 

//var bodyParser = require('body-parser'); // for reading POSTed form data into `req.body`
//var cookieParser = require('cookie-parser'); 

//app.use(cookieParser()); // read cookies (needed for auth)
//app.use(bodyParser()); // get information from html forms

//app.use(session({ secret: 'vidyapathaisalwaysrunning' } )); // session secret
//app.use(passport.initialize());
//app.use(passport.session()); // persistent login sessions

// Sets the public directory as location of html files for routing
app.set('views', __dirname + '/public');

// Sets engine to render html files using handlebars
app.set('view engine', 'html');
app.engine('html', require('hbs').__express);

// Sets static file location to public directory
app.use(express.static(path.join(__dirname, '/public')));
app.use(express.static(path.join(__dirname, '/node_modules')));

var server = require('http').Server(app);
var io = require('socket.io')(server); 

require('./routes/index.js')(app); // load our routes
//require('./routes/public.js')(app);

server.listen(port);
console.log('The magic happens on port ' + port);

//this will contain the server side socket commnication

server_sockets(server, "");
