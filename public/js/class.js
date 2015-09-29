$(function() {
    var socket = Student.Socket(io(location.host));
    var username = localStorage.getItem('username');
    var class_id = localStorage.getItem('class_id');
    var $logout_button = $('#logout');
    var current_user = localStorage.getItem('username');
    var current_class = localStorage.getItem('class_id');

    $logout_button.click(function() {
        socket.logout(username, class_id);
    });

     $('#buttons').on('click', ':input', function() {
        socket.group_join(current_user, current_class, $(this).index('#buttons :input') + 1);
    });


    socket.groups_get(username, class_id);
});
