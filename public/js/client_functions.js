//this file holds all the functions that are used in client_socket.js

function change_coords(e) {
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
    return send_object;
}
function login_response(data){
    if (data.logged_in){
        localStorage.setItem('class_id', data.class_id);
        localStorage.setItem('username', data.username);
        localStorage.setItem('logged_in', data.logged_in);
        location.href = '../class';
        
    }
    else {
        console.log(data.error_message);
        localStorage.setItem('error_message', data.error_message);
        //print error message to page
        location.href = '/';
    }
}
function groups_get_response(groups){
    $("#buttons").empty();
    console.log("made it to groups_get_response");
    for (var i in groups){
        var button = '<input type="button" value="Group' + groups[i].grp_name + ' - '+ groups[i].num
                   + '" id="'+ groups[i].grp_name + '" onclick=group_btn_onclick(' + groups[i].grp_name +') /><br/>';
        $("#buttons").append(button);
    }
}
function group_join_response(data){

    localStorage.setItem('group_id', data.group_id);
    location.href = '/groups';
}
function table_gen(other_members){
    for (var i in other_members){
        if(other_members[i].member_name == localStorage.getItem('username')){
            var table_entry = '<tr class="table_entry" id="' + other_members[i].member_name + 'x"><td>(You) '+ other_members[i].member_name +'</td><td>('
                            + other_members[i].member_x +','+ other_members[i].member_y +')</td></tr><br/>';
        }
        else{
            var table_entry = '<tr class="table_entry" id="' + other_members[i].member_name + 'x"><td>'+ other_members[i].member_name +'</td><td>('
                            + other_members[i].member_x +','+ other_members[i].member_y +')</td></tr><br/>';
        }
        $("#table_gen").append(table_entry);
    }   
}
function group_id_gen(group_id){
    $("#number").html('Group : ' +group_id);
}
function group_message(data){
    if (data.group_leave)
        $("#messages").append(data.username + " has left the group.<br/>");
    else
        $("#messages").append(data.username + " has joined the group.<br/>");
}
function coord_message(data){
    if(data.username == localStorage.getItem('username'))
        $("#" + data.username + "x").html('<td>(You) '+ data.username +'</td><td>('+ data.x_coord +','+ data.y_coord +')</td>');
    else
        $("#" + data.username + "x").html('<td>'+ data.username +'</td><td>('+ data.x_coord +','+ data.y_coord +')</td>');

    $("#messages").append(data.username + " has moved their point to (" + data.x_coord + "," + data.y_coord + ").<br/>");
}
