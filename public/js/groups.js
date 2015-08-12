$(function() {
    $leave_group_button = $('#leave_group');
    $messages = $('#messages');

    $included_content = $('#included_content');

    var socket = Student.Socket(io(location.host));
    var username = localStorage.getItem('username');
    var class_id = localStorage.getItem('class_id');
    var group_id = localStorage.getItem('group_id');

    $included_content.load("coord_app.html", function() {
        socket.group_info(username, class_id, group_id);
 
        $('.change_coord').click(function(event) {
            var x = event.target.attr('data-x');
            var y = event.target.attr('data-y');
            socket.coordinate_change(username, class_id, group_id, x, y);
        });
    });


});
