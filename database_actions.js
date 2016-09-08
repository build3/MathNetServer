"use strict";
var mysql = require('mysql');
var Q = require("q");
var dbconfig = require('./config_database');

var pool = mysql.createPool({
    connectionLimit : 100,
    host : dbconfig.connection.host,
    user : dbconfig.connection.user,
    password : dbconfig.connection.password,
    database : dbconfig.database,
    debug : false
});

exports.create_user = function(user_name, password)
{
    var deferred = Q.defer();

    pool.getConnection(function(error, connection){

        var query = "USE " + dbconfig.database + ";"; 
        connection.query(query);



        query = "INSERT INTO " + dbconfig.admin_table + " (user_name, password) VALUES (?, ?);";
        connection.query(query, [user_name, password], function(error, rows) {

            if(error){
                deferred.reject(error);
            }
            else
            {
                deferred.resolve();
            }
        });

    connection.release();
    });

    return deferred.promise;
}

exports.create_session = function(admin_id, password)
{
    var deferred = Q.defer();

    pool.getConnection(function(error, connection){

        var query = "USE " + dbconfig.database + ";"; 
        connection.query(query);


        var time = new Date();

        query = "INSERT INTO " + dbconfig.session_table + " (admin_id, password, last_updated) VALUES (?, ?, ?);";
        connection.query(query, [admin_id, password, time], function(error, rows) {

            if(error){
                deferred.reject(error);
            }
            else
            {
                deferred.resolve();
            }
        });

    connection.release();
    });

    return deferred.promise;
}

exports.update_time = function(admin_id)
{
    var deferred = Q.defer();

    pool.getConnection(function(error, connection){

        var query = "USE " + dbconfig.database + ";"; 
        connection.query(query);


        var time = new Date();

        query = "UPDATE " + dbconfig.session_table + " SET last_updated=? WHERE admin_id=?;";
        connection.query(query, [time, admin_id], function(error, rows) {

            if(error){
                deferred.reject(error);
            }
            else
            {
                deferred.resolve();
            }
        });

    connection.release();
    });

    return deferred.promise;
}
// Creates row in Classes table using class_name
exports.create_class = function(class_name, group_count, admin_id) {
    var deferred = Q.defer();

    var class_id = 0;
    pool.getConnection(function(error, connection) {
        var query = "USE " + dbconfig.database + ";";
        connection.query(query);

        query = "INSERT INTO " + dbconfig.class_table + " (class_name, admin_id) VALUES (?, ?);";
        connection.query(query, [class_name, admin_id], function(error, rows) {
            if (error) {
                if(error["code"] == "ER_DUP_ENTRY")
                    deferred.reject('Duplicate Entry');
                else
                    deferred.reject(error);
            }
            else {
                // If the creation of the class was successful,
                //   the callback then gets the class_id
                //   and makes group_count many groups
                query = "SELECT class_id FROM " + dbconfig.class_table + " WHERE class_name=?;";
                connection.query(query, [class_name], function(error, rows) {
                    if(error) {
                        deferred.reject(error);
                    }
                    else {
                        class_id = rows[0].class_id;
                        for (var group=1; group < group_count + 1; group++) {
                            query = 
                                "INSERT INTO " + dbconfig.group_table + " (group_id, class_id) VALUES (?, ?);"
                            connection.query(query, [group, class_id]);
                        }
                        deferred.resolve(class_id);
                    }
                });
            }
        });
        connection.release();
    });

    return deferred.promise;
    
}

// Creates a group belonging to the class found using class_name
exports.create_group = function(class_id) {
    var deferred = Q.defer();

    pool.getConnection(function(error, connection) {

        var query = "USE " + dbconfig.database + ";";
        connection.query(query);
        // Get the class_id and create the groups for that class
        query = 
            "SELECT group_id FROM " + dbconfig.group_table + " WHERE class_id=? ORDER BY group_id DESC;";

        // Group IDs are incremented so we need to find out what is
        // the highest id in the Groups table for the specific class
        connection.query(query, [class_id], function(error, rows) {
            if(error) {
                deferred.reject(error);
            }
            else {
                var group;
                // Insert a new group row using the next highest group id
                if(rows.length > 0) {
                    group = parseInt(rows[0].group_id) + 1;
                }
                else {
                    group = 1;
                }
                query = "INSERT INTO " + dbconfig.group_table + " (group_id, class_id) VALUES (?, ?);";
                connection.query(query, [group, class_id]);
                
                deferred.resolve(group);
            }
        });
        connection.release();
    });

    return deferred.promise;
}

//Creates a toolbar belonging to the class 
exports.create_toolbar = function(class_id, toolbar_name, tools) {
   //  console.log("create_toolbar");
    var deferred = Q.defer();

    pool.getConnection(function(error, connection) {

        var query = "USE " + dbconfig.database + ";";
        connection.query(query);
        // Get the class_id and create the groups for that class

                
        query = "INSERT INTO " + dbconfig.toolbar_table + " (class_id, toolbar_name, tools) VALUES (?, ?, ?);";

        connection.query(query, [class_id, toolbar_name, tools], function(error, rows) {
            if(error){
                deferred.reject(error);
            }
            else
            {
                deferred.resolve();
            }
        });
        
        //deferred.resolve(toolbar);


    connection.release();
    });

    return deferred.promise;
}


// Deletes a group from the Groups table using a provided class id and group id
exports.delete_group = function(class_id, group_id) {
    var deferred = Q.defer();

    pool.getConnection(function(error, connection) {
        
        var query = "USE " + dbconfig.database + ";";
        connection.query(query);

        query = "DELETE FROM " + dbconfig.group_table + " WHERE class_id=? AND group_id=?;";
        connection.query(query, [class_id, group_id], function(error, rows) {
            if(error) {
                deferred.reject(error);
            }
            else {
               deferred.resolve(); ;
            }
         });
         connection.release();
    });

    return deferred.promise;
}

// Deletes a group from the Groups table using a provided class id and group id
exports.delete_session = function(admin_id) {
    var deferred = Q.defer();

    pool.getConnection(function(error, connection) {
        
        var query = "USE " + dbconfig.database + ";";
        connection.query(query);

        query = "DELETE FROM " + dbconfig.session_table + " WHERE admin_id=?;";
        connection.query(query, admin_id, function(error, rows) {
            if(error) {
                deferred.reject(error);
            }
            else {
               deferred.resolve(); ;
            }
         });
         connection.release();
    });

    return deferred.promise;
}

// Deletes a toolbar using the provided class id and tools
exports.delete_toolbar = function(class_id, toolbar_name) {
    var deferred = Q.defer();

    console.log(toolbar_name);
    pool.getConnection(function(error, connection) {
        
        var query = "USE " + dbconfig.database + ";";
        connection.query(query);

        query = "DELETE FROM " + dbconfig.toolbar_table + " WHERE class_id=? AND toolbar_name=?;";
        connection.query(query, [class_id, toolbar_name], function(error, rows) {
            if(error) {
                deferred.reject(error);
            }
            else {
               deferred.resolve(); ;
            }
         });
         connection.release();
    });

    return deferred.promise;
}


// Updates the Class table to add hashed id to class row
exports.add_hashed_id = function(class_id, hashed_id) {
    var deferred = Q.defer();

    pool.getConnection(function(error, connection) {

        var query = "USE " + dbconfig.database + ";";
        connection.query(query);

        query = "UPDATE " + dbconfig.class_table + " SET hashed_id=? WHERE class_id=?;";
        connection.query(query, [hashed_id, class_id], function(error, rows) {
            if(error) {
                deferred.reject(error);
            }
            else {
                deferred.resolve();
            }
        });
        connection.release();
    });

    return deferred.promise;
}

//Returns the Classes and their hashed IDs (from the Class table)
exports.get_classes = function(admin_id){
    var deferred = Q.defer();
    
    pool.getConnection(function(error, connection) {

        var query = "USE " + dbconfig.database + ";";
        connection.query(query);

        if(admin_id == null)
            query = "SELECT hashed_id, class_name FROM " + dbconfig.class_table + ";";
        else
            query = "SELECT hashed_id, class_name FROM " + dbconfig.class_table + " WHERE admin_id=?;";
        
        connection.query(query, admin_id, function(error, rows) {
            if(error) {
                deferred.reject(error);
            }
            else {
                deferred.resolve(rows);
            }
        });
        connection.release();
    });

    return deferred.promise;
}

//Returns the TOOLBARS and their hashed IDs (from the Class table)
exports.get_toolbars = function(class_id){
    var deferred = Q.defer();
    
    pool.getConnection(function(error, connection) {

        var query = "USE " + dbconfig.database + ";";
        connection.query(query);

        query = "SELECT toolbar_name, tools FROM " + dbconfig.toolbar_table + " WHERE class_id=?;" ;
        connection.query(query, class_id, function(error, rows) {
            if(error) {
                deferred.reject(error);
            }
            else {
                deferred.resolve(rows);
            }
        });
        connection.release();
    });

    return deferred.promise;
}

exports.check_user = function(username, password){
    var deferred = Q.defer();

    pool.getConnection(function(error, connection){

        var query = "USE " + dbconfig.database + ";";
        connection.query(query);

        query = "SELECT password, admin_id FROM " + dbconfig.admin_table + " WHERE user_name = ?;" ;

        connection.query(query, username, function(error, rows) {
            if(error) {
                deferred.reject(error);
            }
            else {
                deferred.resolve(rows);
            }
        });
        connection.release();
    });

    return deferred.promise;
}

exports.check_session = function(admin_id, password){
    var deferred = Q.defer();

    pool.getConnection(function(error, connection){

        var query = "USE " + dbconfig.database + ";";
        connection.query(query);

        query = "SELECT password, last_updated FROM " + dbconfig.session_table + " WHERE admin_id = ?;" ;

        connection.query(query, admin_id, function(error, rows) {
            if(error) {
                deferred.reject(error);
            }
            else {
                deferred.resolve(rows);
            }
        });
        connection.release();
    });

    return deferred.promise;
}

//Deletes the hash and all its membors from the database
exports.delete_class = function(class_id) {       
    var deferred = Q.defer();

    pool.getConnection(function(error, connection) {
        
        var query = "USE " + dbconfig.database + ";";
        connection.query(query);

        query = "DELETE FROM " + dbconfig.class_table + " WHERE class_id=?;"; //+ "DELETE * FROM " + dbconfig.group_table + " WHERE class_id=?;";
        connection.query(query, class_id, function(error, rows) {
            if(error) {
                deferred.reject(error);
            }
            else {
               deferred.resolve(); ;
            }
         });
         connection.release();
    });

    return deferred.promise;
}
