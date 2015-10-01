
var should = require('should');
io = require('socket.io-client');

clients = new Array(100);
count = 0, response_count = 0, num_times = 25000;
var socketURL = "localhost:8888";
describe('testing steps', function(){
    this.slow(0);
    this.timeout(10000);
    before(function(){
        for(i = 0; i < clients.length; i++){
            clients[i] = io.connect(socketURL);
            clients[i].on('connect', function(){
                count++;
            });
        }
        
    });
    after(function(){
        for(i = 0; i < clients.length; i++){
            clients[i].disconnect
        }
        
    })
    describe('setup', function(){
        it('should connect all clients before running tests', function(){
            if(count == clients.length){
                count.should.equal(clients.length);
                count = 0;

            }
        });
    });
    describe('login', function(){
        it('should login all clients successfully', function(){     
            for(i = 0; i < clients.length; i++){
                clients[i].emit('login', i, 1);
                clients[i].on('login', function(data){
                    count++;
                });
                clients[i].on('login_response', function(data){
                    response_count++;
                });
            }
            if(count == clients.length){
                count.should.equal(response_count);
                count = 0;
                response_count = 0;
                
            }
        });
    });
    describe('join/leave group', function(){
        it('all clients join and leave a group successfully num_times times', function(){
            for(i = 0; i < clients.length; i++){
                for(j = 0; j < 10; j++){
                    clients[i].emit('group_join', i, 1, 1);
                    clients[i].on('group_join_response', function(data){
                        
                        clients[i].emit('group_leave', i, 1, 1);
                    });

                    clients[i].on('group_leave_response', function(data){
                        count++;
                    });
                }
            }
            if(count == clients.length * num_times){
                count.should.equal(clients.length * num_times);
                count = 0;
                
            }
        });
    });
    describe('coordinate change', function(){
        it('each client moves points num_times times', function(){
            for(i = 0; i < clients.length; i++){
                clients[i].emit('group_join', i, 1, 1);
                clients[i].on('group_join_response', function(data){
                    for(j = 0; j < num_times; j++){
                        clients[i].emit('coordinate_change', i, 1, 1, 1, 0);    
                        clients[i].on('coordinate_change_response', function(data){
                            count++;
                        });
                    }
                });
                clients[i].emit('group_leave', i, 1, 1);
                clients[i].on('group_leave_response');   
            }
            if(count == clients.length * num_times){
                count.should.equal(clients.length * num_times);
                count = 0;
                
            }
        });
    });
    describe('class create', function(){
        it('each client creates one class', function(){
            for (i = 0; i < clients.length; i++){
                clients[i].emit('add-class', i+3, 3, "ucd_247");
                clients[i].on('add-class-response', function(data){
                    count++;
                });
            }
            if(count == clients.length){
                count.should.equal(clients.length);
                
            }
        });
    });
    describe('class group add', function(){
        it('each client adds x groups', function(){
            for (i = 0; i < clients.length; i++){
                for (j = 0; j < 10; j++){
                    clients[i].emit('add-group', i+3,  "ucd_247");
                    clients[i].on('add-group-response', function(data){
                        count++;
                        
                    });
                }
            }
            if(count == (clients.length * 10)){
                count.should.equal(clients.length * 10);
                
            }
        });
    });
    describe('class group delete', function(){
        it('each client deletes x groups', function(){
            for (i = 0; i < clients.length; i++){
                for (j = 10; j > 0; j--){
                    clients[i].emit('delete-group', i+3, j+3, "ucd_247");
                    clients[i].on('add-delete-response', function(data){
                        count++;
                    });
                }
            }
            if(count == (clients.length * 10)){
                count.should.equal(clients.length * 10);
                
            }
        });
    });
});
