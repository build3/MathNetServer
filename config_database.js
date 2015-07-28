// this has the values that customize the database created in create_database.js
secrets = require('./secrets');
module.exports = {
    'connection': {
        'host': secrets.host,
        'user': secrets.user,
        'password': secrets.password
    },
	'database': 'nsf_physics_7',
    'class_table': 'Classes',
    'group_table': 'Groups'

};
