/**
 * Creates the main database using names declared in config_database.js
 */

var mysql = require('mysql');
var dbconfig = require('./config_database');

var connection = mysql.createConnection(dbconfig.connection);
connection.connect();

connection.query('CREATE DATABASE ' + dbconfig.database + ';');

connection.query('SET foreign_key_checks = 0;');

/********************************** Item *************************************************/
connection.query('\
                 CREATE TABLE `' + dbconfig.database + '`.`' + dbconfig.class_table + '` ( \
                 `class_id` INT UNSIGNED NOT NULL AUTO_INCREMENT, \
                 `class_name` VARCHAR(40) NOT NULL, \
                 `date_created` DATETIME, \
                 PRIMARY KEY (`class_id`), \
                 UNIQUE INDEX `id_UNIQUE` (`class_id` ASC), \
                 UNIQUE INDEX `class_name` (`class_name` ASC) \
                 )');


/********************************** Perk *************************************************/
connection.query('\
                 CREATE TABLE `' + dbconfig.database + '`.`' + dbconfig.group_table + '` ( \
                 `group_id` INT UNSIGNED NOT NULL, \
                 `class_id` INT UNSIGNED NOT NULL, \
                 `date_created` DATETIME, \
                 PRIMARY KEY (`group_id`, `class_id`), \
                 UNIQUE INDEX `id_UNIQUE` (`group_id` ASC), \
                 FOREIGN KEY (`class_id`) REFERENCES `'+ dbconfig.database +'`.`'+dbconfig.class_table+'`(class_id) \
                 )');



connection.query('SET foreign_key_checks = 1;');

console.log('Success: Database Created!')

connection.end();
