function groups_get_response(username, class_id, groups) {
    var $groups = $('#buttons');
    $groups.empty();
    for (var i in groups){
        var button = '<input type="button" value="Group ';
        button += groups[i].grp_name + ' - '+ groups[i].num;
        button += '" /><br/>';
        $groups.append(button);
    }
    bindGroupClick();
}

function group_join_response(username, class_id, group_id) {
    localStorage.setItem('group_id', group_id);
    location.href = '/groups';
}

function logout_response() {
    localStorage.removeItem('class_id');
    localStorage.removeItem('username');
    location.href = '/';
}

function bindGroupClick() {
    $('#buttons :input').click(function() {
        socket.group_join(username, class_id, $(this).index('#buttons :input') + 1);
    });
}

var socket = Student.Socket(io(location.host));
var username = localStorage.getItem('username');
var class_id = localStorage.getItem('class_id');
var $logout_button = $('#logout');

$logout_button.click(function() {
    socket.logout(username, class_id);
});

socket.groups_get(username, class_id);
