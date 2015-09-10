//this is the header file, going to be adding the global datastructure to each page to mess with and add to 
//(maybe only need it in index.js for the routes)

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mysql = require('mysql');
var dbconfig = require('../config_database');
var hash = require('../hashes');

var ids = {}

var connection = mysql.createConnection(dbconfig.connection);
connection.connect();

connection.query("USE " + dbconfig.database);

var available_classes = {};
exports.available_classes = available_classes;

var classQuery = "SELECT * FROM Classes";
connection.query(classQuery, function(err, rows, fields){
    if (err)
        throw err;
    for (var i in rows){
        hash.insert_id_and_hash(rows[i].class_id, rows[i].hashed_id)
        ids[rows[i].class_id] = rows[i].hashed_id;
        available_classes[rows[i].hashed_id] = {}
        available_classes[rows[i].hashed_id]["class_name"] = rows[i].class_name;
        available_classes[rows[i].hashed_id]["user"] = {};
        available_classes[rows[i].hashed_id]["settings"] = {};
    }//creates an array for 
    
});
var groupQuery = "SELECT * FROM Groups";
connection.query(groupQuery, function(err, rows, fields){
    if (err)
        throw err;
    for (var j in rows) {
        var hash = ids[rows[j].class_id];
        if (hash in available_classes) {
            available_classes[hash][rows[j].group_id] = {};
            available_classes[hash][rows[j].group_id]["deleted"] = false;
            available_classes[hash][rows[j].group_id]["students"] = [];
        }
    }
});
//query the database for classes and groups 

connection.end();
