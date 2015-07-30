//server.js
var express = require('express');
var app  = express();
var port     = 8888;
var path = require('path');



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

var head = require('./public/header');

io.on('connection', function(socket){
    socket.on('login', function(data){
        if (Object.keys(head.ds).indexOf(data.class_id) >= 0){
            if(!(data.username in Object.keys(head.ds[data.class_id]["user"]))){
                head.ds[data.class_id]["user"][data.username] = {};
                head.ds[data.class_id]["user"][data.username]["x"] = 0.0;
                head.ds[data.class_id]["user"][data.username]["y"] = 0.0;
                var response = {
                    logged_in : true,
                    username : data.username,
                    class_id : data.class_id
                }
                
                //redirect to main groups page
            } else {
                var response = {
                    logged_in : false,
                    error_message : 'Username already taken.'
                }
            }
            //the username is not unique!
        } else {
            var response = {
                logged_in : false,
                error_message : 'Class ID does not exist'
            }
        }
        //the class does not exist
        socket.emit('login_response', response);
    });
    socket.on('logout', function(data){

        var response = {
            logged_in : false
        }

        socket.emit('logout_response', response);
    });
});
