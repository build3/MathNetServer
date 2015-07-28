// this has the values that customize the database created in create_database.js
pw = require('secrets');
module.exports = {
    'connection': {
        'host': 'localhost',
        'user': 'root',
        'password': pw.password
    },
	'database': 'nsf_physics_7',
    'class_table': 'Classes',
    'group_table': 'Groups'

};
