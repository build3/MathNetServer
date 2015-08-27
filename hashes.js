var Q = require('q');

var hashes = {};

exports.add_hash = function(class_id) {
    var deferred = Q.defer();
    var hash = Math.random().toString(36).substr(2, 8).toLowerCase();   
    hashes[hash] = class_id;
    
    deferred.resolve(hash);
    return deferred.promise;
}

exports.remove_hash = function(hash) {
    var deferred = Q.defer();

    delete hashes[hash];
    deferred.resolve();
    return deferred.promise;
}

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
