// Will run on 8888 for now
var PORT = 8888;
var STATIC_FILES = "public";

// Express will be the server framework
// Using Handlebars.js for dynamic HTML
var express = require('express');
var app = express();
var hbs = require('hbs');

// Tells Express to treat HTML as dynamic
app.set('view engine', 'html');
app.engine('html', hbs.__express);

// Holds the current path information
// Routes Express server to serve static files
var path = require('path');
app.use(express.static(path.join(__dirname, STATIC_FILES)));

// Home page will be admin panel
app.get('/', function(request, response) {
    response.render('admin', {title:"Admin Panel"});
});

app.listen(PORT);
