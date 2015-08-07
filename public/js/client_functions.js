//this file holds all the functions that are used in client_socket.js

function change_coords(e) {
    var btn = $(e.target);
    var x = 0.0, y = 0.0;
    if (btn.val() == "←")
        x = -1.0;
    if (btn.val() == "↑")
        y = 1.0;
    if (btn.val() == "↓")
        y = -1.0;
    if (btn.val() == "→")
        x = 1.0;

    var send_object = {
        logged_in : true,
        username : localStorage.getItem('username'),
        class_id : localStorage.getItem('class_id'),
        group_id : localStorage.getItem('group_id'),
        x_coord : x,
        y_coord : y
    }
    return send_object;
}//reads clicked button value and translates that to a coordinate change, and returns object for the socket call
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
}//if logged_in is true, redirects to /class, else redirects to /. sets appropriate localstorage info for each response.
function groups_get_response(groups){
    $("#buttons").empty();
    console.log("made it to groups_get_response");
    for (var i in groups){
        var button = '<input type="button" value="Group' + groups[i].grp_name + ' - '+ groups[i].num
                   + '" id="'+ groups[i].grp_name + '" onclick=group_btn_onclick(' + groups[i].grp_name +') /><br/>';
        $("#buttons").append(button);
    }
}//creates and appends buttons to id="buttons" in class.html
function group_btn_onclick(grp_num){
    var send_object = {
        logged_in : localStorage.getItem('logged_in'),
        username : localStorage.getItem('username'),
        class_id : localStorage.getItem('class_id'),
        group_id : grp_num
    }
    socket.emit('group_join', send_object);
}//onclick function for the group buttons created in groups_get_response
function group_join_response(data){

    localStorage.setItem('group_id', data.group_id);
    location.href = '/groups';
}//sets group_id in localstorage and redirects to /groups
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
}//creates table entries for each member of other_members, and appends to id="table_gen" in groups.html
function group_id_gen(group_id){
    $("#number").html('Group : ' +group_id);
}//appends group_id to id="number" in groups.html
function group_message(data){
    if (data.group_leave)
        $("#messages").append(data.username + " has left the group.<br/>");
    else
        $("#messages").append(data.username + " has joined the group.<br/>");
}//prints appropriate message on group join/leave in id="messsages" in groups.html
function coord_message(data){
    if(data.username == localStorage.getItem('username'))
        $("#" + data.username + "x").html('<td>(You) '+ data.username +'</td><td>('+ data.x_coord +','+ data.y_coord +')</td>');
    else
        $("#" + data.username + "x").html('<td>'+ data.username +'</td><td>('+ data.x_coord +','+ data.y_coord +')</td>');

    $("#messages").append(data.username + " has moved their point to (" + data.x_coord + "," + data.y_coord + ").<br/>");
}//changes coordinate of id="(username)x" in groups.html, and adds message to id="messages"
