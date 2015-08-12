$(function() {
    var $login_button = $('#login');
    var $class_id = $('#class_id');
    var $username = $('#nickname');

    var socket = Student.Socket(io(location.host));

    $login_button.click(function() {
        socket.login($username.val().trim(), $class_id.val().trim());
    });

    socket.add_event('login_response', $(window));

    $(window).on('login_response', function(e, d) {
        localStorage.setItem('class_id', d.class_id);
        localStorage.setItem('username', d.username);
        location.href = '../class';
    });

});
