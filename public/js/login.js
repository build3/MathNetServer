function login_response(username, class_id) {
    localStorage.setItem('class_id', class_id);
    localStorage.setItem('username', username);
    location.href = '../class';
    console.log(username, class_id);
}

$(function() {
    var $login_button = $('#login');
    var $class_id = $('#class_id');
    var $username = $('#nickname');
    var socket = Student.Socket(io(location.host));

    $login_button.click(function() {
        socket.login($username.val().trim(), $class_id.val().trim());
    });
});

