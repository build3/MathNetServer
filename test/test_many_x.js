
var should = require('should');
io = require('socket.io-client');
async = require('async');

var clients = new Array(200);
var response_count = 0, num_times = 8, num_clients = clients.length;
var class_name = '7p442cq3', num_groups = 10

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

                client.emit('login', i, class_name);
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
                var group_num = (i % num_groups) + 1;
                client.on('group_leave_response', function(data){
                    //console.log("group_leave_response");
                    count2++;
                    if(count2 == 1){
                        finish();
                    } else {
                        client.emit('group_join', i, class_name, group_num);
                    }
                });
                client.on('group_join_response', function(data){
                    for(j = 0; j < num_times; j++){
                        //console.log("made it to join resp");
                        client.emit('coordinate_change', i, class_name, group_num, 1, 0);      
                    }
                });
                client.on('coordinate_change_response', function(data){
                    count++;
                    if(count == num_times){
                        client.emit('group_leave', i, class_name, group_num);
                    }
                });
                
                client.emit('group_join', i, class_name, group_num); 
            }, function(err){
                if (err){
                    console.log(err);
                } else {
                    done();
                }
            });
        });
    });
});
