//this is to create the logger object and export it to other js files for use

var winston = require('winston');
var logger = new (winston.Logger)({
    transports: [
      new (winston.transports.File)({
        'timestamp':true,
        name: 'logs',
        filename: 'logs.txt',
        level: 'info'
        })
    ]
});

module.exports = logger;