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

        // This listens for return events from the server
        // Objects can call add_event to add themselves to the list 
        // of listeners who get notified upon the event. It is essentially
        // an observer pattern.
        // Example using the create class button:
        //   socket.addEvent('server-error', $('.create_class_button'));
        //   $('create_class_button').on('server-error, function (error) {
        //      console.log(error);
        //   });
        var add_event = function (name, obj) {
            var proxy = function (d) {
                $(obj).trigger(name, d);
            };
            socket.on(name, proxy);
            listeners.push({name: name, func: proxy});
        };

        // This function takes a class name and group count provided by the 
        // user. The socket then emits this data to the server to create 
        // the class and groups. 
        var add_class = function (class_name, group_count, secret) {
            socket.emit('add-class', class_name, group_count, secret);
        };

        // This function tabkes a class name provided by the user.
        // The socket then emits this data to the server to create a 
        // group for the class.
        var add_group = function (class_name, secret) {
            socket.emit('add-group', class_name, secret);
        }

        // This function takes a class id and group id provided by the user.
        // The socket then emits this data to the server to delete a group
        // from the class.
        var delete_group = function (class_id, group_id, secret) {
            socket.emit('delete-group', class_id, group_id);
        }

        // Removes any listeners waiting on events 
        var remove_listeners = function () {
            for (var i = 0; i < listeners.length; i++) {
                socket.removeListener(listeners[i].name, listeners[i].func);
            }
        }

        return {
            add_event: add_event,
            add_class: add_class,
            add_group: add_group,
            delete_group: delete_group,
            remove_listeners: remove_listeners
        };
    };

    //var socket = io(location.host + '/admins');
})(window.Admin = window.Admin || {}, window.jQuery);
