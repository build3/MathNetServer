module.exports = function(app) {
//    var express = require('express');
//    var router = express.Router();
   
    /* GET home page. */
    app.get('/', function(req, res, next) {
        res.render('student', {title:"Student Page"});
    });

    app.get('/admin', function(request, response) {
        response.render('admin', {title:"Admin Panel"});
    })
}
//module.exports = router;
