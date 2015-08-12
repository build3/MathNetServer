(function (Student, $) {
    var sock,
        listeners = [];

    Student.Socket = function (socket) {
        return init(socket);
    }

    var init = function (socket) {

        var add_event = function (name, obj) {
            var proxy = function (d) {
                $(obj).trigger(name, d);
            };
            socket.on(name, proxy);
            listeners.push({name: name, func: proxy});
        };

        var login = function (username, class_id) {
            socket.emit('login', username, class_id);
        }

        var logout = function(username, class_id) {
            socket.emit('logout', username, class_id);
        }

        var groups_get = function(username, class_id) {
            socket.emit('groups_get', username, class_id);
        }

        var group_join = function(username, class_id, group_id) {
            socket.emit('group_join', username, class_id, group_id);
        }
        
        var group_leave = function(username, class_id, group_id) {
            socket.emit('group_leave', username, class_id, group_id);
        }

        var group_info = function(username, class_id, group_id) {
            socket.emit('group_info', username, class_id, group_id);
        }

        var coordinate_change = function(username, class_id, group_id, x, y) {
            socket.emit('coordinate_change', username, class_id, group_id, x, y);
        }

        var remove_listeners = function () {
            for(var i = 0; i < listeners.length; i++) {
                socket.removeListener(listeners[i].name, listeners[i].func);
            }
        }

        return {
            add_event: add_event,
            login: login,
            logout: logout,
            groups_get: groups_get,
            group_join: group_join,
            group_leave: group_leave,
            group_info: group_info,
            coordinate_change: coordinate_change,
            remove_listeners: remove_listeners
        };
    }
})(window.Student = window.Student || {}, window.jQuery);
