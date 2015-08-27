$(function() {
    var $login_button = $('#login');
    var $class_id = $('#class_id');
    var $username = $('#nickname');
    var $error_header = $('#error_frame');

    var socket = Student.Socket(io(location.host));

    $login_button.click(function() {
        socket.login($username.val().trim(), $class_id.val().trim());
    });

    $error_header.html(localStorage.getItem('error'))
                 .promise()
                 .done(function() {
                     localStorage.removeItem('error');
                     localStorage.removeItem('class_id');
                     localStorage.removeItem('group_id');
                     localStorage.removeItem('username');
                 });

});
