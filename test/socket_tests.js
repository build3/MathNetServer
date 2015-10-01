var io_client = require('socket.io-client');
var should = require('should'); 

var socket_url = 'http://0.0.0.0:8888';

var options = {
    transports: ['websocket'],
    'force new connection': true
};

var student1 = {'username': 'Paul'};
var student2 = {'username': 'Jimmy'};
var student3 = {'username': 'Anton'};

describe("Socket.io Tests", function() {
    
    
    // Test login
    describe('#login() & logout()', function() {
    
        it('Should login and logout of a class', function(done) {

            var client1 = io_client.connect(socket_url, options);

            client1.on('connect', function(data) {
                client1.emit('login', student1.username, 1);
            });

            client1.on('login_response', function(data) {
                data.username.should.equal(student1.username);
                data.class_id.should.equal(1);
                client1.emit('logout', student1.username, 1);
            });
            
            client1.on('logout_response', function(data) {
                client1.disconnect();
                done();
            });

        });
    });

    // Test groups_get
    describe('#groups_get', function() {
        it('Should get all the groups in a class', function(done) {
            var client1 = io_client.connect(socket_url, options);
            
            client1.on('connect', function(data) {
                client1.emit('login', student1.username, 1);
            });
            
            client1.on('login_response', function(data) {
                client1.emit('groups_get', student1.username, 1);
            });
            
            client1.on('groups_get_response', function(data) {
                data.username.should.equal(student1.username);
                data.class_id.should.equal(1);
                data.groups.length.should.equal(3);
                client1.disconnect();
                done();
            });

        });

        it('Client1 should get group_get_response when client2 gets the groups', function(done) {
            
            var client1 = io_client.connect(socket_url, options);
           
            client1.on('connect', function(data) {
                client1.emit('login', student1.username, 1);
            });

            client1.on('login_response', function(data) {
                data.username.should.equal(student1.username);
                data.class_id.should.equal(1);
                client1.emit('groups_get', student1.username, 1);
                
                var client2 = io_client.connect(socket_url, options);
 
                client2.on('connect', function(data) {
                    client2.emit('login', student2.username, 1);
                });

                client2.on('login_response', function(data) {
                    data.username.should.equal(student2.username);
                    data.class_id.should.equal(1);
                    client2.emit('groups_get', student2.username, 1);
                });

                client2.on('groups_get_response', function(data) {
                    data.username.should.equal(student2.username);
                    data.class_id.should.equal(1);
                    data.groups.length.should.equal(3);
                    client2.disconnect();
                });

            });        

            var group_get_count = 0;
            client1.on('groups_get_response', function(data) {
                group_get_count += 1;
                
                if(group_get_count == 2) {
                    data.username.should.equal(student2.username);
                    data.class_id.should.equal(1);
                    data.groups.length.should.equal(3);
                    client1.disconnect();
                    done();
                }
            });
        });
    });
    
    // Test group_join & group_leave
    describe('#group_join & group_leave', function() {
    
        it('Should join and leave a class group', function(done) {

            var client1 = io_client.connect(socket_url, options);

            client1.on('connect', function(data) {
                client1.emit('login', student1.username, 1);
            });

            client1.on('login_response', function(data) {
                data.username.should.equal(student1.username);
                data.class_id.should.equal(1);
                client1.emit('group_join', student1.username, 1, 1);
            });
            
            client1.on('group_join_response', function(data) {
                data.username.should.equal(student1.username);
                data.class_id.should.equal(1);
                data.group_id.should.equal(1);
                client1.emit('group_leave', student1.username, 1, 1);
            });

            client1.on('group_leave_response', function(data) {
                data.username.should.equal(student1.username);
                data.class_id.should.equal(1);
                data.group_id.should.equal(1);
                client1.emit('logout', student1.username, 1);
            });

            client1.on('logout_response', function(data) {
                client1.disconnect();
                done();
            });
        });
    });

});
