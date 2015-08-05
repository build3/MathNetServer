var socketio = require('socket.io'),
    database = require('./database_actions');

module.exports = admin_sockets;

function admin_sockets(server) {
    var io = socketio.listen(server);

    io.on('connection', function (socket) {
        var admin;
        console.log("Someone has connected!");

        // This function will notify the client when an error has occurred 
        // due to a client socket emission
        function server_error(error, message) {
            console.log(error);
            socket.emit('server-error', {message: message});
        };

        // This is the handler for the add-class client socket emission
        // It calls a database function to create a class and groups
        socket.on('add-class', function(class_name, group_count, secret) {
            console.log(secret);
            if (secret == "ucd_247") {
                console.log(class_name, group_count);
                var class_id;
                database.create_class(class_name, group_count, function(result) {
                    socket.emit('add-class-response', {class_id: result});
                });
            }
        });

        // This is the handler for the add-group client socket emission
        // It calls a database function to create a group for a class
        socket.on('add-group', function(class_name, secret) {
            if (secret == "ucd_247") {
                console.log(class_name);
                database.create_group(class_name, function() {
                    socket.emit('add-group-response', {});
                });
            }
        }); 

        // This is the handler for the delete-group client socket emission
        // It calls a database function to delete a group for a class
        socket.on('delete-group', function(class_id, group_id, secret) {
            if (secret == "ucd_247") {
                console.log(class_id, group_id);
                database.delete_group(class_id, group_id, function() {
                    socket.emit('delete-group-response', {});
                });
            }
        });

        // This is the handler for the leave-class client socket emission
        socket.on('leave-class', function(secret) {
            if (secret == "ucd_247") {
                console.log("Leaving class!");
                socket.emit('leave-class-response', {});
            }
        });
    });
}
