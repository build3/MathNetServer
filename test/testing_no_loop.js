
var should = require('should');
io = require('socket.io-client');
async = require('async');

clients = new Array(100);
response_count = 0, num_times = 8, num_clients = clients.length;

var socketURL = "http://localhost:8888";
var options = {
    transports: ['websocket'],
    'force new connection': true
};
for(i = 0; i < num_clients; i++){
    clients[i] = io.connect(socketURL, options);    
}

//console.log('connecting all of the clients before tests');

describe('testing steps', function(){
    this.slow(0);
    this.timeout(60000);
    
    describe('login', function(){
        it('should login all clients successfully', function(done){ 
            async.forEachOf(clients, function(client, i, finish){
                
                client.on('login_response', function(data){
                    finish()
                });

                client.emit('login', i, 1);
            }, function(err){
                if (err){

                } else {
                    done();
                }
            }); 
        });
    });
    
    describe('join/leave group + coord change', function(){
        it('all clients join and leave a group successfully num_times times', function(done){
            async.forEachOf(clients, function(client, i, finish){
                var count = 0, count2 = 0;
                client.on('group_leave_response', function(data){
                    //console.log("group_leave_response");
                    count2++;
                    if(count2 == 1){
                        finish();
                    } else {
                        client.emit('group_join', i, 1, 1);
                    }
                });
                client.on('group_join_response', function(data){
                    for(j = 0; j < num_times; j++){
                        //console.log("made it to join resp");
                        client.emit('coordinate_change', i, 1, 1, 1, 0);      
                    }
                });
                client.on('coordinate_change_response', function(data){
                    count++;
                    if(count == num_times){
                        client.emit('group_leave', i, 1, 1);
                    }
                });
                
                client.emit('group_join', i, 1, 1); 
            }, function(err){
                if (err){
                    console.log(err);
                } else {
                    done();
                }
            });
        });
    });
    
    
    
    describe('class create', function(){
        it('each client creates one class', function(done){
            var count = 0;
            async.forEachOf(clients, function(client, i, finish){
                client.on('add-class-response', function(data){
                    count++;
                    finish();
                });
                client.emit('add-class', i+4, 3, "ucd_247");
            }, function(err){
                if (err){

                } else {
                    done();
                }
            });
        });
    });
    
    describe('class group add', function(){
        it('each client adds x groups', function(done){
            async.forEachOf(clients, function(client, i, finish){
                var count = 0;
                client.on('add-group-response', function(data){
                    count++;
                    finish();
                });
                for (j = 0; j < 1; j++){
                    client.emit('add-group', 3,  "ucd_247");
                }
            }, function(err){
                if (err){

                } else {
                    done();
                }
            });
        });
    });
    
    describe('class group delete', function(){
        it('each client deletes x groups', function(done){
            async.forEachOf(clients, function(client, i, finish){
                var count = 0;
                client.on('delete-group-response', function(data){
                    //console.log("delete-group-response received");
                    count++;
                    finish();
                });
                for (j = 1; j > 0; j--){
                    client.emit('delete-group', 3, j+3, "ucd_247");  
                }
            }, function(err){
                if (err){

                } else {
                    done();
                }
            });
        });
    });
});
