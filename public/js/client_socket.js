//this is the js file for all the client socket calls

var socket = io();

var current_path = window.location.pathname.split('/').pop();
current_path = "/" + current_path;

if (current_path == "/groups"){
    $(function(){
        $("#included_content").load("coord_app.html", function(){
            var send_object = {
                logged_in : localStorage.getItem('logged_in'),
                username : localStorage.getItem('username'),
                class_id : localStorage.getItem('class_id'),
                group_id : localStorage.getItem('group_id'),
                group_leave : false
            }
            socket.emit('group_info', send_object);
            $(".change_coord").on("click", function(e){
                var btn = $(e.target);
                var x, y;
                if (btn.val() == "←"){
                    x = -1.0;
                    y = 0.0;
                }
                if (btn.val() == "↑"){
                    x = 0.0;
                    y = 1.0;
                }
                if (btn.val() == "↓"){
                    x = 0.0;
                    y = -1.0;
                }
                if (btn.val() == "→"){
                    x = 1.0;
                    y = 0.0;
                } 

                var send_object = {
                    logged_in : true,
                    username : localStorage.getItem('username'),
                    class_id : localStorage.getItem('class_id'),
                    group_id : localStorage.getItem('group_id'),
                    x_coord : x,
                    y_coord : y
                }
                socket.emit('coordinate_change', send_object);
            }); 
        });
        //processes the button press to change coordinates
        
    });
    
} //emit call for group_info when the page /groups loads

$(document).ready(function(){

    if(current_path == "/"){
        console.log(localStorage.getItem('error_message'));
        if(localStorage.getItem('error_message') != null){
            console.log('another thing');
            $("#error_frame").append(localStorage.getItem('error_message'));
        }
        localStorage.removeItem('error_message');
    }//show errors if there are any when the page / loads
    if (current_path == "/class"){

        var send_object = {
            logged_in : localStorage.getItem('logged_in'),
            username : localStorage.getItem('username'),
            class_id : localStorage.getItem('class_id')
        }
        socket.emit('groups_get', send_object);
    }//emit call for group_get when the page /class loads


    $("#login").on("click", function(){

        var class_id = document.getElementById('class_id').value;
        var nickname = document.getElementById('nickname').value;
        
        var send_object = {
            logged_in : false,
            username : nickname,
            class_id : class_id
        }
        socket.emit('login', send_object);
    }); //onclick for login button

    $("#logout").on("click", function(){


        var send_object = {
            logged_in : false,
            username : localStorage.getItem('username'),
            class_id : localStorage.getItem('class_id')
        }
        socket.emit('logout', send_object);
    }); //onclick for logout button

    $("#leave_group").on("click", function(){


        var send_object = {
            logged_in : true,
            username : localStorage.getItem('username'),
            class_id : localStorage.getItem('class_id'),
            group_id : localStorage.getItem('group_id')
        }
        socket.emit('group_leave', send_object);
    }); //onclick for leave group button


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
        localStorage.setItem('error_message', data.error_message);
        //print error message to page
        location.href = '/';
    }
}); //error message and redirect depending on login info

socket.on('logout_response', function(data){
    if (!data.logged_in){
        localStorage.setItem('logged_in', false);
        localStorage.removeItem('class_id');
        localStorage.removeItem('username');
        location.href = '/';
    }
}); //clears out localStorage and redirects to login page

socket.on('groups_get_response', function(data){
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

        var response = {
            logged_in : data.logged_in,
            username : data.username,
            class_id : data.class_id,
            group_id : data.group_id,
            group_leave : true
        }
        socket.emit('group_info', response); 
        location.href = '/class';
    }
}); //redirects user back to /class and removes group ID from localStorage (updates group info)

socket.on('groups_info_response', function(data){
    $(".table_entry").remove();
    for (var i in data.other_members){
        if(data.other_members[i].member_name == localStorage.getItem('username')){
            var table_entry = '<tr class="table_entry" id="' + data.other_members[i].member_name + 'x"><td>(You) '+ data.other_members[i].member_name +'</td><td>('
                            + data.other_members[i].member_x +','+ data.other_members[i].member_y +')</td></tr><br/>';
        }
        else{
            var table_entry = '<tr class="table_entry" id="' + data.other_members[i].member_name + 'x"><td>'+ data.other_members[i].member_name +'</td><td>('
                            + data.other_members[i].member_x +','+ data.other_members[i].member_y +')</td></tr><br/>';
        }
        $("#table_gen").append(table_entry);
    }
    $("#number").html('Group : ' +data.group_id);
    if (data.group_leave)
        $("#messages").append(data.username + " has left the group.<br/>");
    else
        $("#messages").append(data.username + " has joined the group.<br/>");
}); //updates group user info to the /groups page, and prints message about leave/join 
socket.on('coordinate_change_response', function(data){
    console.log(data);
    if(data.username == localStorage.getItem('username'))
        $("#" + data.username + "x").html('<td>(You) '+ data.username +'</td><td>('+ data.x_coord +','+ data.y_coord +')</td>');
    else
        $("#" + data.username + "x").html('<td>'+ data.username +'</td><td>('+ data.x_coord +','+ data.y_coord +')</td>');

    $("#messages").append(data.username + " has moved their point to (" + data.x_coord + "," + data.y_coord + ").<br/>");
}); //changes the innerHTML of the group member that pressed a button and prints a message for the change


