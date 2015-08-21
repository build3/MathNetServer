$(function() {
    var $login_button = $('#login');
    var $class_id = $('#class_id');
    var $username = $('#nickname');
    var socket = Student.Socket(io(location.host));

    $login_button.click(function() {
        socket.login($username.val().trim(), $class_id.val().trim());
    });
});

