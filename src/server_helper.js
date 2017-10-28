module.exports = {
    initConnections(serverConnections) {
        connections = serverConnections;
    },
    messageHandler(socket, message) {
        handler[message.type](socket, message);
    },
    closeConnection(socket) {
        removeConnection(socket);
        sendMessageToClients(createMsg('redrawOnlineUsers', getOnlineUsers()));
    }
};

let Handler = function() {
    return {        
        auth(socket, message) {

            let user = message.data;

            if (emptyAuthFields(user)) {
                return socket.send(createMsg('emptyAuthFields'));
            }
            if (!userInList(user)) {
                return socket.send(createMsg('authFail'));
            }
            
            let oldPosition = getPositionUserInConnections(user);

            if (oldPosition >= 0) {
                connections.all[oldPosition].send(createMsg('logout'));
                removeOldThisAuthUserFromConnections(oldPosition);
            }
            
            saveAuthUserInConnections(socket, user);
            sendMessageToClients(createMsg('redrawOnlineUsers', getOnlineUsers()));
            socket.send(createMsg('historyOfMessages', historyOfMessages));
            socket.send(createMsg('showUserName', user.name));
        },
        message(socket, message) {
            let time = helper.currentTime();
            
            let objectMessage = {
                userName: socket.user.name,
                time: time,
                text: message.data
            };

            historyOfMessages.push(objectMessage);

            sendMessageToClients(createMsg('message', objectMessage));
        }
    };
};

let connections = null,
    historyOfMessages = [],
    handler = Handler(),
    helper = require('./helper.js'),
    createMsg = helper.createMessage,
    fs = require('fs'),
    users = JSON.parse(fs.readFileSync('../users.json', 'utf8'));

function removeOldThisAuthUserFromConnections(oldPosition) {
    connections.all.splice(oldPosition, 1);
}

function saveAuthUserInConnections(socket, user) {
    socket.user = {
        'login': user.login,
        'name': user.name
    };
}

function getPositionUserInConnections(user) {
    let oldPosition = -1;
    
    for (let i = 0; i < connections.all.length; i++) {
        if (connections.all[i].user && connections.all[i].user.login === user.login) {
            oldPosition = i;
        }
    }

    return oldPosition;
}

function userInList(user) {
    return !!users[user.login];
}

function emptyAuthFields(data) {
    return data.login.trim() === '' || data.name.trim() === '';
}

function getOnlineUsers() {
    let users = [];
    
    for (let i = 0; i < connections.all.length; i++) {
        if (connections.all[i].user) {
            users.push(connections.all[i].user);
        }
    }
    
    return users;
}

function removeConnection(socket) {
    connections.all = connections.all.filter(current => {
        return current !== socket;
    });
}

function sendMessageToClients(message) {

    let authUsers = [];

    connections.all.forEach(connection => {

        if (connection.user) {
            authUsers.push(connection);
        }
    });

    for (let i = 0; i < authUsers.length; i++) {

        authUsers[i].send(message, error => {
            if (error) {
                console.error(error);
                // removeConnection(authUsers[i]);
            }
        });
    }    
}