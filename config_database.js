// this has the values that customize the database created in create_database.js
secrets = require('./secrets');
module.exports = {
    'connection': {
        'host': secrets.hosts,
        'user': secrets.user,
        'password': secrets.password
    },
	'database': secrets.database,
    'class_table': secrets.class_table,
    'group_table': secrets.group_table

};
