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

    
    $create_button.click(function() {
        // Loads field values into localStorage
        localStorage.setItem('class_name',$class_input.val().trim());
        localStorage.setItem('group_count',$group_input.val().trim());

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
        $(this).html(localStorage.getItem('class_name') + " ID: " + class_id);
      //  $(this).html(" " + class_id);
    });

    $groups.on('add-class-response', function(e, d) {
        // Generate html for each group
        // Each group will have a delete button and a label
        var groups_html = "";
        var group_number = parseInt(localStorage['group_count']);
        for (var group=1; group < group_number+1; group++) {
            groups_html += "<li>Group " + group + "</li>";
        }
        $(this).html(groups_html);
    });

   
    $leave_button.click(function() {
        // Remove class values from localStorage
        localStorage.removeItem('class_name');
        localStorage.removeItem('group_count');

        // Switch to creation view now that class has been left
        $create_view.show();
        $manage_view.hide();
    });

    $add_button.click(function() {
        // Append new group list element to html
        var new_group = "";
        var group_number = parseInt(localStorage['group_count']) + 1;

        new_group += "<li>Group " + group_number + "</li>";
        $groups.append(new_group);

        // Tell the server to create a new group for the class in the database
        socket.add_group($class_input.val().trim(), $secret.val().trim());

        // Update localStorage count of groups
        localStorage['group_count'] = parseInt(localStorage['group_count']) + 1;
    });

    $delete_button.click(function() {
        // Only remove if there are groups
        if ($('.groups li').length > 0) {

            socket.delete_group(parseInt(class_id), $('.groups li:last').index() + 1, $secret.val().trim());
            
            // Remove last group element in list
            $('.groups li:last').remove();

            // Update localStorage value
            localStorage['group_count'] =
                parseInt(localStorage['group_count']) - 1;
        }
    });

});
