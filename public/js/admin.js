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
    
    // Holds secret needed to allow socket calls
    var $secret = $('.secret');     
    
    // Start with create view visible and manage view hidden
    $manage_view.hide();

    //
    // ADD CLASS
    //
    $create_button.click(function() {
        // Tell the server to create a class in the database
        socket.add_class($class_input.val().trim(), parseInt($group_input.val().trim()), $secret.val().trim());
    });

    //
    // ADD GROUP
    //
    //
    $add_button.click(function() {
        // Tell the server to create a new group for the class in the database
        socket.add_group(localStorage.getItem('class_id'), $secret.val().trim());
    });

    //
    // DELETE GROUP
    //
    $delete_button.click(function() {
        // Only remove if there are groups
        if ($('.groups > li').length > 0) {
            socket.delete_group(localStorage.getItem('class_id'), $('.groups > li:last').index() + 1, $secret.val().trim());
        }
    });

    //
    // LEAVE CLASS
    //
    $leave_button.click(function() {
        socket.leave_class(localStorage.getItem('class_id'), $secret.val().trim());
    });

});
