//this is the js file for all the client socket calls

var socket = io.connect('http://localhost:8888');

var current_path = window.location.pathname.split('/').pop();
current_path = "/" + current_path;

if (current_path == "/class"){

    var send_object = {
        logged_in : localStorage.getItem('logged_in'),
        username : localStorage.getItem('username'),
        class_id : localStorage.getItem('class_id')
    }
    console.log("groups get");
    socket.emit('groups_get', send_object);
}

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
        localStorage.setItem('class_id', data.class_id);
        localStorage.setItem('username', data.username);
        localStorage.setItem('logged_in', data.logged_in);
        location.href = '../class';
        
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
socket.on('groups_get_response', function(data){
    console.log("got some kind of group response" + data.groups);
    for (var i in data.groups){
        var button = '<input type="button" value="Group' + data.groups[i].grp_name + '- '+ data.groups[i].num
                   + '" id="'+ data.groups[i].grp_name + '" /><br/>';
        $("#buttons").append(button);
    }
});

