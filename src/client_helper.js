module.exports = {
    initClient(socket) {
        client = socket;
    },
    messageHandler(message) {
        handler[message.type](message);
    },
    popupAuth() {

        let popup = document.querySelector('#popup');
        let input = document.querySelector('#auth_inputs input');

        popup.style.display = 'block';    
        input.selectionStart = input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
    }
};

let Handler = function() {
    return {
        showUserName(message) {
            let userName = document.querySelector('#current_user_name');

            userName.innerHTML = message.data;
        },
        historyOfMessages(message) {

            let render = require('./views/message.hbs');
            
            for (let i = 0; i < message.data.length; i++) {
                blockMessages.innerHTML += render({
                    'message': (message.data)[i].text,
                    'userName': (message.data)[i].userName,
                    'time': (message.data)[i].time
                });
            }
            blockMessages.scrollTop = blockMessages.scrollHeight;

            let input = document.querySelector('#input_message input');

            input.focus();
        },
        message(message) {
            let render = require('./views/message.hbs');

            blockMessages.innerHTML += render({
                'message': message.data.text,
                'userName': message.data.userName,
                'time': message.data.time
            });

            blockMessages.scrollTop = blockMessages.scrollHeight;
        },
        emptyAuthFields() {
            showMessage('Все поля должны быть заполнены!');
        },
        authFail() {
            showMessage('Нет такого пользователя, попробуйте снова');
        },
        logout() {
            location.href = '/'; // перезаходим с запросом авторизации
        },
        redrawOnlineUsers(message) {
            let countUsers = message.data.length,
                blockUsers = document.querySelector('#content_online_users'),
                countOnlineUsersBlock = document.querySelector('#count_online_users'),
                blockOnlineUsers = document.querySelector('#block_online_users');

            if (countUsers === 0) {
                blockOnlineUsers.style.display = 'none';
            } else {
                blockOnlineUsers.style.display = 'block';
            }

            let render = require('./views/users.hbs');

            blockUsers.innerHTML = render({
                'users': message.data,
            });

            countOnlineUsersBlock.innerHTML = message.data.length;
            removePopupAuth();
        }
    };
};

let blockMessages = document.querySelector('#block_messages'),
    sendMessage = document.querySelector('#send_message'),
    inputMessage = document.querySelector('#input_message input'),
    auth = document.querySelector('#auth_button'),
    authName = document.querySelectorAll('#auth_inputs input')[0],
    authLogin = document.querySelectorAll('#auth_inputs input')[1],
    client = null,
    handler = Handler(),
    helper = require('./helper.js');

sendMessage.addEventListener('click', () => {    
    sendToServer('message', getTextFromInput());
});

inputMessage.addEventListener('keypress', (e) => {
    if (e.keyCode == 13) {
        sendToServer('message', getTextFromInput());
    }
});

auth.addEventListener('click', () => {
    authUser();
});

authName.addEventListener('keypress', (e) => {
    if (e.keyCode == 13) {
        authUser();
    }
});

authLogin.addEventListener('keypress', (e) => {
    if (e.keyCode == 13) {
        authUser();
    }
});

function getTextFromInput() {
    
    let input = document.querySelector('#input_message input');
    let text = input.value;
    
    input.value = '';
    
    return text;
}

function sendToServer(type, data) {
    client.send(helper.createMessage(type, data));
}

function removePopupAuth() {

    let popup = document.querySelector('#popup');
    
    popup.style.display = 'none';
}

function showMessage(text, time) {

    time = time || 3000;
    let div = document.createElement('div');

    div.style.cssText =
        'background-color: #1b353f;'+
        'color: #fff;'+
        'padding: 10px 20px;'+
        'font-size: 16px;'+
        'z-index: 99999;'+
        'border-radius: 5px;'+
        'top: 50px;'+
        'right: 50px;'+
        'position: fixed;'+
        '';

    div.innerText = text;

    document.body.appendChild(div);

    setTimeout(function() {
        document.body.removeChild(div);
    }, time);
}

function authUser() {
    let inputs = document.querySelectorAll('#auth_inputs input');
    let name = inputs[0].value;
    let login = inputs[1].value;

    sendToServer('auth', { name, login });    
}
