"use strict";
//this is to create the logger object and export it to other js files for use

var winston = require('winston');
var logger = new (winston.Logger)({
    transports: [
      new (winston.transports.File)({
        'timestamp': false,
        name: 'logs',
        filename: process.env.LOG_FILE || 'logs.txt',
        level: 'warn',
        formatter: function(options) {
            return (undefined !== options.message ? options.message : '');
        },
        json: false
      })
    ]
});

module.exports = logger;
