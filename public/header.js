//this is the header file, going to be adding the global datastructure to each page to mess with and add to 
//(maybe only need it in index.js for the routes)


var data = require('../datastructure');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mysql = require('mysql');
var dbconfig = require('../config_database');

var connection = mysql.createConnection(dbconfig.connection);
connection.connect();

connection.query("USE " + dbconfig.database);
exports.ds = data.ds;

var classQuery = "SELECT * FROM classes";
connection.query(classQuery, function(err, rows, fields){
    if (err)
        throw err;
    for (var i in rows){
        data.ds[rows[i].class_id] = {}
        data.ds[rows[i].class_id]["class_name"] = rows[i].class_name;
        data.ds[rows[i].class_id]["user"] = {};
    }//creates an array for 
    
});
var groupQuery = "SELECT * FROM groups";
connection.query(groupQuery, function(err, rows, fields){
    if (err)
        throw err;
    for (var j in rows){
        if (rows[j].class_id in data.ds) {
            data.ds[rows[j].class_id][rows[j].group_id] = {};
            data.ds[rows[j].class_id][rows[j].group_id]["deleted"] = false;
            data.ds[rows[j].class_id][rows[j].group_id]["students"] = [];
        }
    }
});

    //query the database for classes and groups 



connection.end();