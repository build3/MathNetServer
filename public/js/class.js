$(function() {
    var $logout_button = $('#logout');

    $logout_button.click(function() {
        socket.logout(localStorage.getItem('username'), 
                      localStorage.getItem('class_id')
                     );
    });

     $('#buttons').on('click', ':input', function() {
        socket.group_join(localStorage.getItem('username'), 
                          localStorage.getItem('class_id'),
                          $(this).index('#buttons :input') + 1
                         );
    });
});
