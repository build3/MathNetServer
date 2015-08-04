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
exports.create_class = function(class_name, group_count) {
    pool.getConnection(function(error, connection) {
        console.log("Creating " + class_name);
        var query = "USE nsf_physics_7;";
        connection.query(query);

        query = "INSERT INTO Classes (class_name) VALUES (?);";
        connection.query(query, [class_name], function(error, rows) {
            if (error) {
                console.log("Failed to make class");
            }
            else {
                // If the creation of the class was successful,
                //   the callback then gets the class_id
                //   and makes group_count many groups
                var class_id;
                query = "SELECT class_id FROM Classes WHERE class_name=?;";
                connection.query(query, [class_name], function(error, rows) {
                    if(error) {
                        console.log("Failed to make groups");
                    }
                    else {
                        class_id = rows[0].class_id;
                        for (var group=1; group < group_count + 1; group++) {
                            query = 
                                "INSERT INTO Groups (group_id, class_id) VALUES (?, ?);"
                            connection.query(query, [group, class_id]);
                        }
                    }
                });
            }
        });
        connection.release();
    });
}

// Creates N rows in Groups table where N=group_count
// Groups belong to class found using class_name
exports.create_groups = function(class_name, group_count) {
    pool.getConnection(function(error, connection) {
        console.log("Creating " + group_count + " groups in " + class_name);

        // Get the class_id and create the groups for that class
        var class_id;
        query = "SELECT class_id FROM Classes WHERE class_name=?;";
        connection.query(query, [class_name], function(error, rows) {
            if(!error) {
                class_id = rows[0].class_id;
                for (var group=1; group < group_count + 1; group++) {
                    query = 
                        "INSERT INTO Groups (group_id, class_id) VALUES (?, ?);"
                    connection.query(query, [group, class_id]);
                }
            }
        });
        connection.release();
    });
}
