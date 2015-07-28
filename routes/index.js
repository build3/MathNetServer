module.exports = function(app) {
//    var express = require('express');
//    var router = express.Router();
    var head = require('../public/header');
    /* GET home page. */
    app.get('/', function(req, res, next) {
        res.render('index', {title:"Student Login"});
    });

    app.post('/', function(request, response) {
        var student_class = request.body.class_id;
        var student_nick = request.body.nickname;
        if (student_class in Object.keys(head.ds)){
            if(!(student_nick in Object.keys(head.ds[student_class]["user"]))){
                head.ds[student_class]["user"][student_nick]["x"] = 0.0;
                head.ds[student_class]["user"][student_nick]["y"] = 0.0;
                //redirect to main groups page
            }
            //the username is not unique!
        }
        //the class does not exist
    //add these variables into the datastructure
    //redirect to the appropriate class
        //add these variables into the datastructure
        //redirect to the appropriate class
    });

    app.get('/class', function(request, response) {
        response.render('class', {title:"Class Page"});
    });

    app.get('/groups', function(request, response) {
        response.render('groups', {title:"Group Page"});
    });

    app.get('/admin', function(request, response) {
        response.render('admin', {title:"Admin Panel"});
    })
}
//module.exports = router;
