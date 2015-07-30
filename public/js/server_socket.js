//this will contain the server side socket commnication

var socket = io.connect('http://localhost:8888');
var head = require('../header');

io.on('login', function(data){
    console.log(data);
    if (data.class_id in Object.keys(head.ds)){
        if(!(data.username in Object.keys(head.ds[student_class]["user"]))){
            head.ds[data.class_id]["user"][data.username]["x"] = 0.0;
            head.ds[data.class_id]["user"][data.username]["y"] = 0.0;
            var response = {
                logged_in : true,
                username : data.username,
                class_id : data.class_id
            }
            
            //redirect to main groups page
        }
        var response = {
            logged_in : false,
            error_message : 'Username already taken.'
        }
        //the username is not unique!
    }
    var response = {
        logged_in : false,
        error_message : 'Class ID does not exist'
    }
    //the class does not exist
    socket.emit('login_response', response);
})