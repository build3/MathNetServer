//this is the js file for all the client socket calls

 var socket = io.connect('http://localhost:8888');
$(document).ready(function(){
    $("#login").on("click", function(){

        var class_id = document.getElementById('class_id').value;
        var nickname = document.getElementById('nickname').value;
        
        var send_object = {
            logged_in : false,
            username : nickname,
            class_id : class_id
        }
        console.log("sent object");
        socket.emit('login', send_object);
    });

    $("#logout").on("click", function(){


        var send_object = {
            logged_in : false,
            username : localStorage.getItem('username'),
            class_id : localStorage.getItem('class_id')
        }
        console.log("logging out");
        socket.emit('logout', send_object);
        
    });
    $(window).on('beforeunload', function(){
        socket.close();
    });
});
socket.on('login_response', function(data){
    if (data.logged_in){
        location.href = '../class.html';
        localStorage.setItem('class_id', data.class_id);
        localStorage.setItem('username', data.username);
    }
    else{
        console.log(data.error_message);
        //print error message to page
        location.href = '/';
    }
});
socket.on('logout_response', function(data){
    if (!data.logged_in){
        localStorage.removeItem('class_id');
        localStorage.removeItem('username');
        location.href = '/';
    }
});