$(function() {
    var socket = Student.Socket(io(location.host));
    var username = localStorage.getItem('username');
    var class_id = localStorage.getItem('class_id');
    var $logout_button = $('#logout');

    $logout_button.click(function() {
        socket.logout(username, class_id);
    });

    socket.groups_get(username, class_id);
});
