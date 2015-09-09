(function (Admin, $) {
    var sock,
        listeners = [];

    // Using the namespace Admin, this is a custom Socket object that takes 
    // a socket.io socket object, and initializes the socket functions
    Admin.Socket = function (socket) {
        return init(socket);
    };


    // The initialization function for the Admin.Socket object
    var init = function (socket) {
       // sock = socket;

        // This function takes a class name and group count provided by the 
        // user. The socket then emits this data to the server to create 
        // the class and groups. 
        var add_class = function (class_name, group_count, secret) {
            socket.emit('add-class', class_name, group_count, secret);
        };

        // This function takes a class id provided by the user. The socket then
        // emits this data to the server to join a class.
        var join_class = function (class_id, secret) {
            socket.emit('join-class', class_id, secret);
        };

        // This function takes a class name provided by the user.
        // The socket then emits this data to the server to create a 
        // group for the class.
        var add_group = function (class_id, secret) {
            socket.emit('add-group', class_id, secret);
        }

        // This function takes a class id and group id provided by the user.
        // The socket then emits this data to the server to delete a group
        // from the class.
        var delete_group = function (class_id, group_id, secret) {
            socket.emit('delete-group', class_id, group_id, secret);
        }

        // This function has the socket to emit the server that the user has
        // left the class.
        var leave_class = function (class_id, secret) {
            socket.emit('leave-class', class_id, secret);
        }

        // This function calls the socket

        // This function disconnects the socket
        var disconnect = function() {
            socket.disconnect();
        };

        //
        // Socket event handlers
        //

        socket.on('server_error', function(data) {
            server_error(data.message);
        });

        socket.on('add-class-response', function(data) {
            console.log('weeeeee');
            add_class_response(data.class_id, data.class_name, data.group_count);
        });

        socket.on('add-group-response', function(data) {
            add_group_response();
        });

        socket.on('delete-group-response', function(data) {
            delete_group_response();
        });

        socket.on('leave-class-response', function(data) {
            leave_class_response();
        });

        socket.on('group_info_response', function(data) {
            group_info_response(data.group_id, data.other_members);
        });

        return {
            add_class: add_class,
            join_class: join_class,
            add_group: add_group,
            delete_group: delete_group,
            leave_class: leave_class,
            disconnect: disconnect
        };
    };

    //var socket = io(location.host + '/admins');
})(window.Admin = window.Admin || {}, window.jQuery);
