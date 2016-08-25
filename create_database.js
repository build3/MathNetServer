"use strict";
/**
 * Creates the main database using names declared in config_database.js
 */

var mysql = require('mysql');
var dbconfig = require('./config_database');
var connection = mysql.createConnection(dbconfig.connection);
connection.connect();

connection.query('CREATE DATABASE IF NOT EXISTS ' + dbconfig.database + ';');

connection.query('SET foreign_key_checks = 0;');

/********************************** Classes *************************************************/
connection.query('\
                 CREATE TABLE IF NOT EXISTS `' + dbconfig.database + '`.`' + dbconfig.class_table + '` ( \
                 `class_id` INT UNSIGNED NOT NULL AUTO_INCREMENT, \
                 `hashed_id` VARCHAR(8), \
                 `class_name` VARCHAR(40) NOT NULL, \
                 `date_created` DATETIME DEFAULT CURRENT_TIMESTAMP, \
                 PRIMARY KEY (`class_id`), \
                 UNIQUE INDEX `id_UNIQUE` (`class_id` ASC), \
                 UNIQUE INDEX `class_name` (`class_name` ASC) \
                 )');


/********************************** Groups *************************************************/
connection.query('\
                 CREATE TABLE IF NOT EXISTS `' + dbconfig.database + '`.`' + dbconfig.group_table + '` ( \
                 `group_id` INT UNSIGNED NOT NULL, \
                 `class_id` INT UNSIGNED NOT NULL, \
                 `date_created` DATETIME DEFAULT CURRENT_TIMESTAMP, \
                 PRIMARY KEY (`group_id`, `class_id`), \
                 FOREIGN KEY (`class_id`) REFERENCES `'+ dbconfig.database +'`.`'+dbconfig.class_table+'`(class_id) \
                 ON DELETE CASCADE \
                 )');

/********************************** ToolBars *************************************************/
connection.query('\
                 CREATE TABLE IF NOT EXISTS `' + dbconfig.database + '`.`' + dbconfig.toolbar_table + '` ( \
                 `toolbar_id` INT UNSIGNED NOT NULL AUTO_INCREMENT, \
                 `toolbar_name` VARCHAR(40) NOT NULL, \
                 `tools` VARCHAR(100) NOT NULL, \
                 `class_id` INT UNSIGNED NOT NULL, \
                 `date_created` DATETIME DEFAULT CURRENT_TIMESTAMP, \
                 PRIMARY KEY (`toolbar_id`), \
                 FOREIGN KEY (`class_id`) REFERENCES `'+ dbconfig.database +'`.`'+dbconfig.class_table+'`(class_id) \
                 ON DELETE CASCADE \
                 )');

connection.query('SET foreign_key_checks = 1;');

console.log('Success: Database Created!')

connection.end();
