var classes = require('./public/available_classes');
var socketio = require('socket.io');
var database = require('./database_actions');
module.exports = server_sockets;

function add_user_to_class(username, class_id) {
    if (class_id in classes.available_classes) {
        if (!(username in classes.available_classes[class_id]["user"])) {
            classes.available_classes[class_id]["user"][username] = {};
            classes.available_classes[class_id]["user"][username]["x"] = 0.0;
            classes.available_classes[class_id]["user"][username]["y"] = 0.0; 
        }
    }
}

function remove_user_from_class(username, class_id) {
    if (username in classes.available_classes[class_id]["user"]) {
        delete classes.available_classes[class_id]["user"][username]; 
    }
}

function get_all_groups_from_class(class_id) {
    var groups = [];
    for (var i in classes.available_classes[class_id]){
        if (i != "user" && i != "class_name"){
            groups.push({
                grp_name : i,
                num : classes.available_classes[class_id][i]["students"].length
            });
        }
    }
    return groups;
}

function add_user_to_group(username, class_id, group_id) {
    classes.available_classes[class_id][group_id]["students"].push(username);
}

function remove_user_from_group(username, class_id, group_id) {
    var index = classes.available_classes[class_id][group_id]["students"].indexOf(username);
    if (index > -1)
        classes.available_classes[class_id][group_id]["students"].splice(index, 1);
    classes.available_classes[class_id]["user"][username]["x"] = 0.0;
    classes.available_classes[class_id]["user"][username]["y"] = 0.0;
}

function get_info_of_group(class_id, group_id) {
    var other_members = [];
    for (var i in classes.available_classes[class_id][group_id]["students"]){
        var student_name = classes.available_classes[class_id][group_id]["students"][i];
        other_members.push({
            member_name : student_name,
            member_x : classes.available_classes[class_id]["user"][student_name]["x"], 
            member_y : classes.available_classes[class_id]["user"][student_name]["y"]
        });
    }
    return other_members;
}

function update_users_coordinates(username, class_id, x, y) {
    classes.available_classes[class_id]["user"][username]["x"] += x;
    classes.available_classes[class_id]["user"][username]["y"] += y;

    var data = {
        x : classes.available_classes[class_id]["user"][username]["x"], 
        y : classes.available_classes[class_id]["user"][username]["y"] 
    }
    return data;
}

function server_sockets(server, client){

    var io = socketio.listen(server);
    io.on('connection', function(socket) {

        socket.on('login', function(username, class_id){
            add_user_to_class(username, class_id);
            var response = {
                username : username,
                class_id : class_id 
            }
            socket.emit('login_response', response);
        }); //authenticates class ID and makes sure there is not another user with the same name. 
            //adds in user info to datastructure if unique. else displays an error message

        socket.on('logout', function(username, class_id){
            socket.leave(class_id + "x");
            remove_user_from_class(username, class_id); 
            var response = {
                username : username,
                class_id : class_id
            }
            socket.emit('logout_response', {});
        }); 

        socket.on('groups_get', function(username, class_id){
            socket.join(class_id + "x");
            var groups = get_all_groups_from_class(class_id);
            var response = {
                username : username,
                class_id : class_id,
                groups : groups
            }
            io.sockets.to(class_id + "x").emit('groups_get_response', response);
        }); //populates groups array with groups with the given class id and returns it to client.

        socket.on('group_join', function(username, class_id, group_id){
            add_user_to_group(username, class_id, group_id);
            var groups = get_all_groups_from_class(class_id);
            var response = {
                username : username,
                class_id : class_id,
                group_id : group_id,
                groups : groups
            }
            socket.emit('group_join_response', response);
            io.sockets.to(class_id + "x").emit('groups_get_response', response);
        }); //adds user to the students array of given group

        socket.on('group_leave', function(username, class_id, group_id){
            socket.leave(class_id + "x" + group_id);
            remove_user_from_group(username, class_id, group_id);
            var other_members = get_info_of_group(class_id, group_id);
            var response = {
                username : username,
                class_id : class_id,
                group_id : group_id,
                other_members : other_members
            }
            socket.emit('group_leave_response', response);
            io.sockets.to(class_id + "x" + group_id).emit('group_info_response', response);
        }); //resets user coordinates and removes them from the students array in current group, leaves your socket group

        socket.on('group_info', function(username, class_id, group_id){
            socket.join(class_id + "x");
            socket.join(class_id + "x" + group_id);
            var other_members = get_info_of_group(class_id, group_id);
            var response = {
                username : username,
                class_id : class_id,
                group_id : group_id,
                other_members : other_members,
            }
            io.sockets.to(class_id + "x" + group_id).emit('group_info_response', response);
        }); //populates array other_members with the other students and their coordinates in the given group, 
            //emits different response if user is leaving or joining. updates number of members in the group in class.html

        socket.on('coordinate_change', function(username, class_id, group_id, x, y){
            var data = update_users_coordinates(username, class_id, x, y);
            var response = {
                username : username,
                class_id : class_id,
                group_id : group_id,
                x : data.x,
                y : data.y
            }
            io.sockets.to(class_id + "x" + group_id).emit('coordinate_change_response', response);

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
                    var groups = get_all_groups_from_class(class_id);
                    var response = {
                        username : "Admin",
                        class_id : class_id,
                        groups : groups
                    }
                    socket.emit('add-group-response', {});
                    io.sockets.to(class_id + "x").emit('groups_get_response', response);
                });
            }
        }); 

        // This is the handler for the delete-group client socket emission
        // It calls a database function to delete a group for a class
        socket.on('delete-group', function(class_id, group_id, secret) {
            if (secret == "ucd_247") {
                database.delete_group(class_id, group_id, function() {
                    delete classes.available_classes[class_id][group_id];
                    var groups = get_all_groups_from_class(class_id);
                    var response = {
                        username : "Admin",
                        class_id : class_id,
                        group_id : group_id,
                        groups : groups
                    }
                    socket.emit('delete-group-response', {});
                    io.sockets.to(class_id + "x" + group_id).emit('group_leave_response', response);
                    io.sockets.to(class_id + "x").emit('groups_get_response', response);
                });
            }
        });

        // This is the handler for the leave-class client socket emission
        socket.on('leave-class', function(class_id, secret) {
            if (secret == "ucd_247") {
                delete classes.available_classes[class_id];
                socket.emit('leave-class-response', {});
                io.to(class_id + "x").emit('logout_response', {});
            }
        });

    });
}

