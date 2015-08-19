var mysql = require('mysql');
var dbconfig = require('./config_database');

var pool = mysql.createPool({
    connectionLimit : 100,
    host : dbconfig.connection.host,
    user : dbconfig.connection.user,
    password : dbconfig.connection.password,
    database : dbconfig.database,
    debug : false
});

// Creates row in Classes table using class_name
exports.create_class = function(class_name, group_count, callback) {
    var class_id = 0;
    pool.getConnection(function(error, connection) {
        console.log("Creating " + class_name);
        var query = "USE nsf_physics_7;";
        connection.query(query);

        query = "INSERT INTO Classes (class_name) VALUES (?);";
        connection.query(query, [class_name], function(error, rows) {
            if (error) {
                console.log(error);
            }
            else {
                // If the creation of the class was successful,
                //   the callback then gets the class_id
                //   and makes group_count many groups
                query = "SELECT class_id FROM Classes WHERE class_name=?;";
                connection.query(query, [class_name], function(error, rows) {
                    if(error) {
                        console.log(error);
                    }
                    else {
                        class_id = rows[0].class_id;
                        for (var group=1; group < group_count + 1; group++) {
                            query = 
                                "INSERT INTO Groups (group_id, class_id) VALUES (?, ?);"
                            connection.query(query, [group, class_id]);
                        }
                        callback(class_id);
                    }
                });
            }
        });
        connection.release();
    });
    
}

// Creates a group belonging to the class found using class_name
exports.create_group = function(class_id, callback) {
    pool.getConnection(function(error, connection) {
        console.log("Creating a group in " + class_id);

        var query = "USE nsf_physics_7;";
        connection.query(query);
        // Get the class_id and create the groups for that class
        query = 
            "SELECT group_id FROM Groups WHERE class_id=? ORDER BY group_id DESC;";

        // Group IDs are incremented so we need to find out what is
        // the highest id in the Groups table for the specific class
        connection.query(query, [class_id], function(error, rows) {
            if(error) {
                console.log(error);
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
                query = "INSERT INTO Groups (group_id, class_id) VALUES (?, ?);";
                connection.query(query, [group, class_id]);
                callback(group);
            }
        });
        connection.release();
    });
}

// Deletes a group from the Groups table using a provided class id and group id
exports.delete_group = function(class_id, group_id, callback) {
    pool.getConnection(function(error, connection) {
        console.log("Deleteing group " + group_id + " in class " + class_id);
        
        var query = "USE nsf_physics_7;";
        connection.query(query);

        query = "DELETE FROM Groups WHERE class_id=? AND group_id=?;";
        connection.query(query, [class_id, group_id], function(error, rows) {
            if(error) {
                console.log(error);
            }
            else {
                callback();
            }
         });
         connection.release();
    });
}
