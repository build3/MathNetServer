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
    describe('#login()', function() {
        it('Should join a class', function(done) {
            var client = io_client.connect(socket_url, options);

            client.on('connect', function(data) {
                client.emit('login', student1.username, 1);
            });

            client.on('login_response', function(data) {
                data.username.should.equal(student1.username);
                data.class_id.should.equal(1);
                client.disconnect();
                done();
            });
        });
    });
})
