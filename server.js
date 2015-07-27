// Will run on 8888 for now
var PORT = 8888;

var express = require('express');
var app = express();

// Using Handlebars.js for now
var hbs = require('hbs');

// Tells Express to treat HTML as dynamic
app.set('view engine', 'html');

// Load engine
app.engine('html', hbs.__express);

// Home page will be admin panel for now
app.get('/', function(request, response) {
    response.render('admin', {title:"Admin Panel"});
});

// Start listening
app.listen(PORT);
