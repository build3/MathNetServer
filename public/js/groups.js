$(function() {

    var $leave_group_button = $('#leave_group');
    var $coord_change_buttons = $('.change_coord');

    $coord_change_buttons.click(function(event) {
        var x = parseInt($(event.target).attr('data-x'));
        var y = parseInt($(event.target).attr('data-y'));
        socket.coordinate_change(localStorage.getItem('username'),
                                 localStorage.getItem('class_id'),
                                 localStorage.getItem('group_id'),
                                 x,
                                 y
                                );
    });

    $leave_group_button.click(function() {
        socket.group_leave(localStorage.getItem('username'),
                           localStorage.getItem('class_id'),
                           localStorage.getItem('group_id')
                          );
    });
});
