function server_error(error) {
    var $login_view = $('.login_view');
    var $class_view = $('.class_view');
    var $group_view = $('.group_view');

    console.log(error);
    localStorage.setItem('error', error);
    location.reload();
}

function login_response(username, class_id) {
    var $login_view = $('.login_view');
    var $class_view = $('.class_view');
    var $group_view = $('.group_view');

    $login_view.hide();
    $class_view.show();
    $group_view.hide();

    localStorage.setItem('class_id', class_id);
    localStorage.setItem('username', username);
    socket.groups_get(username, class_id);
}

function groups_get_response(username, class_id, groups) {
    var $groups = $('#buttons');
    var current_user = localStorage.getItem('username');
    var current_class = localStorage.getItem('class_id');
    $groups.empty();
    for (var i in groups){
        var button = '<input type="button" value="Group ';
        button += groups[i].grp_name + ' - '+ groups[i].num;
        button += '" /><br/>';
        $groups.append(button);
    }
}

function group_join_response(username, class_id, group_id) {
    var $login_view = $('.login_view');
    var $class_view = $('.class_view');
    var $group_view = $('.group_view');
    var $messages = $('#messages');

    $messages.html('');

    $login_view.hide();
    $class_view.hide();
    $group_view.show();

    localStorage.setItem('group_id', group_id);

    socket.group_info(username, class_id, group_id, true);
    socket.get_settings(class_id, group_id);
}

function logout_response() {
    var $login_view = $('.login_view');
    var $class_view = $('.class_view');
    var $group_view = $('.group_view');

    $login_view.show();
    $class_view.hide();
    $group_view.hide();

    localStorage.removeItem('class_id');
    localStorage.removeItem('username');
}

// EDIT THIS FUNCTION
function group_info_response(username, class_id, group_id, members, status) {
    var current_user = localStorage.getItem('username');
    var current_group = localStorage.getItem('group_id');
    $group_name = $('#number');
    $people = $('#people');
    $group_name.html('Group: ' + current_group);    
    $people.html('');
    for (var i in members) {
        if(members[i].member_name != current_user) {
            var member = '<li id="' + members[i].member_name + '">';
            member += members[i].member_name;
            member += ' - (<span class="x">' + members[i].member_x + '</span>, ';
            member += '<span class="y">' + members[i].member_y + '</span>) </li>';
        }
        else {
            var member = '<li id="' + members[i].member_name + '">';
            member += members[i].member_name + ' (You)';
            member += ' - (<span class="x">' + members[i].member_x + '</span>, ';
            member += '<span class="y">' + members[i].member_y + '</span>) </li>';
        }
        $people.append(member);
        
    }
    if(status){
        $('#messages').append(username + ' has joined the group<br/>');
    } else {
        $('#messages').append(username + ' has left the group<br/>');
    }
}

// EDIT THIS FUNCTION
function coordinate_change_response(username, class_id, group_id, x, y, info) {
    $messages = $('#messages');
    
    $('#' + username + ' .x').html(x);
    $('#' + username + ' .y').html(y);
    $messages.append(username + ' has moved their point to (' 
                          + x + ', ' + y +')<br/>');
}

// EDIT THIS FUNCTION
function group_leave_response(username, class_id, group_id) {
    // This function must call socket.groups_get(username, class_id)
    var $login_view = $('.login_view');
    var $class_view = $('.class_view');
    var $group_view = $('.group_view');

    $login_view.hide();
    $class_view.show();
    $group_view.hide();
    localStorage.removeItem('group_id');
    
    socket.groups_get(localStorage.getItem('username', username),
                      localStorage.getItem('class_id', class_id)
                     );
}

// EDIT THIS FUNCTION
function get_settings_response(class_id, settings) {
    $class_settings = $('#settings');
    $class_settings.html('');

    for (var setting in settings) {
        var setting_item = "<li>" + setting + ": " + settings[setting] + "</li>";
        $class_settings.append(setting_item);
    }
}

