var hashes = {};

exports.add_hash = function(class_id, callback) {
    var hash = Math.random().toString(36).substr(2, 8).toLowerCase();   
    hashes[hash] = class_id;
    return hash;
}

exports.remove_hash = function(hash, callback) {
    delete hashes[hash];
}

exports.find_id = function(hash, callback) {
    if (hash in hashes) {
        callback(hashes[hash]);
    }
    else {
        callback(-1);
    }
}
