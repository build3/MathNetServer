var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.redirect('/index');
});
router.post('/', function(request, response){
    var student_class = request.body.class_id;
    var student_nick = request.body.nickname;
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
