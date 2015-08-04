var socketio = require('socket.io');

module.exports = adminSockets;

function adminSockets(server, client) {
    var io = socketio.listen(server);

    var admins = io.of('/admins').on('connection', function (socket) {
        var admin;
        console.log("Someone has connected!");
        function serverError(error, message) {
            console.log(error);
            socket.emit('serverError', {message: message});
        };

    });
}
