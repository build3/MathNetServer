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
        // user. The socket then emits this data to the client to create the
        // class and groups on the server
        var add_class = function (class_name, group_count, cb) {
            socket.emit('add-class', class_name, group_count);
        };


        // Removes any listeners waiting on events 
        var remove_listeners = function () {
            for (var i = 0; i < listeners.length; i++) {
                socket.removeListener(listeners[i].name, listeners[i].func);
            }
        }

        return {
            add_event: add_event,
            add_class: add_class,
            remove_listeners: remove_listeners
        };
    };

    //var socket = io(location.host + '/admins');
})(window.Admin = window.Admin || {}, window.jQuery);
