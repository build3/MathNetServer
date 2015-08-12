$(function() {
    var $groups = $('#buttons');
    var $logout_button = $('#logout');

    var socket = Student.Socket(io(location.host));
    var username = localStorage.getItem('username');
    var class_id = localStorage.getItem('class_id');

    //
    // Groups Get
    //

    socket.groups_get(username, class_id);

    socket.add_event('groups_get_response', $groups);

    $groups.on('groups_get_response', function(e, d) {
        $(this).empty();
        for (var i in d.groups){
            var button = '<input type="button" value="Group ';
            button += d.groups[i].grp_name + ' - '+ d.groups[i].num;
            button += '" /><br/>';
            $(this).append(button);
        }
        bindGroupClick();
    });

    //
    // Group Join
    //

    function bindGroupClick() {
        $('#buttons :input').click(function() {
            socket.group_join(username, class_id, $(this).index('#buttons :input') + 1);
        });
    }

    socket.add_event('group_join_response', $(window));

    $(window).on('group_join_response', function(e, d) {
        localStorage.setItem('group_id', d.group_id);
        location.href = '/groups';
    });

    //
    // Logout 
    //

    $logout_button.click(function() {
        socket.logout(username, class_id);
    });

    socket.add_event('logout_response', $logout_button);

    $logout_button.on('logout_response', function(e, d) {
        localStorage.removeItem('class_id');
        localStorage.removeItem('username');
        location.href = '/';
    });

});
