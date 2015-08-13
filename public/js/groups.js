function group_info_response(username, class_id, group_id, members) {
    $group_name.html('Group: ' + group_id);    
    
    $people.html('');
    for (var i in members) {
        if(members[i].member_name != username) {
            var member = '<li id="' + members[i].member_name + '">';
            member += members[i].member_name;
            member += '(<span class="x">' + members[i].member_x + '</span>, ';
            member += '<span class="y">' + members[i].member_y + '</span>)</li>';
        }
        else {
            var member = '<li id="' + members[i].member_name + '">';
            member += members[i].member_name + ' (You)';
            member += '(<span class="x">' + members[i].member_x + '</span>, ';
            member += '<span class="y">' + members[i].member_y + '</span>)</li>';
        }
        $people.append(member);
    }
}

function coordinate_change_response(username, class_id, group_id, x, y) {
}

$group_name = $('#number');
$leave_group_button = $('#leave_group');
$people = $('#people');
$messages = $('#messages');

$included_content = $('#included_content');



var socket = Student.Socket(io(location.host));
var username = localStorage.getItem('username');
var class_id = localStorage.getItem('class_id');
var group_id = localStorage.getItem('group_id');

socket.group_info(username, class_id, group_id);

$('.change_coord').click(function(event) {
    var x = event.target.attr('data-x');
    var y = event.target.attr('data-y');
    socket.coordinate_change(username, class_id, group_id, x, y);
});


