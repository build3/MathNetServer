var express = require('express');
var router = express.Router();
var head = require('../public/header')
/* GET home page. */
router.get('/', function(req, res, next) {
    res.redirect('/index');
});
router.post('/', function(request, response){
    var student_class = request.body.class_id;
    var student_nick = request.body.nickname;
    if (student_class in Object.keys(head.ds)){
        if(!(student_nick in Object.keys(head.ds[student_class]["user"]))){
            head.ds[student_class]["user"][student_nick]["x"] = 0.0;
            head.ds[student_class]["user"][student_nick]["y"] = 0.0;
            //redirect to main groups page
        }
        else
            //the username is not unique!
    }
    else
        //the class does not exist
    //add these variables into the datastructure
    //redirect to the appropriate class
});
router.get('/class', function(request, response){
    response.redirect('/class');
});
router.get('/groups', function(request, response){
    response.redirect('/groups');
});

module.exports = router;
