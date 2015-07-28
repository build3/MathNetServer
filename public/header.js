//this is the header file, going to be adding the global datastructure to each page to mess with and add to 
//(maybe only need it in index.js for the routes)


data = require('../datastructure');
var app = require('express')();
var io = require('socket.io')(http);
var mysql = require('mysql');

var connection = mysql.createConnection(dbconfig.connection);
connection.connect();

io.once('connection', function(){
    var classQuery = "SELECT * FROM classes";
    connection.query(classQuery, function(rows, fields){
        for (i in rows){
            data.ds[rows[i].class_id] = {};
        }
    });
    var groupQuery = "SELECT * FROM groups";
    connection.query(groupQuery, function(rows, fields){
        for (i in rows){
            data.ds[rows[i].class_id][rows[i].group_id] = {};
        }
    });
    //query the database for classes and groups 
});