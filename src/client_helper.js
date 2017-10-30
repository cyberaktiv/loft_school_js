let exportModule = {
    initClient(socket) {
        client = socket;
    },
    messageHandler(message) {
        handler[message.type](message);
    },    
    popupOpen(id) {
        let popup = document.querySelector('#popup'),
            popupChilds = popup.childNodes;
        
        for (let i = 0; i < popupChilds.length; i++) {
            if (popupChilds[i].tagName === 'DIV') {
                if (popupChilds[i].id === id) {
                    popupChilds[i].style.display = 'block';
                } else {
                    popupChilds[i].style.display = 'none';
                }
            }
        }

        popup.style.display = 'block';

        if (id === 'popup_auth') {
            setAuthFocus();
        }
    },
    popupClose(id) {
        let popup = document.querySelector('#popup'),
            popupItem = document.querySelector('#' + id);
            
        popup.style.display = 'none';
        popupItem.style.display = 'none';
    }
};

module.exports = exportModule;

let Handler = function() {
    return {
        showUserName(message) {
            let userName = document.querySelector('#current_user_name');

            userName.innerHTML = message.data;
        },
        historyOfMessages(message) {
                
            let render = require('./views/message.hbs');
            
            blockMessages.innerHTML = '';

            for (let i = 0; i < message.data.length; i++) {
                blockMessages.innerHTML += render({
                    'photoUrl': (message.data)[i].photoUrl,
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
                'photoUrl': message.data.photoUrl,
                'message': message.data.text,
                'userName': message.data.userName,
                'time': message.data.time
            });

            blockMessages.scrollTop = blockMessages.scrollHeight;
        },
        emptyAuthFields() {
            showMessage('Все поля должны быть заполнены!');
        },
        logout() {
            location.href = '/';
        },
        redrawOnlineUsers(message) {
            let countUsers = message.data.length,
                blockUsers = document.querySelector('#content_online_users'),
                countOnlineUsersBlock = document.querySelector('#count_online_users'),
                blockOnlineUsers = document.querySelector('#block_online_users'),
                render = require('./views/users.hbs');

            if (countUsers === 0) {
                blockOnlineUsers.style.display = 'none';
            } else {
                blockOnlineUsers.style.display = 'block';
            }

            blockUsers.innerHTML = render({
                'users': message.data,
            });

            countOnlineUsersBlock.innerHTML = message.data.length;
            exportModule.popupClose('popup_auth');
        },
        errorUploadFile(message) {
            switch (message.data) {
                case 'size':
                    return showMessage('Недопустимый размер файла!');
                case 'type':
                    return showMessage('Недопустимый формат файла!');
            }            
        },
        correctUploadFile(message) {
            dropZonePhoto.innerHTML = `<img src="data:image/jpeg;base64,${btoa(message.data)}">`;
        },
        showPhoto(message) {
            showUserPhoto(message.data);
        }
    };
};

let blockMessages = document.querySelector('#block_messages'),
    sendMessage = document.querySelector('#send_message'),
    inputMessage = document.querySelector('#input_message input'),
    auth = document.querySelector('#button_auth'),
    buttonCancelLoadPhoto = document.querySelector('#button_cancel_load_photo'),
    currentUserPhoto = document.querySelector('#current_user_photo'),
    dropZonePhoto = document.querySelector('#popup_photo_block div'),
    buttonLoadPhoto = document.querySelector('#button_load_photo'),
    authName = document.querySelectorAll('#auth_inputs input')[0],
    authLogin = document.querySelectorAll('#auth_inputs input')[1],
    client = null,
    handler = Handler(),
    helper = require('./helper.js');

buttonLoadPhoto.addEventListener('click', () => {
    
    let file = document.querySelector('#popup_photo_block img');
    
    if (!file) {
        return showMessage('Выберите изображение для загрузки');
    }

    let base64Str = file.src.substr('data:image/jpeg;base64,'.length);
    
    sendToServer('saveImgFile', atob(base64Str));
});

dropZonePhoto.addEventListener('drop', e => {
    e.preventDefault();

    let file = e.dataTransfer.files[0],
        reader = new FileReader();

    reader.addEventListener('loadend', e => {
        sendToServer('checkImgFile', {
            size: file.size,
            type: file.type,
            data: e.target.result
        });
    });
    
    reader.readAsBinaryString(file);
});

dropZonePhoto.addEventListener('dragleave', e => {
    e.preventDefault();
});

dropZonePhoto.addEventListener('dragover', e => {
    e.preventDefault();
});

document.addEventListener('drop', e => {
    e.preventDefault();
});
document.addEventListener('dragleave', e => {
    e.preventDefault();
});
document.addEventListener('dragover', e => {
    e.preventDefault();
});

sendMessage.addEventListener('click', () => {    
    sendToServer('message', getTextFromInput());
});

inputMessage.addEventListener('keypress', e => {
    if (e.keyCode == 13) {
        sendToServer('message', getTextFromInput());
    }
});

auth.addEventListener('click', () => {
    authUser();
});

buttonCancelLoadPhoto.addEventListener('click', () => {
    exportModule.popupClose('popup_load_photo');
});

currentUserPhoto.addEventListener('click', () => {
    exportModule.popupOpen('popup_load_photo');
});

authName.addEventListener('keypress', e => {
    if (e.keyCode == 13) {
        authUser();
    }
});

authLogin.addEventListener('keypress', e => {
    if (e.keyCode == 13) {
        authUser();
    }
});

function getTextFromInput() {
    let input = document.querySelector('#input_message input'),
        text = input.value;

    input.value = '';

    return text;
}

function sendToServer(type, data) {
    client.send(helper.createMessage(type, data));
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
        'position: fixed;';

    div.innerText = text;

    document.body.appendChild(div);

    setTimeout(() => {
        document.body.removeChild(div);
    }, time);
}

function authUser() {
    let inputs = document.querySelectorAll('#auth_inputs input'),
        name = inputs[0].value,
        login = inputs[1].value;

    sendToServer('auth', { name, login });
}

function showUserPhoto(url) {
    
    let userPhoto = document.querySelector('#current_user_photo div');
    
    userPhoto.innerHTML = '';
    userPhoto.style.backgroundImage = `url(${url})`;
    userPhoto.classList.add('image_center');

    exportModule.popupClose('popup_load_photo');
}

function setAuthFocus() {
    let input = document.querySelector('#auth_inputs input');

    input.focus();
}