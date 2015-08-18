$(function() {

    var $leave_group_button = $('#leave_group');
    var $coord_change_buttons = $('.change_coord');

    var socket = Student.Socket(io(location.host));
    var username = localStorage.getItem('username');
    var class_id = localStorage.getItem('class_id');
    var group_id = localStorage.getItem('group_id');

    socket.group_info(username, class_id, group_id);

    $coord_change_buttons.click(function(event) {
        var x = parseInt($(event.target).attr('data-x'));
        var y = parseInt($(event.target).attr('data-y'));
        socket.coordinate_change(username, class_id, group_id, x, y);
    });

    $leave_group_button.click(function() {
        socket.group_leave(username, class_id, group_id);
    });
});
