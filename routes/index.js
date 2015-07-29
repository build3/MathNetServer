module.exports = function(app) {
//    var express = require('express');
//    var router = express.Router();

    var database_actions = require('../database_actions');

    /* GET home page. */
    app.get('/', function(req, res, next) {
        res.render('index', {title:"Student Login"});
    });

    app.post('/', function(request, response) {
        var student_class = request.body.class_id;
        var student_nick = request.body.nickname;
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
//        database_actions.create_class("d");
//        database_actions.create_groups("d", 4);
    })
}
//module.exports = router;
