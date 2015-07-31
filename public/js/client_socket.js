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
}//emit call for group_get when the page /class loads

if (current_path == "/groups"){
    var send_object = {
        logged_in : localStorage.getItem('logged_in'),
        username : localStorage.getItem('username'),
        class_id : localStorage.getItem('class_id'),
        group_id : localStorage.getItem('group_id')
    }
    console.log("group info");
    socket.emit('group_info', send_object);
} //emit call for group_info when the page /groups loads

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
    }); //onclick for login button

    $("#logout").on("click", function(){


        var send_object = {
            logged_in : false,
            username : localStorage.getItem('username'),
            class_id : localStorage.getItem('class_id')
        }
        console.log("logging out");
        socket.emit('logout', send_object);
    }); //onclick for logout button

    $("#leave_group").on("click", function(){


        var send_object = {
            logged_in : true,
            username : localStorage.getItem('username'),
            class_id : localStorage.getItem('class_id'),
            group_id : localStorage.getItem('group_id')
        }
        console.log("leaving group");
        socket.emit('group_leave', send_object);
    }); //onclick for leave group button

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
}); //error message and redirect depending on login info

socket.on('logout_response', function(data){
    if (!data.logged_in){
        localStorage.removeItem('class_id');
        localStorage.removeItem('username');
        location.href = '/';
    }
}); //clears out localStorage and redirects to login page

socket.on('groups_get_response', function(data){
    console.log("got some kind of group response" + data.groups);
    for (var i in data.groups){
        var button = '<input type="button" value="Group' + data.groups[i].grp_name + '- '+ data.groups[i].num
                   + '" id="'+ data.groups[i].grp_name + '" onclick=group_btn_onclick(' + data.groups[i].grp_name +') /><br/>';
        $("#buttons").append(button);
    }
}); //creates group buttons to attach to /class page

function group_btn_onclick(grp_num){
    var send_object = {
        logged_in : localStorage.getItem('logged_in'),
        username : localStorage.getItem('username'),
        class_id : localStorage.getItem('class_id'),
        group_id : grp_num
    }
    socket.emit('group_join', send_object);
}//onclick function for the group buttons created in groups_get_response

socket.on('group_join_response', function(data){
    localStorage.setItem('group_id', data.group_id);
    //emit message to your group that you joined
    location.href = '/groups';
}); //redirects user to /groups page and sets group ID in localStorage

socket.on('group_leave_response', function(data){
    if (data.logged_in){
        localStorage.removeItem('group_id');
        //emit message to your group that you left
        location.href = '/class';
    }
}); //redirects user back to /class and removes group ID from localStorage

socket.on('groups_info_response', function(data){
    for (var i in data.other_members){
        if(data.other_members[i].member_name == localStorage.getItem('username')){
            var table_entry = '<tr><td>(You) '+ data.other_members[i].member_name +'</td><td>('+ data.other_members[i].member_x +','
                        + data.other_members[i].member_y +')</td></tr><br/>';
        }
        else{
            var table_entry = '<tr><td>'+ data.other_members[i].member_name +'</td><td>('+ data.other_members[i].member_x +','
                        + data.other_members[i].member_y +')</td></tr><br/>';
        }
        $("#table_gen").append(table_entry);
    }
    $("#number").append(data.group_id);
}); //attaches group user info to the /groups page 



