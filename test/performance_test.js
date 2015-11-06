
var should = require('should');
io = require('socket.io-client');

var clients = new Array(100);
count = 0, response_count = 0, num_times = 250;

var socketURL = "http://localhost:8888";
var options = {
    transports: ['websocket'],
    'force new connection': true
};

describe('testing steps', function(){
    this.slow(0);
    this.timeout(10000);
    beforeEach(function(done){
        for(i = 0; i < clients.length; i++){
            clients[i] = io.connect(socketURL, options);    
        }

        i.should.equal(clients.length);
        done();
    }); //should connect all clients before each test

    afterEach(function(done){
        for(i = 0; i < clients.length; i++){
            clients[i].disconnect();
        }
        i.should.equal(clients.length);
        done();
    })//disconnects all clients aftereach test

    describe('login', function(){
        it('should login all clients successfully', function(done){ 
            for(i = 0; i < clients.length; i++){
                clients[i].on('login', function(data){
                    count.should.equal(i); //never gets checked right now -- need to make sure that the sockets are catching stuff
                    count++;
                });
                clients[i].on('login_response', function(data){
                    response_count.should.equal(i);
                    response_count++;
                });
                clients[i].emit('login', i, 1);
            }

            if(i == clients.length){
                console.log("diditdoit?" + count + response_count);
                setTimeout(function(){
                    count.should.equal(response_count);
                    count = 0;
                    response_count = 0;
                    done();
                }, 2000);  
            }   
        });
    });

    describe('join/leave group', function(){
        it('all clients join and leave a group successfully num_times times', function(done){
            for(i = 0; i < clients.length; i++){
                clients[i].on('group_join_response', function(data){
                        
                    clients[i].emit('group_leave', i, 1, 1);
                });

                clients[i].on('group_leave_response', function(data){
                    count++;
                });
                clients[i].on('login_response', function(data){
                    for(j = 0; j < 1; j++){
                        clients[i].emit('group_join', i, 1, 1); 
                    }
                });
                clients[i].emit('login', i, 1);
            }
            
            if(i == clients.length){
                console.log("it works!");
                setTimeout(function(){
                    count.should.equal(clients.length * num_times);
                    count = 0;
                    done();
                }, 2000);  
            }
        });
    });

    describe('coordinate change', function(){
        it('each client moves points num_times times', function(done){
            for(i = 0; i < clients.length; i++){
                clients[i].emit('group_join', i, 1, 1);
                clients[i].on('coordinate_change_response', function(data){
                    count++;
                    count.should.equal(1);
                    console.log("idk");
                });
                clients[i].on('group_join_response', function(data){
                    for(j = 0; j < num_times; j++){
                        clients[i].emit('coordinate_change', i, 1, 1, 1, 0);      
                    }
                });
                clients[i].emit('group_leave', i, 1, 1);
                clients[i].on('group_leave_response');   
            }
            
            if(i == clients.length){
                setTimeout(function(){
                    count.should.equal(clients.length * num_times);
                    count = 0;
                    console.log("yaaaa");
                    done();
                }, 2000); 
            }
        });
    });

    describe('class create', function(){
        it('each client creates one class', function(done){
            for (i = 0; i < clients.length; i++){
                clients[i].on('add-class-response', function(data){
                    count++;
                });
                clients[i].emit('add-class', i+3, 3, "ucd_247");
            }
            
            if(i == clients.length){
                setTimeout(function(){
                    count.should.equal(clients.length);
                    done();
                }, 2000);
            }
        });
    });

    describe('class group add', function(){
        it('each client adds x groups', function(done){
            for (i = 0; i < clients.length; i++){
                clients[i].on('add-group-response', function(data){
                    count++;
                });
                for (j = 0; j < 10; j++){
                    clients[i].emit('add-group', i+3,  "ucd_247");
                }
            }
            
            if(i == clients.length){
                setTimeout(function(){
                    count.should.equal(clients.length * 10);
                    done();  
                }, 2000);                
            }
        });
    });
    
    describe('class group delete', function(){
        it('each client deletes x groups', function(done){
            for (i = 0; i < clients.length; i++){
                clients[i].on('add-delete-response', function(data){
                    count++;
                });
                for (j = 10; j > 0; j--){
                    clients[i].emit('delete-group', i+3, j+3, "ucd_247");  
                }
            }
            
            if(i == clients.length){
                setTimeout(function(){
                    count.should.equal(clients.length * 10);
                    done();
                }, 2000);
            } 
        });
    });
});
