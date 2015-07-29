//this is the js file for all the client socket calls

 var socket = io.connect();

$("#login").on("click", function(){

    var class_id = document.getElementById('class_id').value;
    var nickname = document.getElementById('nickname').value;
    
    var send_object = {
        logged_in : false,
        username : nickname,
        class_id : class_id
    }
    io.emit('login', send_object);
    console.log("sent object");
    localStorage.setItem('class_id', class_id);
    localStorage.setItem('username', nickname);

});
$(window).on('beforeunload', function(){
    socket.close();
});