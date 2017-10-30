WebSocket.prototype.on = function(eventName, handler) {
    return this.addEventListener(eventName, handler);
};

let socket = new WebSocket('ws://localhost:9090'),
    ch = require('./client_helper.js');
    
ch.initClient(socket);

socket.on('message', e => {
    ch.messageHandler(JSON.parse(e.data));
});

socket.on('error', e => {
    throw e;
});

socket.on('open', () => {
    ch.popupOpen('popup_auth');
});