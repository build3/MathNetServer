var Q = require('q');

// Holds the hashed strings which act as class ids
var hashes = {};

// Creates a hash that is added to JSON object
exports.add_hash = function(class_id) {
    var deferred = Q.defer();
    var hash = Math.random().toString(36).substr(2, 8).toLowerCase();   
    hashes[hash] = class_id;
    
    deferred.resolve(hash);
    return deferred.promise;
}

// Removes hash from the JSON object
exports.remove_hash = function(hash) {
    var deferred = Q.defer();

    delete hashes[hash];
    deferred.resolve();
    return deferred.promise;
}

// Finds class id based off hash
exports.find_id = function(hash) {
    var deferred = Q.defer();

    if (hash in hashes) {
        deferred.resolve(hashes[hash]);
    }
    else {
        deferred.reject("Class ID does not exist");
    }

    return deferred.promise;
}
