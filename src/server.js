let WebSocketServer = require('ws').Server,
    server = new WebSocketServer({ port: 9090 }),
    sh = require('./server_helper.js'),
    connections = { all: [] };

sh.initConnections(connections);

server.on('connection', socket => {
    connections.all.push(socket);
    
    socket.on('message', data => {
        sh.messageHandler(socket, JSON.parse(data));
    });

    socket.on('close', () => {
        sh.closeConnection(socket);
    });
});