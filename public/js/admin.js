$(function() {

    // Initialize variables
    var $create_view = $('.create_view'); // Div holding class creation view
    var $manage_view = $('.manage_view'); // Div holding class management view

    var $create_button = $('.create_button'); // Button for creation of class
    var $class_input = $('.class_input'); // Input for class name
    var $group_input = $('.group_input'); // Input for # of groups

    var $leave_button = $('.leave_button'); // Button for leaving a class
    var $class_name = $('.class_name'); // Header line for class name
    var $groups = $('.groups'); // List that will hold groups
    var $add_button = $('.add_button'); // Button for adding a group
    var $delete_button = $('.delete_button'); // Button for deleting a group

    // Connect to the server using the Admin.Socket object constructor
    var socket = Admin.Socket(io(location.host));
    var class_id;

    var $secret = $('.secret'); // holds secret needed to allow socket calls
    // Start with create view visible and manage view hidden
    $manage_view.hide();

   
    //
    // ADD CLASS
    //
    $create_button.click(function() {
        // Tell the server to create a class in the database
        socket.add_class($class_input.val().trim(), parseInt($group_input.val().trim()), $secret.val().trim());
    });


    socket.add_event('add-class-response', $create_view);
    socket.add_event('add-class-response', $manage_view);
    socket.add_event('add-class-response', $class_name);
    socket.add_event('add-class-response', $groups);

    $create_view.on('add-class-response', function(e, d) {
        $(this).hide();
    });
    
    $manage_view.on('add-class-response', function(e, d) {
        $(this).show();
    });

    $class_name.on('add-class-response', function(e, d) {
        class_id = d.class_id;
        $(this).html($class_input.val().trim() + " ID: " + class_id);
      //  $(this).html(" " + class_id);
    });

    $groups.on('add-class-response', function(e, d) {
        // Generate html for each group
        // Each group will have a delete button and a label
        var groups_html = "";
        var group_number = parseInt($group_input.val().trim());
        for (var group=1; group < group_number+1; group++) {
            groups_html += "<li>Group " + group + "</li>";
        }
        $(this).html(groups_html);
    });

    //
    // ADD GROUP
    //
    //
    $add_button.click(function() {
        // Tell the server to create a new group for the class in the database
        socket.add_group(class_id, $secret.val().trim());
    });

    socket.add_event('add-group-response', $groups)

    $groups.on('add-group-response', function (e, d) {
        // Append new group list element to html
        var new_group = "";
        var group_number = $('.groups li:last').index() + 2;        
        new_group += "<li>Group " + group_number + "</li>";
        $(this).append(new_group);
    });

    //
    // DELETE GROUP
    //
    $delete_button.click(function() {
        // Only remove if there are groups
        if ($('.groups li').length > 0) {
            socket.delete_group(class_id, $('.groups li:last').index() + 1, $secret.val().trim());
        }
    });

    socket.add_event('delete-group-response', $groups);

    $groups.on('delete-group-response', function(e, d) {
        // Remove last group element in list
        $('.groups li:last').remove();
    });

    //
    // LEAVE CLASS
    //
    $leave_button.click(function() {
        socket.leave_class(class_id, $secret.val().trim());
    });

    socket.add_event('leave-class-response', $create_view);
    socket.add_event('leave-class-response', $manage_view);

    // Switch to creation view now that class has been left
    $create_view.on('leave-class-response', function(e, d) {
        $(this).show();
    });

    $manage_view.on('leave-class-response', function(e, d) {
        $(this).hide();
    });
});
