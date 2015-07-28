$(function() {
   
   // Initialize variables
   var $create_view = $('.create_view'); // Div holding class creation view
   var $manage_view = $('.manage_view'); // Div holding class management view
    
   var $create_button = $('.create_button'); // Button for creation of class
   var $class_input = $('.class_input'); // Input for class name
   var $group_input = $('.group_input'); // Input for # of groups

   var $leave_button = $('.leave_button'); // Button for leaving a class
   var $class_name = $('.class_name'); // Header line for class name
   var $groups = $('.groups'); // Div that will hold groups

   // Start with create view visible and manage view hidden
   $manage_view.hide();

   $create_button.click(function() {
       // Loads field values into localStorage
       localStorage.setItem('class_name',$class_input.val().trim());
       localStorage.setItem('group_count',$group_input.val().trim());
       console.log(localStorage.getItem('class_name'));
       console.log(localStorage.getItem('group_count'));
       
       setUpManagementView();

       // Switch to management view now that class has been created
       $create_view.hide();
       $manage_view.show();
    });

    $leave_button.click(function() {
        // Remove class values from localStorage
        localStorage.removeItem('class_name');
        localStorage.removeItem('group_count');

        // Switch to creation view now that class has been left
        $create_view.show();
        $manage_view.hide();
    });

    function setUpManagementView() {
        // Set h3 tag name to class name
        $class_name.html(localStorage.getItem('class_name'));

        var groups_html = "<ul>"
        var group_number = parseInt(localStorage.getItem('group_count'))
        
        // Generate html for each group
        // Each group will have a delete button and a label
        for (var group=1; group < group_number+1; group++) {
            groups_html += "<li><label for='group_" + group + "'>";
            groups_html += "Group " + group + "</label>";
            groups_html += "<input id='group_" + group;
            groups_html += "' type='button' value='Delete'>";
            groups_html += "</li>";
        }
        groups_html += "</ul>";
        $groups.html(groups_html);
    }

});
