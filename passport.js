// config/passport.js

// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;

// load up the user model
var mysql = require('mysql');
var dbconfig = require('./config_database');
var connection = mysql.createConnection(dbconfig.connection);

connection.query('USE ' + dbconfig.database);
// expose this function to our app using module.exports
module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session (add to global var)
    passport.serializeUser(function(user, done) {
        done(null, user.userid);
    });

    // used to deserialize the user 
    passport.deserializeUser(function(id, done) {
        //remove the user from the global variable here
            
            done(err, rows[0]);
        });
    

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use(
        'local-login',
        new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            classField : 'class_id',
            usernameField : 'username',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, class_id, username, done) { // callback with email and password from our form
            connection.query("SELECT * FROM classes WHERE class_id = ?",[class_id], function(err, rows){
                if (err)
                    return done(err);
                if (!rows.length) {
                    return done(null, false, req.flash('loginMessage', 'No class found.')); // req.flash is the way to set flashdata using connect-flash
                }

                //here you add the check for a unique user id (in comparison to others in your class at that moment)

                // all is well, return successful user
                return done(null, rows[0]);
            });
        })
    );
}
