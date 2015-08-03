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
            if(!(Object.keys(head.ds[data.class_id]["user"]).indexOf(data.username) >= 0 )){
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
    }); //authenticates class ID and makes sure there is not another user with the same name. 
        //adds in user info to datastructure if unique. else displays an error message

    socket.on('logout', function(data){

        var response = {
            logged_in : false
        }
        socket.emit('logout_response', response);
    }); //returns logged_in false

    socket.on('groups_get', function(data){
        var groups = [];
        if(data.logged_in){
            for (var i in head.ds[data.class_id]){
                if (i != "user" && i != "class_name"){
                    groups.push({
                        grp_name : i,
                        num : head.ds[data.class_id][i]["students"].length
                    });
                }
            }
        }
        var response = {
            logged_in : data.logged_in,
            username : data.username,
            class_id : data.class_id,
            groups : groups
        }
        socket.emit('groups_get_response', response);
    }); //populates groups array with groups with the given class id and returns it to client.
    socket.on('group_join', function(data){

        head.ds[data.class_id][data.group_id]["students"].push(data.username);

        var response = {
            logged_in : data.logged_in,
            username : data.username,
            class_id : data.class_id,
            group_id : data.group_id
        }
        socket.emit('group_join_response', response);
    }); //adds user to the students array of given group
    socket.on('group_leave', function(data){
        var index = head.ds[data.class_id][data.group_id]["students"].indexOf(data.username);
        if(index > -1)
            head.ds[data.class_id][data.group_id]["students"].splice(index, 1);
        head.ds[data.class_id]["user"][data.username]["x"] = 0.0;
        head.ds[data.class_id]["user"][data.username]["y"] = 0.0;
        var response = {
            logged_in : data.logged_in,
            username : data.username,
            class_id : data.class_id,
            group_id : data.group_id
        }
        socket.leave(data.class_id + data.group_id);
        socket.emit('group_leave_response', response);
    }); //resets user coordinates and removes them from the students array in current group, leaves your socket group
    socket.on('group_info', function(data){
        socket.join(data.class_id + data.group_id);
        var other_members = [];
        if(data.logged_in){
            for (var i in head.ds[data.class_id][data.group_id]["students"]){
                var student_name = head.ds[data.class_id][data.group_id]["students"][i];
                other_members.push({
                    member_name : student_name,
                    member_x : head.ds[data.class_id]["user"][student_name]["x"], 
                    member_y : head.ds[data.class_id]["user"][student_name]["y"]
                });
            }
        }
        var response = {
            logged_in : data.logged_in,
            username : data.username,
            class_id : data.class_id,
            group_id : data.group_id,
            other_members : other_members,
            group_leave : data.group_leave
        }
        console.log(other_members);
        if(data.group_leave)
            socket.broadcast.to(data.class_id + data.group_id).emit('groups_info_response', response);
        else
            io.sockets.to(data.class_id + data.group_id).emit('groups_info_response', response);
    }); //populates array other_members with the other students and their coordinates in the given group, 
        //emits different response if user is leaving or joining.
    socket.on('coordinate_change', function(data){
        head.ds[data.class_id]["user"][data.username]["x"] += data.x_coord;
        head.ds[data.class_id]["user"][data.username]["y"] += data.y_coord;

        var response = {
            logged_in : data.logged_in,
            username : data.username,
            class_id : data.class_id,
            group_id : data.group_id,
            x_coord : head.ds[data.class_id]["user"][data.username]["x"],
            y_coord : head.ds[data.class_id]["user"][data.username]["y"]
        }
        io.sockets.to(data.class_id + data.group_id).emit('coordinate_change_response', response);

    }); //registers the change of coordinates in the datastructure and passes them back to group
});

