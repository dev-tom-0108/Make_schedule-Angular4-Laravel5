var server = require('http').Server();

var io = require('socket.io')(server);

var Redis = require('ioredis');
var redis = new Redis();

redis.subscribe('notification-channel');

redis.on('message', function (channel, message) {
    console.log(channel, message);
    // 3. Use socket.io to emit to all clients.

    message = JSON.parse(message);
    io.emit(channel, message.data); // test-channel:UserSignedUp

});

server.listen(3000);
console.log('Start server port 3000');
