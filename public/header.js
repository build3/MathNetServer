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

// var classQuery = "SELECT * FROM classes";
// connection.query(classQuery, function(rows, fields){
//     for (i in rows){
//         data.ds[i.class_id][i.class_name] = i.class_name;
//         data.ds[i.class_id]["user"] = {};
//     }//creates an array for 
// });
// var groupQuery = "SELECT * FROM groups";
// connection.query(groupQuery, function(rows, fields){
//     for (j in rows){
//         if (j.class_id in Object.keys(data.ds)){
//             data.ds[j.class_id][j.group_id]["deleted"] = false;
//         }
//     }
// });

    //query the database for classes and groups 


exports.ds = data.ds;
connection.end();