function server_error(error) {
    $('.error_message').html(JSON.stringify(error)); }

function add_class_response(class_id, class_name, group_count) {
    var $create_view = $('.create_view');
    var $manage_view = $('.manage_view');
    var $class_name = $('.class_name');
    var $groups = $('.groups');

    localStorage.setItem('class_id', class_id);
    $('.error_message').html('');

    $create_view.hide();
    $manage_view.show();

    $class_name.html(class_name + " ID: " + class_id);
    var groups_html = "";
    var group_number = parseInt(group_count);
    for (var group=1; group < group_number+1; group++) {
        groups_html += "<li>Group " + group + "</li>";
    }
    $groups.html(groups_html);
}

function add_group_response() {
    var $groups = $('.groups');
    
    $('.error_message').html('');
    var new_group = "";
    var group_number = $('.groups li:last').index() + 2;
    new_group += "<li>Group " + group_number + "</li>";
    $groups.append(new_group);
}

function delete_group_response() {
    $('.error_message').html('');
    $('.groups li:last').remove(); 
}

function leave_class_response() {
    var $create_view = $('.create_view');
    var $manage_view = $('.manage_view');
    
    $('.error_message').html('');
    
    $create_view.show();
    $manage_view.hide();
}