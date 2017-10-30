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
            if (!userInFile(user)) {
                saveAuthUserInFile(user);
            }

            let oldPosition = getPosUserInConnections(user);

            if (oldPosition >= 0) {
                connections.all[oldPosition].send(createMsg('logout'));
                removeUserFromConnections(oldPosition);
            }
            
            saveUserInConnections(socket, user);
            sendMessageToClients(createMsg('redrawOnlineUsers', getOnlineUsers()));
            
            socket.send(createMsg('historyOfMessages', historyOfMessages));
            socket.send(createMsg('showUserName', user.name));
            
            let users = getUsers(),
                photoUrl = users[user.login].photoUrl;
            
            if (photoUrl) {
                socket.send(createMsg('showPhoto', photoUrl));
            }
        },
        message(socket, message) {
            let time = helper.currentTime();

            let objectMessage = {
                userName: socket.user.name,
                userLogin: socket.user.login,
                time: time,
                text: message.data,
                photoUrl: socket.user.photoUrl
            };

            historyOfMessages.push(objectMessage);

            sendMessageToClients(createMsg('message', objectMessage));
        },
        checkImgFile(socket, message) {
            let file = message.data;
            
            if (file.type !== 'image/jpeg') {
                return socket.send(createMsg('errorUploadFile', 'type'));
            }
            if (file.size > MAX_FILE_SIZE) {
                return socket.send(createMsg('errorUploadFile', 'size'));
            }

            socket.send(createMsg('correctUploadFile', file.data));
        },
        saveImgFile(socket, message) {
            let url = '../upload/image_' + (new Date).getTime() + '.jpg';
                            
            fs.writeFileSync(url, message.data, 'binary');
            socket.user.photoUrl = url;
            socket.send(createMsg('showPhoto', url.substr(2)));
            
            setPhotoUrlInHistoryOfMessages(socket.user, url);
            sendMessageToClients(createMsg('historyOfMessages', historyOfMessages));

            let users = getUsers();

            users[socket.user.login].photoUrl = url;
            fs.writeFileSync(USERS_PATH, JSON.stringify(users));
        }
    };
};

let connections = null,
    historyOfMessages = [],
    handler = Handler(),
    helper = require('./helper.js'),
    createMsg = helper.createMessage,
    fs = require('fs');

const MAX_FILE_SIZE = 512 * 1024,
    NO_PHOTO_PATH = '../upload/no_image.png',
    USERS_PATH = '../users.json';

function saveAuthUserInFile(user) {
    let users = JSON.parse(fs.readFileSync(USERS_PATH, 'utf8'));
    
    users[user.login] = { 'photoUrl': null };
    fs.writeFileSync(USERS_PATH, JSON.stringify(users));
}

function setPhotoUrlInHistoryOfMessages(user, newUrl) {
    
    for (let i = 0; i < historyOfMessages.length; i++) {
        if (historyOfMessages[i].userLogin === user.login) {
            historyOfMessages[i].photoUrl = newUrl;
        }
    }
}

function getUsers() {
    return JSON.parse(fs.readFileSync(USERS_PATH, 'utf8'));
}

function removeUserFromConnections(oldPosition) {
    connections.all.splice(oldPosition, 1);
}

function saveUserInConnections(socket, user) {
    let users = getUsers();

    socket.user = {
        'login': user.login,
        'name': user.name,
        'photoUrl': users[user.login].photoUrl || NO_PHOTO_PATH
    };
}

function getPosUserInConnections(user) {
    let oldPosition = -1;
    
    for (let i = 0; i < connections.all.length; i++) {
        if (connections.all[i].user && connections.all[i].user.login === user.login) {
            oldPosition = i;
        }
    }

    return oldPosition;
}

function userInFile(user) {
    let users = getUsers();

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
                throw error;
            }
        });
    }    
}