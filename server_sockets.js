"use strict";
var classes = require('./available_classes');
var socketio = require('socket.io');
var database = require('./database_actions');
var hash = require('./hashes');
var pw = require('secure-password');

// Q allows use of promises. 
// First, a promise is deferred.
// Then it is either rejected with an error message or  resolved with any that 
// needs to be returned.
var Q = require("q");

var logger = require('./logger_create');  
module.exports = server_sockets;

// Takes a class id and username.
// If invalid, returns an error.
// If valid, a new user entry is created for the class in the global 
// datastructure.
function add_user_to_class(username, class_id,socket_id) {
    var deferred = Q.defer();
    
    if (username === "") {
        deferred.reject('Invalid username.');
        return deferred.promise;
    }

    if (class_id in classes.available_classes) {
        if (!(username in classes.available_classes[class_id]["user"])) {
            classes.available_classes[class_id]["user"][username] = {};
            classes.available_classes[class_id]["user"][username]["info"] = "";
            classes.available_classes[class_id]["user"][username]["socket_id"] = socket_id;
            deferred.resolve();
        }
        else {
            deferred.reject('Username ' + username + ' is already taken.');
        }
    }
    else {
        deferred.reject('Class ID ' + class_id + ' is invalid.');
    }

    return deferred.promise;
}

// Takes a class id and username.
// If invalid, returns an error.
// If valid, the given user is deleted from the class in the global 
// datastructure.
function remove_user_from_class(username, class_id) {
    var deferred = Q.defer();
    
    if (class_id in classes.available_classes) {
        if (username in classes.available_classes[class_id]["user"]) {
            delete classes.available_classes[class_id]["user"][username]; 
            deferred.resolve();
        }
        else {
            deferred.reject('Username ' + username + ' is invalid.');
        }
    }
    else {
        deferred.reject('Class ID ' + class_id + ' is invalid.');
    }

    return deferred.promise;
}

// Takes a class id.
// If invalid, returns an error.
// If valid, a JSON string of all groups and their contents in the class is 
// returned. The data is retrieved from the global datastructure.
function get_all_groups_from_class(class_id) {
    var deferred = Q.defer();
    if (class_id in classes.available_classes) {
        var groups = [];
        for (var i in classes.available_classes[class_id]){
            if (i != "user" && i != "class_name" && i != "settings"){
                groups.push({
                    grp_name : i,
                    num : classes.available_classes[class_id][i]["students"].length
                });
            }
        }

        deferred.resolve(groups);
    }
    else {
        deferred.reject('Class ID ' + class_id + ' is invalid.');
    }

    return deferred.promise;
}

// Takes a username, class id, and group id.
// If invalid, returns an error.
// If valid, a new user entry is created for the class group in the global 
// datastructure.
function add_user_to_group(username, class_id, group_id) {
    var deferred = Q.defer();

    if (class_id in classes.available_classes) {
        if (group_id in classes.available_classes[class_id]) {
            if (username in classes.available_classes[class_id]["user"]) {
                classes.available_classes[class_id][group_id]["students"].push(username);
                var info = {};
                var charges = [{name: username, x: 0, y: 0}];
                info.charges = charges;
                classes.available_classes[class_id]["user"][username]["info"] = JSON.stringify(info);

                deferred.resolve();
            }
            else {
                deferred.reject('Username ' + username + ' is invalid.');
            }
        }
        else {
            deferred.reject('Group ID ' + group_id + ' is invalid.');
        }
    }
    else {
        deferred.reject('Class ID ' + class_id + ' is invalid.');
    }

    return deferred.promise;
}

// Takes a username, class id, and group id.
// If invalid, returns an error.
// If valid, the given user is deleted from the class group in the global
// datastructure.
function remove_user_from_group(username, class_id, group_id) {
    var deferred = Q.defer();
    
    if (class_id in classes.available_classes) {
        if (group_id in classes.available_classes[class_id]) {
            if (username in classes.available_classes[class_id]["user"]) {
                var index = classes.available_classes[class_id][group_id]["students"].indexOf(username);

                if (index > -1) {
                    classes.available_classes[class_id][group_id]["students"].splice(index, 1);
                    classes.available_classes[class_id]["user"][username]["info"] = "{}";
                    deferred.resolve();
                }
                else {
                    deferred.reject('Username ' + username + ' is invalid.');
                }

            }
            else {
                deferred.reject('Username ' + username + ' is invalid.');
            }
        }
        else {
            deferred.reject('Group ID ' + group_id + ' is invalid.');
        }
    }
    else {
        deferred.reject('Class ID ' + class_id + ' is invalid.');
    }

    return deferred.promise;
}

// Takes a class id and group id
// If invalid, returns an error.
// If valid, a JSON string of all users and their contents in the class group
// is returned. The data is retrieved from the global datastructure.
function get_info_of_group(class_id, group_id) {
    var deferred = Q.defer();
    var other_members = [];
    
    if (class_id in classes.available_classes) {
        if (group_id in classes.available_classes[class_id]) {
            for (var i in classes.available_classes[class_id][group_id]["students"]) {
                var student_name = classes.available_classes[class_id][group_id]["students"][i];
                other_members.push({
                    member_name : student_name,
                    member_info : classes.available_classes[class_id]["user"][student_name]["info"],
                    group_id : group_id
                });
            }
            deferred.resolve(other_members);
        }
        else {
            deferred.reject('Group ID ' + group_id + ' is invalid.');
        }
    }
    else {
        deferred.reject('Class ID ' + class_id + ' is invalid.');
    }
    
    return deferred.promise;
}

// Takes a username, class id, and x,y coordinates movements.
// If invalid, returns an error.
// If valid, a JSON string of the given user's new updated coordinates is 
// returned. The data is updated in the global datastructure.
function update_users_coordinates(username, class_id, info) {
    var deferred = Q.defer();

    if (class_id in classes.available_classes) {
        if (username in classes.available_classes[class_id]["user"]) {

            if(info == null || info == ""){
                classes.available_classes[class_id]["user"][username]["info"] = "{}";
            } else {
                classes.available_classes[class_id]["user"][username]["info"] = JSON.stringify(info);
            }

            var data = {
                info : classes.available_classes[class_id]["user"][username]["info"] 
            }

            deferred.resolve(data);
        }
        else {
            deferred.reject('Username ' + username + ' is invalid.');
        }
    }
    else {
        deferred.reject('Class ID ' + class_id + ' is invalid.');
    }
    return deferred.promise;
}

//takes a username, class_id, group_id, and xml string
//if invalid, errors
//if valid stores xml string for group in user and group xml object
function update_user_xml(data) {
    var deferred = Q.defer();
    var rdata = {xml : '', toolbar : ''};
    if (data.class_id in classes.available_classes) {
        if (data.group_id in classes.available_classes[data.class_id]) {
            if (data.username in classes.available_classes[data.class_id]["user"] || data.username == "admin") {
               /* if(data.obj_xml != undefined){
                    var cur_xml_doc = $.parseXML(cur_xml);
                    data.obj_xml = data.obj_xml.replace(/&lt;/g,'<').replace(/&gt;/g, '>').replace(/\\"/g, '"').replace(/\\n/g, '').replace(/\\t/g, '');
                    data.obj_xml = data.obj_xml.substr(data.obj_xml.indexOf("<"), data.obj_xml.lastIndexOf(">"));
                    $(cur_xml_doc).find('construction')[0].appendChild($.parseXML(data.obj_xml).children[0]);

                    var final_xml = $(cur_xml_doc).find('geogebra')[0].outerHTML;
                }*/
                if(data.xml != ''){
                    classes.available_classes[data.class_id][data.group_id]["xml"] = JSON.stringify(data.xml);
                    rdata.xml = classes.available_classes[data.class_id][data.group_id]["xml"];
                }                
                if(data.toolbar_user && data.toolbar_user != ''){
                    if(data.toolbar_user == "admin"){
                        for (var i in classes.available_classes[data.class_id][data.group_id]["students"]){
                            var students = classes.available_classes[data.class_id][data.group_id]["students"];
                            if(data.properties && data.properties != 'null' && data.properties != 'undefined'){
                                classes.available_classes[data.class_id]["user"][students[i]]['properties'] = data.properties;
                            }
                            if(data.toolbar && data.toolbar != ''){
                                classes.available_classes[data.class_id]["user"][students[i]]["toolbar"] = data.toolbar;
                            }
                        }
                        rdata.properties = data.properties;
                        rdata.toolbar = data.toolbar;
                    } else {
                        if(data.properties && data.properties != 'null' && data.properties != 'undefined'){
                            classes.available_classes[data.class_id]["user"][data.toolbar_user]['properties'] = data.properties;
                            rdata.properties = classes.available_classes[data.class_id]["user"][data.toolbar_user]['properties'];
                        }
                        if(data.toolbar && data.toolbar != ''){
                            classes.available_classes[data.class_id]["user"][data.toolbar_user]["toolbar"] = data.toolbar;
                            rdata.toolbar = classes.available_classes[data.class_id]["user"][data.toolbar_user]["toolbar"];
                        }
                        rdata.user_socket = classes.available_classes[data.class_id]["user"][data.toolbar_user]["socket_id"];
                    }
                    rdata.toolbar_user = data.toolbar_user;
                }
                deferred.resolve(rdata);
            }
            else {
                deferred.reject('Username ' + data.username + ' is invalid.');
            }
        } 
        else {
            deferred.reject('Group ID ' + data.group_id + ' is invalid.');
        }
    }
    else {
        deferred.reject('update_user_xml: Class ID ' + data.class_id + ' is invalid.');
    }
    return deferred.promise;
}

//takes a username, class_id, and group_id
//if invalid, returns an error
//if valid, returns JSON of class data to user
//this is returned from the global datastructure
function get_user_xml(username, class_id, group_id) {
    var deferred = Q.defer();

    if (class_id in classes.available_classes) {
        if (group_id in classes.available_classes[class_id]) {
            if (username in classes.available_classes[class_id]["user"] || username == "admin") {
                var xml = classes.available_classes[class_id][group_id]["xml"];
                var toolbar = "";
                var properties = null;
                if(classes.available_classes[class_id]["user"][username] && classes.available_classes[class_id]["user"][username]["toolbar"]){
                    if(classes.available_classes[class_id]["user"][username]["properties"]){
                        var properties = classes.available_classes[class_id]["user"][username]["properties"];
                    }
                    var toolbar = classes.available_classes[class_id]["user"][username]["toolbar"];
                }
                var data = {
                    xml: xml,
                    toolbar: toolbar,
                    properties: properties
                }
                deferred.resolve(data);
            }
            else {
                deferred.reject('Username ' + username + ' is invalid.');
            }
        } 
        else {
            deferred.reject('Group ID ' + group_id + ' is invalid.');
        }
    }
    else {
        deferred.reject('Class ID ' + class_id + ' is invalid.');
    }
    return deferred.promise;
}

// Takes a class id
// If invalid, returns an error.
// If valid, a JSON string of the class settings is returned. The data is 
// retrieved from the global datastructure.
function get_settings(class_id, group_id) {
    var deferred = Q.defer();
    if (class_id in classes.available_classes) {
        if (group_id in classes.available_classes[class_id]) {
            var settings = classes.available_classes[class_id]['settings'];
            deferred.resolve(settings);
        }
        else {
            deferred.reject('Group ID ' + group_id + ' is invalid.');
        }
    }
    else {
        deferred.reject('Class ID ' + class_id + ' is invalid.');
    }

    return deferred.promise;
}

// Takes a class name and group count.
// If invalid, returns an error.
// If valid, create a class of the given class name in the database and return
// a hashed string of the created class id. A new class entry is also made in 
// the global datastructure.
function create_class(class_name, group_count, admin_id, group_colors){
    var deferred = Q.defer();

    database.create_class(class_name, group_count, admin_id, group_colors)
    .then(function(class_id) {
        return hash.add_hash(class_id);
    }).then(function(id_hash) {
        classes.available_classes[id_hash] = {};
        for(var i=0; i<group_count; i++) {
            classes.available_classes[id_hash][i+1] = {students:[], deleted:false};
        }
        classes.available_classes[id_hash]['user'] = {};
        classes.available_classes[id_hash]['settings'] = {};
        classes.available_classes[id_hash]['class_name'] = class_name;
        deferred.resolve(id_hash);
    })
    .fail(function(error) {
        deferred.reject(error);  
    });
   
    return deferred.promise;
}

// Takes a class id.
// If invalid, returns an error.
// If valid, retrieve class name and group count from global datastructure.
function join_class(class_id) {
    var deferred = Q.defer();

    if (class_id in classes.available_classes) {
        var group_count = Object.keys(classes.available_classes[class_id]).length - 3;
        var class_name = classes.available_classes[class_id]['class_name'];

        var data = {
            group_count: group_count,
            class_name: class_name
        }
        deferred.resolve(data);
    }
    else {
        deferred.reject('Class ID ' + class_id + ' is invalid.');
    }

    return deferred.promise;
}

// Takes a class id.
// If invalid, returns an error.
// If valid, create a group for the given class in the database and return all
// the groups in the class. A new group entry for the class is also made in the
// global datastructure.
function create_group(class_id, group_color) {
    var deferred = Q.defer();

    hash.find_id(class_id)
    .then(function(unhashed_id) {
        return database.create_group(unhashed_id, group_color);
    }).then(function(group_id) {
        classes.available_classes[class_id][group_id] = {students:[], deleted:false, colors:group_color};
        return get_all_groups_from_class(class_id);
    }).then(function(groups) {
        deferred.resolve(groups);
    }).fail(function(error) {
        deferred.reject(error);      
    });

    return deferred.promise;
}

// Takes a admin id, toolbar_name and tools.
// If invalid, returns an error.
// If valid, create a toolbar for the given class in the database and return all
// the toolbars in the class.
function create_toolbar(admin_id, toolbar_name, tools, action) {
    var deferred = Q.defer();
    var db_call;
    if (action == 'update')
        db_call = database.update_toolbar(admin_id, toolbar_name, tools);
    else if (action == 'insert')
        db_call = database.create_toolbar(admin_id, toolbar_name, tools);

    db_call
    .then(function() {
        return database.get_toolbars(admin_id);
    }).then(function(toolbars) {
        deferred.resolve(toolbars);
    }).fail(function(error) {
        deferred.reject(error);      
    });

    return deferred.promise;
}

// Takes a admin id, toolbar_name and tools.
// If invalid, returns an error.
// If valid, create a toolbar for the given class in the database and return all
// the toolbars in the class.
function create_xml(admin_id, xml_name, xml, toolbar, action) {
    var deferred = Q.defer();
    var db_call;
    if (action == 'update')
        db_call = database.update_xml(admin_id, xml_name, xml, toolbar);
    else if (action == 'insert')
        db_call = database.create_xml(admin_id, xml_name, xml, toolbar);

    db_call
    .then(function() {
        return database.get_xmls(admin_id);
    }).then(function(response) {
        deferred.resolve(response);
    }).fail(function(error) {
        deferred.reject(error);      
    });

    return deferred.promise;
}

// Takes a username and password.
// If invalid, returns an error.
// If valid return all
// creates admin.

function create_admin(username, password) {
    var deferred = Q.defer();

    database.create_user(username, password)
    .then(function(admin) {
        deferred.resolve(admin);
    }).fail(function(error) {
        deferred.reject(error);
    });

    return deferred.promise;
}

// adds a log

function add_log(username, class_id, group_id, log) {
    var deferred = Q.defer();

    database.add_log(username, class_id, group_id, log)
    .then(function(admin) {
        deferred.resolve(admin);
    }).fail(function(error) {
        deferred.reject(error);
    });

    return deferred.promise;
}

// Takes an admin_id, password, and
// new password. Updates password
// if valid password.

function update_password(admin_id, password, new_password) {
    var deferred = Q.defer();
    var valid;

    database.get_password(admin_id)
    .then(function(db_password) {
        valid = pw.verifyPassword(password, db_password);
        if (valid) {
            new_password = pw.makePassword(new_password, 10, 'sha256', 32);
            return database.update_password(admin_id, new_password)
        }
    }).then(function() {
        deferred.resolve(valid);
    }).fail(function(error) {
        deferred.reject(error);
    });

    return deferred.promise;
}


// Takes a admin id.
// If invalid, returns an error.
// If valid return all
// the toolbars in the admin.

function get_toolbars(admin_id) {
    var deferred = Q.defer();

    database.get_toolbars(admin_id)
    .then(function(toolbars) {
        deferred.resolve(toolbars);
    }).fail(function(error) {
        deferred.reject(error);
    });

    return deferred.promise;
}

// Takes a admin id.
// If invalid, returns an error.
// If valid return all
// the xmls in the admin.

function get_xmls(admin_id) {
    var deferred = Q.defer();

    database.get_xmls(admin_id)
    .then(function(response) {
        deferred.resolve(response);
    }).fail(function(error) {
        deferred.reject(error);
    });

    return deferred.promise;
}
// Takes a class_id.
// If invalid, returns an error.
// If valid return all
// the users in the class.

function get_class_users(class_id) {
    var deferred = Q.defer();

    if(class_id in classes.available_classes) {
        var class_users = [];
        for(var g in classes.available_classes[class_id]){
            if(parseInt(g) > 0){
                var user = {};
                user.group = g;
                user.users = classes.available_classes[class_id][g]["students"];
                class_users.push(user);
            }
        }
        var data = {
            class_users: class_users
        }
        deferred.resolve(data);
    } else {
        deferred.reject('Class ID ' + class_id + ' is invalid.');
    }
    return deferred.promise;
}

// Takes username and get password

function check_username(username) {
    var deferred = Q.defer();

    database.check_user(username)
    .then(function(data_password) {
        deferred.resolve(data_password);
    }).fail(function(error) {
        deferred.reject(error);
    });

    return deferred.promise;
}

// Takes a class id and group_id.
// If invalid, returns an error.
// If valid return 
// the colors of the group.

function group_color(class_id, group_id) {
    var deferred = Q.defer();

    hash.find_id(class_id)
    .then(function(unhashed_id) {
        return database.get_group_color(unhashed_id, group_id);
    }).then(function(toolbars) {
        deferred.resolve(toolbars);
    }).fail(function(error) {
        deferred.reject(error);
    });

    return deferred.promise;
}


// Takes admin_id and get session string

function check_session(admin_id) {
    var deferred = Q.defer();

    database.check_session(admin_id)
    .then(function(data_password) {
        deferred.resolve(data_password);
    }).fail(function(error) {
        deferred.reject(error);
    });

    return deferred.promise;
}

// Takes an admin id.
// If invalid, returns an error.
// If valid create session.

function create_session(admin_id, password) {
    var deferred = Q.defer();

    database.create_session(admin_id, password)
    .then(function() {
        deferred.resolve();
    }).fail(function(error) {
        deferred.reject(error);
    });

    return deferred.promise;
}

// Takes an admin id.
// If invalid, returns an error.
// If valid delete session.

function delete_session(admin_id) {
    var deferred = Q.defer();

    database.delete_session(admin_id)
    .then(function() {
        deferred.resolve();
    }).fail(function(error) {
        deferred.reject(error);
    });

    return deferred.promise;
}

// If invalid, returns an error.
// If valid, deletes the toolbar for the given the admin in the database and return all
// the toolbars for the admin.
function delete_toolbar(admin_id, toolbar_name) {
    var deferred = Q.defer();

    database.delete_toolbar(admin_id, toolbar_name)
    .then(function() {
        return database.get_toolbars(admin_id);
    }).then(function(toolbars) {
        deferred.resolve(toolbars);
    }).fail(function(error) {
        deferred.reject(error);      
    });

    return deferred.promise;
}

// If invalid, returns an error.
// If valid, deletes the xml for the given the admin in the database and return all
// the xmls for the admin.
function delete_xml(admin_id, xml_name) {
    var deferred = Q.defer();

    database.delete_xml(admin_id, xml_name)
    .then(function() {
        return database.get_xmls(admin_id);
    }).then(function(xmls) {
        deferred.resolve(xmls);
    }).fail(function(error) {
        deferred.reject(error);      
    });

    return deferred.promise;
}

// Takes a class id and group id.
// If invalid, returns an error.
// If valid, deletes the given group in the class from the database and global
// datastructure.
function delete_group(class_id, group_id) {
    var deferred = Q.defer();

    hash.find_id(class_id)
    .then(function(unhashed_id) {
        return database.delete_group(unhashed_id, group_id);
    }).then(function() {
        delete classes.available_classes[class_id][group_id];
    }).then(function(groups) {
        deferred.resolve(groups);
    }).fail(function(error) {
        deferred.reject(error);
    });
          return deferred.promise;
}

// Takes a class id.
// If invalid, returns an error.
// If valid, deletes the given class from the global datastructure.
function leave_class(class_id) {
    var deferred = Q.defer();

//    hash.remove_hash(class_id)
//    .then(function() {
//        deferred.resolve();
//    }).fail(function(error) {
//        deferred.reject(error);
//    });
    if (class_id in classes.available_classes) {
        deferred.resolve();
    }
    else {
        deferred.reject('Class ID ' + class_id + ' is invalid.');
    }
  
    return deferred.promise;
}

// Takes a class id.
// If invalid, returns an error.
// If valid, deletes the given class from the global datastructure.
function delete_class(class_id) {
    var deferred = Q.defer();

    hash.find_id(class_id)
    .then(function(unhashed_id) {
        return database.delete_class(unhashed_id);
    }).then(function() {
        delete classes.available_classes[class_id];
        deferred.resolve();
    }).fail(function(error) {
        deferred.reject(error);
    });
          return deferred.promise;
}



// Takes no parameters
// Retrieves the list of all classes from the database
// On failure, returns error.
function get_classes(admin_id){
    var deferred = Q.defer();

    database.get_classes(admin_id)
    .then(function(classes){
        deferred.resolve(classes);
    }).fail(function(error){
        deferred.reject(error);
    });
        return deferred.promise;

}

// Takes a class id and settings data.
// If invalid, returns an error.
// If valid, adds the settings to the given class in the global datastructure.
function save_settings(class_id, settings) {
    var deferred = Q.defer();

   if (class_id in classes.available_classes) {
        classes.available_classes[class_id]['settings'] = settings;
        deferred.resolve();
    }
    else {
        deferred.reject('Class ID ' + class_id + ' is invalid.');
    }

    return deferred.promise;
}

// Sanitizes data received by socket to prevent 
function sanitize_data(data) {
    // Replace only works on string variables
    if (typeof data === 'string' || data instanceof String) {
        return data.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }
    else {
        return data;
    }
}

function sleep(miliseconds) {
   var currentTime = new Date().getTime();

   while (currentTime + miliseconds >= new Date().getTime()) {
   }
}

// This function holds all event handlers for sockets.
function server_sockets(server, client){

    var io = socketio.listen(server);
   
    io.on('connection', function(socket) {

        // SERVER_ERROR
        // This function will notify the client when an error has occurred 
        // Emits server_error to the socket that triggered the error
        function server_error(error, message) {
            console.log(error);
            var date = new Date().toJSON();
            logger.info(date + "~server~server_error~~~{message: \""+ message +"\"}~0~");
            socket.emit('server_error', {message: message});
        };

        // PING
        // pinging to check for time
        // Emits ping response
        socket.on('ping-mathnet', function(time) {
            socket.emit('ping-mathnet-response', time);
        });

        
        // LOGIN
        // Socket joins room using class id
        // Emits login_response to socket that triggered login
        socket.on('login', function(username, class_id) {
            username = sanitize_data(username);
            class_id = sanitize_data(class_id);
            
            add_user_to_class(username, class_id,socket.id)
            .then(function() {
                socket.class_id = class_id;
                socket.username = username;

                var response = {
                    username : username,
                    class_id : class_id 
                }
                var date = new Date().toJSON();
                logger.info(date + "~" + username + "~login~" + class_id +"~~" + JSON.stringify(response) + "~1~");
                socket.emit('login_response', response);
            }).fail(function(error) {
                server_error(error, error); 
            });
        }); // authenticates class ID and makes sure there is not another user 
        //     with the same name. adds in user info to datastructure if unique.
        //     else displays an error message

        // LOGOUT
        // Socket leaves room using class id
        // Emits logout_response to socket that triggered logout
        socket.on('logout', function(username, class_id, disconnect) {
            username = sanitize_data(username);
            class_id = sanitize_data(class_id);
            disconnect = sanitize_data(disconnect);
            
            remove_user_from_class(username, class_id)
            .then(function() { 
                socket.leave(class_id + "x");
                var response = {
                    username : username,
                    class_id : class_id,
                    disconnect: disconnect
                }
                var date = new Date().toJSON();
                logger.info(date + "~" + username + "~logout~" + class_id + "~~~1~");
                socket.emit('logout_response', response);
                socket.class_id = undefined;
                socket.username = undefined;
            }).fail(function(error) {
                server_error(error, error);
            });
        }); 

        // GROUPS_GET
        // Emits groups_get_response to all sockets in class room
        socket.on('groups_get', function(username, class_id) {
            username = sanitize_data(username);
            class_id = sanitize_data(class_id);
            
            get_all_groups_from_class(class_id)
            .then(function(groups) {
                socket.join(class_id + 'x');
                var response = {
                    username : username,
                    class_id : class_id,
                    groups : groups
                }
                socket.emit('groups_get_response', response);
            }).fail(function(error) {
                server_error(error, error);
            });
        }); // populates groups array with groups with the given class id and 
        //     returns it to client.

        // GROUP_JOIN
        // Socket joins room using class and group ids
        // Emits group_join_response to socket that triggered group_join
        // Emits group_info_response to the admin socket of class
        // Emits group_numbers_response to all sockets in class room
        socket.on('group_join', function(username, class_id, group_id) {
            username = sanitize_data(username);
            class_id = sanitize_data(class_id);
            group_id = sanitize_data(group_id);

            add_user_to_group(username, class_id, group_id)
            .then(function() { 
                socket.join(class_id + "x" + group_id);
               // socket.leave(class_id + "x");
                socket.group_id = group_id;

                var info = {};
                info.charges = [{name: username, x: 0, y: 0}];
                var response = {
                    username : username,
                    class_id : class_id,
                    group_id : group_id,
                    other_members : [{member_name: username, member_info: JSON.stringify(info), group_id: group_id}],
                    status : true,
                    group_size : classes.available_classes[class_id][group_id]["students"].length
                }
                var date = new Date().toJSON();
                logger.info(date + "~" + username + "~group_join~" + class_id + "~" + group_id + "~" + JSON.stringify(response)
                            + "~1~" +class_id + "x");
                socket.emit('group_join_response', response);
                io.sockets.to(class_id + "x").emit('group_numbers_response', response);
                io.sockets.to('admin-' + class_id).emit('group_info_response', response);
            }).fail(function(error) {
                server_error(error, error);
            });
        }); // adds user to the students array of given group

        // GROUP_LEAVE
        // Socket leaves room using class and group ids
        // Emits group_leave_response to socket that triggered group_leave
        // Emits group_info_response to all sockets in the class group room and
        // to the admin socket of the class
        // Emits group_numbers_response to all sockets in class room
        socket.on('group_leave', function(username, class_id, group_id, disconnect) {
            username = sanitize_data(username);
            class_id = sanitize_data(class_id);
            group_id = sanitize_data(group_id);
            disconnect = sanitize_data(disconnect);
            
            remove_user_from_group(username, class_id, group_id)
            .then(function() {
              //  socket.join(class_id + "x");
                socket.leave(class_id + 'x' + group_id);
                var response = {
                    username : username,
                    class_id : class_id,
                    group_id : group_id,
                    status: false,
                    disconnect: disconnect,
                    group_size : classes.available_classes[class_id][group_id]["students"].length
                }
                var date = new Date().toJSON();
                logger.info(date + "~" + username + "~group_leave~" + class_id + "~" + group_id + "~" 
                            + JSON.stringify(response) + "~1~" +class_id + "x" + group_id );
                socket.emit('group_leave_response', response);
                io.sockets.to(class_id + "x").emit('group_numbers_response', response)
                io.sockets.to(class_id + "x" + group_id).emit('group_info_response', response);
                io.sockets.to('admin-' + class_id).emit('group_info_response', response);
                socket.group_id = undefined;
            }).fail(function(error) {
                server_error(error, error);
            });
        }); // resets user coordinates and removes them from the students array
        //     in current group, leaves your socket group

        // GROUP_INFO
        // Socket joins two rooms using class id and group id
        // Emits group_info_response to all sockets in the class group room and
        // to the admin socket of the class
        socket.on('group_info', function(username, class_id, group_id, status) {
            username = sanitize_data(username);
            class_id = sanitize_data(class_id);
            group_id = sanitize_data(group_id);
            status = sanitize_data(status);

            get_info_of_group(class_id, group_id)
            .then(function(other_members) {
                var response = {
                    username : username,
                    class_id : class_id,
                    group_id : group_id,
                    other_members : other_members,
                    status: status
                }
                if(status){
                    socket.emit('group_info_response', response); 
                } //don't need to emit if the person is leaving 
                response['other_members'] = [{
                    member_name : username,
                    member_info : classes.available_classes[class_id]["user"][username]["info"],
                    group_id : group_id
                }]; //set other_members to just the new member for the other group members
                socket.broadcast.to(class_id + "x"+ group_id).emit('group_info_response', response);
                //io.sockets.to('admin-' + class_id).emit('group_info_response', response);
            }).fail(function(error) {
                server_error(error, error);
            });
        }); // populates array other_members with the other students and their 
        //     coordinates in the given group 

        // COORDINATE_CHANGE
        // Emits coordinate_change_response to all sockets in the class group 
        // room
        // Emits group_info_response to admin socket of the class
        socket.on('coordinate_change', function(username, class_id, group_id, info) {
            username = sanitize_data(username);
            class_id = sanitize_data(class_id);
            group_id = sanitize_data(group_id);
            info = sanitize_data(info);
            
            var response;

            update_users_coordinates(username, class_id, info)
            .then(function(data) {
                response = {
                    username : username,
                    class_id : class_id,
                    group_id : group_id,
                    info: data.info
                }
                return get_info_of_group(class_id, group_id);
            }).then(function(other_members) {
                response.other_members = other_members;
                var date = new Date().toJSON();
                logger.info(date + "~" + username + "~coordinate_change~" + class_id + "~" + group_id + "~" 
                            + JSON.stringify(response)  + "~1~" + class_id + "x" + group_id );
                io.sockets.to(class_id + "x" + group_id).emit('coordinate_change_response', response);
                io.sockets.to('admin-' + class_id).emit('coordinate_change_response', response);
            }).fail(function(error) {
                server_error(error, error);
            });
        }); //registers the change of coordinates in the datastructure and passes them back to group

        // XML_UPDATE (mathnet)
        // emits xml_update_response to all sockets in the group room
        socket.on('xml_update', function(data) {
            if(data.username){
                data.username = sanitize_data(data.username);
            }
            if(data.class_id){
                data.class_id = sanitize_data(data.class_id);
            }
            if(data.group_id){
                data.group_id = sanitize_data(data.group_id);    
            }
            if(data.xml){
                data.xml = sanitize_data(data.xml);
            }
            if(data.toolbar){
                data.toolbar = sanitize_data(data.toolbar);
            }
            if(data.toolbar_user){
                data.toolbar_user = sanitize_data(data.toolbar_user);
            }
            if(data.properties){
                for (var i in data.properties){
                    data.properties[i] = sanitize_data(data.properties[i]);
                }
            }

            var response = {
                    username: data.username,
                    class_id: data.class_id,
                    group_id: data.group_id,
                    xml: JSON.stringify(data.xml),
                    toolbar: data.toolbar,
                    properties: data.properties,
                    obj_xml: JSON.stringify(data.obj_xml),
                    obj_label: data.obj_label,
                    obj_cmd_str: data.obj_cmd_str,
                    type_of_req: data.type_of_req,
                    xml_update_ver: data.xml_update_ver,
                    new_update: data.new_update
                };
            //commented code used for selective updates to admin
                // if (data.type_of_req != 'update' || data.recipient == 'student') {
                    socket.broadcast.to(data.class_id + "x" + data.group_id).emit('xml_update_response', response);
                // }
                // if (data.type_of_req != 'update' || data.recipient == 'admin') {
                    io.sockets.to('admin-' + data.class_id, response).emit('xml_update_response', response);
                // }
        }); //updates user and group xml values in the datastructure 

        // XML_CHANGE
        // emits xml_change_response to all sockets in the group room
        socket.on('xml_change', function(data) {
            if(data.username){
                data.username = sanitize_data(data.username);
            }
            if(data.class_id){
                data.class_id = sanitize_data(data.class_id);
            }
            if(data.group_id){
                data.group_id = sanitize_data(data.group_id);    
            }
            if(data.xml){
                data.xml = sanitize_data(data.xml);
            }
            if(data.toolbar){
                data.toolbar = sanitize_data(data.toolbar);
            }
            if(data.toolbar_user){
                data.toolbar_user = sanitize_data(data.toolbar_user);
            }
            if(data.properties){
                for (var i in data.properties){
                    data.properties[i] = sanitize_data(data.properties[i]);
                }
            }
            update_user_xml(data)
            .then(function(rdata){
                var response = {
                    username: data.username,
                    class_id: data.class_id,
                    group_id: data.group_id,
                    xml: rdata.xml,
                    toolbar: rdata.toolbar,
                    properties: rdata.properties,
                    obj_xml: JSON.stringify(data.obj_xml),
                    obj_label: data.obj_label,
                    obj_cmd_str: data.obj_cmd_str
                };
                var date = new Date().toJSON();
                logger.warn(date + "~" + data.username + "~xml_change~" + data.class_id + "~" + data.group_id + "~" 
                            + JSON.stringify(response)  + "~1~" + data.class_id + "x" + data.group_id ); //mathnet - info to warn
                if(rdata.user_socket){
                    // updating a user toolbar
                    socket.broadcast.to(rdata.user_socket).emit('xml_change_response', response);
                }else{
                    socket.broadcast.to(data.class_id + "x" + data.group_id).emit('xml_change_response', response);    
                }
                io.sockets.to('admin-' + data.class_id, response).emit('xml_change_response', response);
            }).fail(function(error){
                server_error(error, error);
            });
        }); //updates user and group xml values in the datastructure 

        // GET_XML
        // emits get_xml_response to socket that requested it.
        socket.on('get_xml', function(username, class_id, group_id) {
            username = sanitize_data(username);
            class_id = sanitize_data(class_id);
            group_id = sanitize_data(group_id);
            
            get_user_xml(username, class_id, group_id)
            .then(function(data){
                var response = {
                    username: username,
                    class_id: class_id,
                    group_id: group_id,
                    xml: data.xml,
                    toolbar: data.toolbar,
                    properties: data.properties
                }
                var date = new Date().toJSON();
                logger.info(date + "~" + username + "~get_xml~" + class_id + "~" + group_id + "~" 
                            + JSON.stringify(response)  + "~0~" + class_id + "x" + group_id );
                socket.emit('get_xml_response', response);
            }).fail(function(error){
                server_error(error, error);
            });
        }); //gets class xml and returns it to the socket that joined the group

        // P2P_GET_XML (mathnet)
        // emits get_xml_response to socket that requested it.
        socket.on('p2p_get_xml', function(username, class_id, group_id) {
            username = sanitize_data(username);
            class_id = sanitize_data(class_id);
            group_id = sanitize_data(group_id);

            var response = {
                username : username,
                class_id : class_id,
                group_id : group_id
            }
            
            for(var i = 0; i < classes.available_classes[class_id][group_id]["students"].length; i++){
                if(classes.available_classes[class_id][group_id]["students"][i] != username){
                    var student = classes.available_classes[class_id][group_id]["students"][i];
                    io.to(classes.available_classes[class_id]["user"][student]["socket_id"]).emit('p2p_get_xml_response', response);
                    return;
                }
            }
            // if no other student was found on the same group
            io.sockets.to('admin-' + class_id).emit('get_admin_applet_xml_response', response);
        }); //gets class xml and returns it to the socket that joined the group

        //This is used by the client (which is was requested for a copy of the updated XML) 
        //to return the XML to the requestor (which could be the admin or a client/student)
        socket.on('applet_xml', function(xml, username, class_id, group_id, xml_update_ver){
            var response = {
                username : username,
                class_id : class_id,
                group_id : group_id,
                xml : xml,
                properties : null,
                xml_update_ver: xml_update_ver
            }
            if(username !== 'admin'){
                io.to(classes.available_classes[class_id]["user"][username]["socket_id"]).emit('applet_xml_response', response);
            }
            else{
                io.sockets.to('admin-' + class_id).emit('applet_xml_response', response);
            }
        });

        // This is used in order to return a group xml to a student that joined an empty group
        socket.on('send_admin_applet_xml', function(xml, username, class_id, group_id, xml_update_ver){
            var response = {
                username : username,
                class_id : class_id,
                group_id : group_id,
                xml : xml,
                properties : null,
                xml_update_ver: xml_update_ver
            }
            if(username !== 'admin'){
                io.to(classes.available_classes[class_id]["user"][username]["socket_id"]).emit('send_admin_applet_xml_response', response);
            }
            else{
                io.sockets.to('admin-' + class_id).emit('send_admin_applet_xml_response', response);
            }
        });

        // GET-SETTINGS
        // This is the handler for the get-settings client socket emission
        // Emits get-settings-response to all sockets in the class group room
        socket.on('get-settings', function(class_id, group_id) {
            class_id = sanitize_data(class_id);
            group_id = sanitize_data(group_id);

            get_settings(class_id, group_id)
            .then(function(settings) {
                var response = {
                    class_id : class_id,
                    settings : settings
                }
                var date = new Date().toJSON();
                logger.info(date + "~ADMIN~get-settings~~~" + JSON.stringify(response) + "~0~");
                io.sockets.to(class_id + "x" + group_id).emit('get-settings-response', response);
            }).fail(function(error) {
                server_error(error, error);
            });
        });
       
        // ADD-CLASS
        // This is the handler for the add-class client socket emission
        // It calls a database function to create a class and groups
        // Socket joins an admin room using class id
        // Emits add-class-response to the socket that triggered add-class 
        socket.on('add-class', function(class_name, group_count, secret, admin_id, group_colors) {
            class_name = sanitize_data(class_name);
            group_count = sanitize_data(group_count);
            secret = sanitize_data(secret);
            if(!group_colors)
                group_colors = [0,0,0]
            if (secret == "ucd_247") {
                create_class(class_name, group_count, admin_id, group_colors)
                .then(function(class_id) {
                    socket.join('admin-' + class_id);
                    var response = {
                        class_id : class_id,
                        class_name : class_name,
                        group_count : group_count
                    }
                    var date = new Date().toJSON();
                    logger.info(date + "~ADMIN~add-class~" + class_name + "~~{class_id:"+ class_name + "}~1~");
                    socket.emit('add-class-response', response);
                }).fail(function(error) {
                    server_error(error, error);
                });
            }
        });

        //CREATE-SESSION
        //This is the handler for create session socket emission
        //It calls the database function to put the admin in the database
        socket.on('create-session', function(admin_id, string) {
            var password = pw.makePassword(string, 10, 'sha256', 32);

            
            delete_session(admin_id)
            .then(function() {
                return create_session(admin_id, password);
            }).then(function() {

            }).fail(function(error) {
                server_error(error, error);
            });
            socket.admin_id = admin_id;
        });

        //DELETE-SESSION
        //This is the handler for delete session socket emission
        //It calls the database function delete the admin from the database
        socket.on('delete-session', function(admin_id) {
       
            delete_session(admin_id)
            .then(function() {

            }).fail(function(error) {
                server_error(error, error);
            });
        });


        // CREATE-ADMIN
        // This is the handler for the create-admin client socket emission
        // It calls a database function to create an admin
        // Socket joins an admin room using class id
        // Emits create-admin-response to the socket that triggered add-class 
        socket.on('create-admin', function(username, password, secret) {
            username = sanitize_data(username);
            password = pw.makePassword(password, 10, 'sha256', 32);
            

            if (secret == "ucd_247") {
                
                check_username(username) // checking if username already exists or not
                .then(function(data_password) {
                    
                    if (!data_password[0]) { // not calling database function create admin if username already exists

                        create_admin(username, password)
                        .then(function(data) {


                            var response = {
                                username: username,
                                password: password,
                                check : 1
                            }
                            
                            var date = new Date().toJSON();
                            logger.info(date + "~ADMIN~create-admin~" + username + "~~{class_id:"+ username + "}~1~");
                            socket.emit('create-admin-response', response);

                        }).fail(function(error){
                            server_error(error, error);
                        });

                    }

                else {
                    var response = {
                        check : 0
                    }
                    socket.emit('create-admin-response', response);
                }
                }).fail(function(error) {
                    server_error(error, error);
                });
            }
        });


        // CHANGE-PASSWORD
        // This is the handler for the create-admin client socket emission
        // It calls a database function to create an admin
        // Socket joins an admin room using class id
        // Emits create-admin-response to the socket that triggered add-class 
        socket.on('change-password', function(admin_id, password, new_password, secret) {
            admin_id = sanitize_data(admin_id);
            password = sanitize_data(password);
            new_password = sanitize_data(new_password);


            if (secret == "ucd_247") {
                
                update_password(admin_id, password, new_password) // change password
                .then(function(success) {

                    var response = {
                        success: success
                    };
                    
                    var date = new Date().toJSON();
                    logger.info(date + "~ADMIN~change-password~admin_id~" + success);
                    socket.emit('change-password-response', response);

                }).fail(function(error) {
                    server_error(error);
                });
            }
        });


        // JOIN-CLASS
        // This is the handler for the join-class client socket emission
        // It calls a function to get the number of groups in the class from 
        // the global datastructure.
        // Emits add-class-response to the socket that triggered join-class
        socket.on('join-class', function(class_id, secret) {
            class_id = sanitize_data(class_id);
            secret = sanitize_data(secret);

            if (secret == "ucd_247") {
                join_class(class_id)
                .then(function(data) {
                    socket.join('admin-' + class_id);
                    var response = {
                        class_id : class_id,
                        class_name : data.class_name,
                        group_count : data.group_count
                    }
                    var date = new Date().toJSON();
                    logger.info(date + "~ADMIN~join-class~" + class_id + "~~" + JSON.stringify(response) + "~0~");
                    socket.emit('add-class-response', response);
                    for(var i = 1; i < data.group_count+1; i++){
                        get_info_of_group(class_id, i)
                        .then(function(other_members){
                            if(other_members != undefined && other_members.length != 0){
                               var response = {
                                    other_members: other_members,
                                    group_id: other_members[0].group_id,
                                    status: true
                                }
                                io.sockets.to('admin-' + class_id).emit('group_info_response', response);
                            }
                        });
                    }
                }).fail(function(error) {
                    server_error(error, error);
                });
            }
        });

        // ADD-GROUP
        // This is the handler for the add-group client socket emission
        // It calls a database function to create a group for a class
        // Emits add-group-response to socket that triggered add-group
        // Emits groups_get_response to all sockets in the class room
        socket.on('add-group', function(class_id, secret, colors) {
            class_id = sanitize_data(class_id);
            secret = sanitize_data(secret);
            if(!colors)
                colors = [0,0,0]

            var group_color = colors.join('-'); //Creating the string to be passed in the sql database as group_color

            if (secret == "ucd_247") {
                create_group(class_id, group_color)
                .then(function(groups) {
                    var response = {
                        username : "Admin",
                        class_id : class_id,
                        groups : groups
                    }
                    var date = new Date().toJSON();
                    logger.info(date + "~ADMIN~add-group~" + class_id + "~" + groups.length + "~" + JSON.stringify(response) 
                                + "~1~"+ class_id + "x");
                    socket.emit('add-group-response', {});
                    io.sockets.to(class_id + "x").emit('add-group-response', {});

                }).fail(function(error) {
                    server_error(error, error);
                });
            }
        }); 



        // ADD_LOG
        // This is the handler for the add-log client socket emission
        // It calls a database function to add a log for each activity
        socket.on('add_log', function(username, class_id, group_id, log) {
            class_id = sanitize_data(class_id);
            username = sanitize_data(username);
            group_id = sanitize_data(group_id);

            log = username + log;

            if ("ucd_247" == "ucd_247") {
                add_log(username, class_id, group_id, log)
                .then(function(groups) {
                    // var response = {
                    //     username : "Admin",
                    //     class_id : class_id,
                    //     groups : groups
                    // }
                    // var date = new Date().toJSON();
                    // logger.info(date + "~ADMIN~add-group~" + class_id + "~" + groups.length + "~" + JSON.stringify(response) 
                    //             + "~1~"+ class_id + "x");
                    // socket.emit('add-group-response', {});
                    // io.sockets.to(class_id + "x").emit('add-group-response', {});

                }).fail(function(error) {
                    server_error(error, error);
                });
            }
        }); 

        // GROUP-COLOR
        // This is the handler for the color-group client socket emission
        // It calls a database function to get and set the color for a group
        // Emits group-color-response to socket that triggered add-group
        socket.on('group-color', function(class_id, group_id) {
            class_id = sanitize_data(class_id);
            group_id = sanitize_data(group_id);

            group_color(class_id, group_id)
            .then(function(colors) {

                socket.emit('group-color-response', colors);
                //io.sockets.to(class_id + "x").emit('add-group-response', {});

            }).fail(function(error) {
                server_error(error, error);
            });
        }); 



        // ADD-TOOLBAR
        // This is the handler for the add-toolbar client socket emission
        // It calls a database function to create a toolbar for a class
        // Emits toolbar_get_response to all sockets in the class room
        socket.on('save-toolbar', function(admin_id, toolbar_name, tools, action) {
            admin_id = sanitize_data(admin_id);

            create_toolbar(admin_id, toolbar_name, tools, action)
            .then(function(toolbars) {
                var response = {
                    username : "Admin",
                    admin_id : admin_id,
                    toolbars : toolbars
                }
                var date = new Date().toJSON();
                logger.info(date + "~ADMIN~add-toolbar~" + admin_id + "~" + toolbars.length + "~" + JSON.stringify(response) 
                            + "~1~"+ admin_id + "x");
                socket.emit('get-toolbar-response', response);

            }).fail(function(error) {
                server_error(error, error);
            });

        }); 

        // GET-TOOLBARS
        // This is the handler for the get-toolbar client socket emission
        // It calls a database function to get all the toolbars for a class
        // Emits get_toolbar_response to all sockets in the class room
        socket.on('get-toolbars', function(admin_id) {
            admin_id = sanitize_data(admin_id);

            get_toolbars(admin_id)
            .then(function(toolbars) {

                var response = {
                    username : "Admin",
                    admin_id : admin_id,
                    toolbars : toolbars
                }
                socket.emit('get-toolbar-response', response);

            }).fail(function(error) {
                server_error(error, error);
            });

        }); 

        // DELETE-TOOLBAR
        // This is the handler for the delete-toolbar client socket emission
        // It calls a database function to delete the toolbar for the class
        // Emits delete_toolbar_response to all sockets in the class room
        socket.on('delete-toolbar', function(admin_id, toolbar_name) {
            admin_id = sanitize_data(admin_id);

            delete_toolbar(admin_id, toolbar_name)
            .then(function(toolbars) {

                var response = {
                    username : "Admin",
                    admin_id : admin_id,
                    toolbars : toolbars
                }
                socket.emit('delete-toolbar-response', response);

            }).fail(function(error) {
                server_error(error, error);
            });

        }); 

        // SAVE-XML
        // This is the handler for the save_xml client socket emission
        // It calls a database function to create a xml entry for an admin user
        // Emits get_xmls_response to socket that called
        socket.on('save-xml', function(admin_id, xml_name, xml, toolbar, action) {
            admin_id = sanitize_data(admin_id);
            xml_name = sanitize_data(xml_name);
            xml = sanitize_data(xml);
            toolbar = sanitize_data(toolbar);
            action = sanitize_data(action);

            xml = JSON.stringify(xml);
            create_xml(admin_id, xml_name, xml, toolbar, action)
            .then(function(xmls) {
                var response = {
                    username : "Admin",
                    admin_id : admin_id,
                    xmls: xmls
                }

                var date = new Date().toJSON();
                logger.info(date + "~ADMIN~save-xml~" + admin_id + "~" + xml + "~" + JSON.stringify(response) 
                            + "~1~"+ admin_id + "x");
                socket.emit('get-xmls-response', response);

            }).fail(function(error) {
                server_error(error, error);
            });

        }); 

        // GET-XMLS
        // This is the handler for the get-xmls client socket emission
        // It calls a database function to get all the xml for an admin
        // Emits get_xmls_response to admin socket that called it
        socket.on('get-xmls', function(admin_id) {
            admin_id = sanitize_data(admin_id);

            get_xmls(admin_id)
            .then(function(xmls) {

                var response = {
                    username : "Admin",
                    admin_id : admin_id,
                    xmls: xmls
                }
                socket.emit('get-xmls-response', response);

            }).fail(function(error) {
                server_error(error, error);
            });

        }); 

        // DELETE-XML
        // This is the handler for the delete-xml client socket emission
        // It calls a database function to delete a xml for a admin user
        // Emits delete_admin_response to admin user who called it
        socket.on('delete-xml', function(admin_id, xml_name) {
            admin_id = sanitize_data(admin_id);
            xml_name = sanitize_data(xml_name);

            delete_xml(admin_id, xml_name)
            .then(function(xmls) {

                var response = {
                    username : "Admin",
                    admin_id : admin_id,
                    xmls: xmls
                }
                socket.emit('delete-xml-response', response);

            }).fail(function(error) {
                server_error(error, error);
            });

        }); 

        // GET-CLASS-USERS
        // This is the handler for the get-class-users client socket emission
        // It calls a database function to get all the users for a class
        // Emits a get-class-users-response to all sockets in the class room
        socket.on('get-class-users', function(class_id,callback) {
            class_id = sanitize_data(class_id);
            callback = sanitize_data(callback);
            get_class_users(class_id)
            .then(function(data) {

                var response = {
                    username : "Admin",
                    admin_id : class_id,
                    class_users : data.class_users
                }
                socket.emit(callback, response);

            }).fail(function(error) {
                server_error(error, error);
            });

        }); 

        // DELETE-GROUP
        // This is the handler for the delete-group client socket emission
        // It calls a database function to delete a group for a class
        // Emits delete-group-response to socket that triggered delete-group
        // Emits group_leave_response to all sockets in class group room
        // Emits groups_get_response to all sockets in class room
        socket.on('delete-group', function(class_id, group_id, secret) {
            class_id = sanitize_data(class_id);
            group_id = sanitize_data(group_id);
            secret = sanitize_data(secret); 
            
            if (secret == "ucd_247") {
                delete_group(class_id, group_id)
                .then(function(groups) {
                    var response = {
                        username : "Admin",
                        class_id : class_id,
                        group_id : group_id,
                        groups : groups
                    }

                    var date = new Date().toJSON();
                    logger.info(date + "~ADMIN~delete-group~" + class_id + "~" + group_id + "~" 
                                + JSON.stringify(response) + "~1~[" + class_id + "x," + class_id + "x" + group_id + "]");
                    socket.emit('delete-group-response', {});
                    
                    io.sockets.to(class_id + "x" + group_id).emit('group_leave_response', response);
                    io.sockets.to(class_id + "x").emit('delete-group-response', {});
                }).fail(function(error) {
                    server_error(error, error);
                });
            }
        });

        // LEAVE-CLASS
        // This is the handler for the leave-class client socket emission
        // Socket leaves an admin room using class id
        // Emits leave-class-response to socket that triggered leave-classs
        // Emits logout_response to all sockets in class room
        socket.on('leave-class', function(class_id, secret, disconnect) {
            class_id = sanitize_data(class_id);
            secret = sanitize_data(secret);
            
            if (secret == "ucd_247") {
                leave_class(class_id)
                .then(function() {
                    socket.leave('admin-' + class_id);
                    var date = new Date().toJSON();
                    var response = {
                        disconnect: disconnect
                    }
                    logger.info(date + "~ADMIN~leave-class~" + class_id + "~~"+ JSON.stringify(response) + "~0~");
                    socket.emit('leave-class-response', response);
                   // io.to(class_id + "x").emit('logout_response', {});
                }).fail(function(error) {
                    server_error(error);
                });
            }
        });

        // DELETE-CLASS
        // This is the handler for the delete-class client socket emission
        // Socket deletes an admin room using class id
        // Emits delete-leave-class-response to socket that triggered leave-classs
        // Emits logout_response to all sockets in class room
        socket.on('delete-class', function(class_id, secret, disconnect) {
            class_id = sanitize_data(class_id);
            var length = Object.keys(classes.available_classes[class_id]).length;
            
            if (secret == "ucd_247") {
                delete_class(class_id)
                .then(function() {
                    
                    var response = 
                    {
                        class_id : class_id,
                        disconnect: disconnect,
                    }
                    
                    for (var i = 1; i <= length - 3; i++) {
                        socket.to(class_id + "x" + i).emit('group_leave_response', response);
                        socket.to(class_id + "x" + i).emit('logout_response', response);
                    }  // going through all the groups one by one

                    io.sockets.to("admin-" + class_id).emit('leave-class-response', response);
                    io.sockets.to("admin-" + class_id).emit('delete-class-response', response);
                    io.sockets.emit('delete-student-class-response', response);
                    io.sockets.to(class_id + "x").emit('logout_response', response);
                    hash.remove_hash(class_id);

                }).fail(function(error){
                    server_error(error);
                });

            }

            
        });


        // GET-CLASSES
        // This is the handler for the get-classes socket emission
        // Returns list of classes and their hashed IDs from the database
        // to the client via a get-classes-response
        socket.on('get-classes', function(secret, admin_id, disconnect) {
            secret = sanitize_data(secret);
            
            if (secret == "ucd_247") {
                get_classes(admin_id)
                .then(function(classes) {
                    var date = new Date().toJSON();
                    var response = {
                        secret: secret,
                        disconnect: disconnect,
                        classes: classes
                    }

                    logger.info(date + "~ADMIN~get-classes~" + "no_class" + "~~"+ JSON.stringify(response) + "~0~");
                    socket.emit('get-classes-response', response);
                   // io.to(class_id + "x").emit('logout_response', {});
                }).fail(function(error) {
                    server_error(error);
                });
            }
        });

        // CHECK-USERNAME
        // This is the handler for the check_username socket emission
        socket.on('check-username', function(username, password, secret) {
            secret = sanitize_data(secret);
            username = sanitize_data(username);
            password = sanitize_data(password);

            if (secret == "ucd_247") {
                check_username(username)
                .then(function(data_password) {
                    var check = 0;
                    
                    var data_admin;
                    if(!data_password[0]) {
                        check = 0;
                        data_admin = ""
                    } 
                    else if(!pw.verifyPassword(password, data_password[0].password)) {
                        check = -1;
                        data_admin = data_password[0].admin_id;
                    }
                    else {
                        check = 1;
                        data_admin = data_password[0].admin_id;            
                    }

                    socket.emit('check-username-response', data_admin, check);
                   // io.to(class_id + "x").emit('logout_response', {});
                }).fail(function(error) {
                    server_error(error);
                });
            }
        });

        // CHECK-SESSION
        // This is the handler for the check_session socket emission
        socket.on('check-session', function(admin_id, password) {
            admin_id = sanitize_data(admin_id);
            password = sanitize_data(password);

            check_session(admin_id)
            .then(function(data_password) {
                var check = 0;
                var data_admin = 0;
                
                if (password && data_password[0] && pw.verifyPassword(password, data_password[0].password)) {
                    check = 1;
                    if (data_password[0] && (Math.abs(new Date() - data_password[0].last_updated) >= 720000)) {
                        check = -1;
                    }
                    data_admin = admin_id;
                    socket.admin_id = admin_id;
                }

                socket.emit('check-session-response', data_admin, check);
               // io.to(class_id + "x").emit('logout_response', {});
            }).fail(function(error) {
                server_error(error);
            });

        });




        // SAVE-SETTINGS
        // This is the handler for the save-settings client socket emission
        // Emits get-settings-response to all sockets in class room
        socket.on('save-settings', function(class_id, settings, secret) {
            class_id = sanitize_data(class_id);
            settings = sanitize_data(settings);
            secret = sanitize_data(secret);
            
            if (secret == "ucd_247") {
                save_settings(class_id, settings)
                .then(function() {
                    var response = {
                        class_id : class_id,
                        settings : settings
                    }
                    var date = new Date().toJSON();
                    logger.info(date + "~ADMIN~save-settings~~~" + JSON.stringify(response) + "~1~");

                    for (var i = 1; i <= Object.keys(classes.available_classes[class_id]).length - 3; i++) {
                        socket.to(class_id + "x" + i).emit('get-settings-response', response);
                    }
                }).fail(function(error) {
                    server_error(error);
                });
            }
        });

        // DISCONNECT
        // This is the handler for any disconnects, it checks if the disconnected socket has
        // any variables within it set, and if still set, removes the user from the groups on the server side
        // emitting group_info response to the group (if in one) room and admin, and logout_response to the individual socket.
        socket.on('disconnect', function() {
            console.log("disconnect");
            if (socket.admin_id){
                database.update_time(socket.admin_id)
                .then(function() {
                    deferred.resolve();
                }).fail(function(error) {
                    deferred.reject(error);
                });
            }
            
            
            // Remove user from class
            if (socket.class_id !== undefined) {

                // Remove user from group
                if (socket.group_id !== undefined) {
                    remove_user_from_group(socket.username, socket.class_id, socket.group_id)
                    .then(function() {
                        return get_info_of_group(socket.class_id, socket.group_id)
                    }).then(function(other_members) {
                        socket.leave(socket.class_id + "x" + socket.group_id);
                        var response = {
                            username : socket.username,
                            class_id : socket.class_id,
                            group_id : socket.group_id,
                            disconnect : true,
                            status: false,
                            other_members : other_members
                        }

                        var date = new Date().toJSON();
                        logger.info(date + "~" + socket.username + 
                                    "~group_leave~" + socket.class_id + "~" + 
                                    socket.group_id + "~" + 
                                    JSON.stringify(response) + "~1~" + 
                                    socket.class_id + "x" + socket.group_id);

                                    io.sockets.to(socket.class_id + "x" +
                                                  socket.group_id)
                                    .emit('group_info_response', response);
                                    
                                    io.sockets.to('admin-' + 
                                                  socket.class_id)
                                    .emit('group_info_response', response);
                    }).fail(function(error) {
                        server_error(error, error);
                    });

                }

                remove_user_from_class(socket.username, socket.class_id)
                .then(function() { 
                    var response = {
                        username : socket.username,
                        class_id : socket.class_id,
                        disconnect : true
                    }

                    var date = new Date().toJSON();
                    logger.info(date + "~" + socket.username + "~logout~" +
                                socket.class_id + "~~~1~");
                    socket.emit('logout_response', response);
                }).fail(function(error) {
                    server_error(error, error);
                });
            }
        });
    });
}