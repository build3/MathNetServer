$(function() {
   
   // Initialize variables
   var $create_button = $('.create_button'); // Button for creation of class
   var $class_input = $('.class_input'); // Input for class name
   var $group_input = $('.group_input'); // Input for # of groups
 
   // Loads input fields into localStorage and outputs the values to console
   $create_button.click(function() {
       localStorage.setItem('class_name',$class_input.val().trim());
       localStorage.setItem('group_count',$group_input.val().trim());
       console.log(localStorage.getItem('class_name'));
       console.log(localStorage.getItem('group_count'));
    });

});
