var classes = require('./public/available_classes');
var socketio = require('socket.io');
var database = require('./database_actions');
module.exports = server_sockets;

function server_sockets(server, client){

    var io = socketio.listen(server);
    io.on('connection', function(socket) {

        socket.on('login', function(data){
            if (Object.keys(classes.available_classes).indexOf(data.class_id) >= 0){
                if (! (Object.keys(classes.available_classes[data.class_id]["user"]).indexOf(data.username) >= 0 )){
                    classes.available_classes[data.class_id]["user"][data.username] = {};
                    classes.available_classes[data.class_id]["user"][data.username]["x"] = 0.0;
                    classes.available_classes[data.class_id]["user"][data.username]["y"] = 0.0;
                    var response = {
                        logged_in : true,
                        username : data.username,
                        class_id : data.class_id
                    }//redirect to main groups page
                } else {
                    var response = {
                        logged_in : false,
                        error_message : 'Username "' + data.username +'" already taken.'
                    }
                } //the username is not unique!
            } else {
                var response = {
                    logged_in : false,
                    error_message : 'Class ID "'+ data.class_id +'" does not exist'
                }
            }//the class does not exist
            socket.emit('login_response', response);
        }); //authenticates class ID and makes sure there is not another user with the same name. 
            //adds in user info to datastructure if unique. else displays an error message

        socket.on('logout', function(data){
            socket.leave(data.class_id + "x");
            var index = Object.keys(classes.available_classes[data.class_id]["user"]).indexOf(data.username);
            if (index > -1)
                delete classes.available_classes[data.class_id]["user"][data.username]; 
            var response = {
                logged_in : false
            }
            socket.emit('logout_response', response);
        }); //returns logged_in false

        socket.on('groups_get', function(data){
            socket.join(data.class_id + "x");
            var groups = [];
            if (data.logged_in){
                for (var i in classes.available_classes[data.class_id]){
                    if (i != "user" && i != "class_name"){
                        groups.push({
                            grp_name : i,
                            num : classes.available_classes[data.class_id][i]["students"].length
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
            io.sockets.to(data.class_id + "x").emit('groups_get_response', response);
        }); //populates groups array with groups with the given class id and returns it to client.

        socket.on('group_join', function(data){

            classes.available_classes[data.class_id][data.group_id]["students"].push(data.username);

            var response = {
                logged_in : data.logged_in,
                username : data.username,
                class_id : data.class_id,
                group_id : data.group_id
            }
            socket.emit('group_join_response', response);
        }); //adds user to the students array of given group

        socket.on('group_leave', function(data){
            var index = classes.available_classes[data.class_id][data.group_id]["students"].indexOf(data.username);
            if (index > -1)
                classes.available_classes[data.class_id][data.group_id]["students"].splice(index, 1);
            classes.available_classes[data.class_id]["user"][data.username]["x"] = 0.0;
            classes.available_classes[data.class_id]["user"][data.username]["y"] = 0.0;
            var response = {
                logged_in : data.logged_in,
                username : data.username,
                class_id : data.class_id,
                group_id : data.group_id
            }
            socket.leave(data.class_id + "x" +data.group_id);

            socket.emit('group_leave_response', response);
        }); //resets user coordinates and removes them from the students array in current group, leaves your socket group

        socket.on('group_info', function(data){
            socket.join(data.class_id + "x");
            socket.join(data.class_id + "x" +data.group_id);
            var other_members = [];
            if (data.logged_in){
                for (var i in classes.available_classes[data.class_id][data.group_id]["students"]){
                    var student_name = classes.available_classes[data.class_id][data.group_id]["students"][i];
                    other_members.push({
                        member_name : student_name,
                        member_x : classes.available_classes[data.class_id]["user"][student_name]["x"], 
                        member_y : classes.available_classes[data.class_id]["user"][student_name]["y"]
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

            var list_response = {
                logged_in : data.logged_in,
                class_id : data.class_id,
                group_id : data.group_id,
                number : other_members.length
            }

            io.sockets.to(data.class_id + "x").emit('groups_change_response', list_response);

            if (data.group_leave){
                socket.broadcast.to(data.class_id + "x" + data.group_id).emit('groups_info_response', response);
            } else {
                io.sockets.to(data.class_id + "x" + data.group_id).emit('groups_info_response', response);
            }
        }); //populates array other_members with the other students and their coordinates in the given group, 
            //emits different response if user is leaving or joining. updates number of members in the group in class.html

        socket.on('coordinate_change', function(data){
            classes.available_classes[data.class_id]["user"][data.username]["x"] += data.x_coord;
            classes.available_classes[data.class_id]["user"][data.username]["y"] += data.y_coord;

            var response = {
                logged_in : data.logged_in,
                username : data.username,
                class_id : data.class_id,
                group_id : data.group_id,
                x_coord : classes.available_classes[data.class_id]["user"][data.username]["x"],
                y_coord : classes.available_classes[data.class_id]["user"][data.username]["y"]
            }
            io.sockets.to(data.class_id + "x" + data.group_id).emit('coordinate_change_response', response);

        }); //registers the change of coordinates in the datastructure and passes them back to group
        
        // This function will notify the client when an error has occurred 
        // due to a client socket emission
        function server_error(error, message) {
            console.log(error);
            socket.emit('server-error', {message: message});
        };

        // This is the handler for the add-class client socket emission
        // It calls a database function to create a class and groups
        socket.on('add-class', function(class_name, group_count, secret) {
            if (secret == "ucd_247") {
                database.create_class(class_name, group_count, function(class_id) {
                    console.log(class_id);
                    classes.available_classes[class_id] = {}
                    for(var i=0; i<group_count; i++) {
                        classes.available_classes[class_id][i+1] = {students:[], deleted:false};
                    }
                    classes.available_classes[class_id]['user'] = {}
                    classes.available_classes[class_id]['class_name'] = class_name;
                    socket.emit('add-class-response', {class_id: class_id});
                });

            }
        });

        // This is the handler for the add-group client socket emission
        // It calls a database function to create a group for a class
        socket.on('add-group', function(class_name, secret) {
            if (secret == "ucd_247") {
                database.create_group(class_name, function(class_id, group_id) {
                    classes.available_classes[class_id][group_id] = {students:[], deleted:false};
                    socket.emit('add-group-response', {});
                });
            }
        }); 

        // This is the handler for the delete-group client socket emission
        // It calls a database function to delete a group for a class
        socket.on('delete-group', function(class_id, group_id, secret) {
            if (secret == "ucd_247") {
                database.delete_group(class_id, group_id, function() {
                    socket.emit('delete-group-response', {});
           //         io.to(class_id + "x" + group_id)
           //             .emit('group_leave_response', 
           //                   {
           //                       logged_in: true,
           //                       username: "",
           //                       class_id: class_id,
           //                       group_id: group_id});

                    delete classes.available_classes[class_id][group_id];
                });
            }
        });

        // This is the handler for the leave-class client socket emission
        socket.on('leave-class', function(class_id, secret) {
            if (secret == "ucd_247") {
                delete classes.available_classes[class_id];
                socket.emit('leave-class-response', {});
                io.to(class_id + "x").emit('logout_response', {logged_in: false});
            }
        });

    });
}

