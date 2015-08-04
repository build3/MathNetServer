var socketio = require('socket.io'),
    database = require('./database_actions');

module.exports = adminSockets;

function adminSockets(server, client) {
    var io = socketio.listen(server);

    // These socket functions and triggers only occur for sockets belonging to
    // the admins namespace
    var admins = io.of('/admins').on('connection', function (socket) {
        var admin;
        console.log("Someone has connected!");

        // This function will notify the client when an error has occurred 
        // due to a client socket emission
        function server_error(error, message) {
            console.log(error);
            socket.emit('server-error', {message: message});
        };

        // This is the handler for the add-class client socket emission
        // It calls a database function to the passed in class and groups
        socket.on('add-class', function(class_name, group_count) {
            console.log(class_name, group_count);
            database.create_class(class_name, group_count);
        });

    });
}
