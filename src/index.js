function api(method, params) {
    
    return new Promise((resolve, reject) => {
        
        VK.api(method, params, data => {
            if (data.error) {
                reject(new Error(data.error.error_msg));
            } else {
                resolve(data.response);
            }
        });
    });
}

function detectFriendTarget(target) {
    
    if (!target.classList.contains('friend_block')) {

        if (
            target.classList.contains('name') ||
            target.classList.contains('photo') ||
            target.classList.contains('action')
        ) {
            target = target.parentNode;
        } else if (target.tagName === 'IMG') {
            target = target.parentNode.parentNode;
        }
    }

    return target;
}

function mouseAction(e, bgColor) {
    let target = detectFriendTarget(e.target);
    
    if (target.classList.contains('friend_block')) {
        target.style.backgroundColor = bgColor;
    }
}

function isMatching(full, chunk) {    
    return (full.toLowerCase().indexOf(chunk.toLowerCase()) >= 0)? true: false;
}

function updateFriendsLeft(friends) {
    const render = require('../friend_left.hbs');

    let template = '';
    
    for (let key in friends) {
        template += render(friends[key]);
    }
    document.querySelector('#friends_left').innerHTML = template;
}

function updateFriendsRight(friends) {
    const render = require('../friend_right.hbs');

    let template = '';
    
    for (let key in friends) {
        template += render(friends[key]);
    }
    document.querySelector('#friends_right').innerHTML = template;
}

function toIdObject(friends) {
    let friendsObj = {};
    
    for (let i = 0; i < friends.length; i++) {
        friendsObj[friends[i].id] = friends[i];
    }
    
    return friendsObj;
}

function dragstart(e) {
    
    if (e.target.tagName === 'IMG') {
        return e.preventDefault();
    }
    if (e.target.classList.contains('friend_block')) {
        e.dataTransfer.setData('id', e.target.querySelector('.action img').dataset.id);
    }
}

let friendsLeft = document.querySelector('#friends_left'),
    friendsRight = document.querySelector('#friends_right'),
    searchLeft = document.querySelector('#search_left'),
    searchRight = document.querySelector('#search_right'),
    saveButton = document.querySelector('#footer div'),
    friendsListLeft = (localStorage.friendsListLeft)?JSON.parse(localStorage.friendsListLeft):{},
    friendsListRight = (localStorage.friendsListRight)?JSON.parse(localStorage.friendsListRight):{};

const promise = new Promise((resolve, reject) => {
    VK.init({
        apiId: 6197100
    });

    VK.Auth.login(data => {    
        if (data.session) {
            resolve(data);
        } else {
            reject(new Error('Не удалось авторизоваться'));
        }
    }, 16);
});

friendsLeft.addEventListener('click', (e) => {
        
    let id = e.target.dataset.id;
    
    if (id) {    
        friendsListRight[id] = friendsListLeft[id];
        delete friendsListLeft[id];
        updateFriendsLeft(friendsListLeft);
        updateFriendsRight(friendsListRight);
    }
});

friendsRight.addEventListener('click', (e) => {
    
    let id = e.target.dataset.id;
    
    if (id) {
        friendsListLeft[id] = friendsListRight[id];
        delete friendsListRight[id];        
        updateFriendsRight(friendsListRight);
        updateFriendsLeft(friendsListLeft);
    }
});

searchLeft.addEventListener('keyup', (e) => {
        
    let result = {},
        chunk = e.target.value;

    for (let key in friendsListLeft) {
        if (isMatching(friendsListLeft[key].first_name, chunk) || isMatching(friendsListLeft[key].last_name, chunk)) {
            result[key] = friendsListLeft[key];
        }
    }
    updateFriendsLeft(result);
});

searchRight.addEventListener('keyup', (e) => {
    
    let result = {},
        chunk = e.target.value;

    for (let key in friendsListRight) {
        if (isMatching(friendsListRight[key].first_name, chunk) || isMatching(friendsListRight[key].last_name, chunk)) {
            result[key] = friendsListRight[key];
        }
    }
    updateFriendsRight(result);
});

friendsLeft.addEventListener('dragover', (e) => {    
    e.preventDefault();
});

friendsLeft.addEventListener('drop', (e) => {
    
    e.preventDefault();    
    
    let id = e.dataTransfer.getData('id'),
        friendsIdName = 'friends_left';

    if (friendsListLeft[id]) {
        return;
    }

    if (
        e.target.id === friendsIdName ||
        e.target.parentNode.id === friendsIdName ||
        e.target.parentNode.parentNode.id === friendsIdName ||
        e.target.parentNode.parentNode.parentNode.id === friendsIdName
    ) {     

        friendsListLeft[id] = friendsListRight[id];
        delete friendsListRight[id];        
        updateFriendsRight(friendsListRight);
        updateFriendsLeft(friendsListLeft);
    }
});

friendsRight.addEventListener('drop', (e) => {
    
    e.preventDefault();
    
    let id = e.dataTransfer.getData('id'),
        friendsIdName = 'friends_right';

    if (friendsListRight[id]) {
        return;
    }

    if (
        e.target.id === friendsIdName ||
        e.target.parentNode.id === friendsIdName ||
        e.target.parentNode.parentNode.id === friendsIdName ||
        e.target.parentNode.parentNode.parentNode.id === friendsIdName
    ) {        
        friendsListRight[id] = friendsListLeft[id];
        delete friendsListLeft[id];
        updateFriendsLeft(friendsListLeft);
        updateFriendsRight(friendsListRight);
    }
});

friendsRight.addEventListener('dragover', (e) => {        
    e.preventDefault();
});

friendsLeft.addEventListener('dragstart', (e) => {
    dragstart(e);
});

friendsRight.addEventListener('dragstart', (e) => {
    dragstart(e);
});

saveButton.addEventListener('click', () => {

    localStorage.friendsListLeft = JSON.stringify(friendsListLeft);
    localStorage.friendsListRight = JSON.stringify(friendsListRight);
    alert('Списки друзей сохранены!');
});

friendsRight.addEventListener('mouseout', (e) => {
    mouseAction(e, '#FFFFFF');
});

friendsRight.addEventListener('mouseover', (e) => {    
    mouseAction(e, '#F0F0F0');
});

friendsLeft.addEventListener('mouseout', (e) => {
    mouseAction(e, '#FFFFFF');
});

friendsLeft.addEventListener('mouseover', (e) => {
    mouseAction(e, '#F0F0F0');
});

promise
    .then(() => {
        return api('friends.get', { v: 5.68, fields: 'first_name, last_name, photo_50' });
    })
    .then(friends => {
        if (localStorage.friendsListLeft) {
            updateFriendsLeft(friendsListLeft);
            updateFriendsRight(friendsListRight);
        } else {
            friendsListLeft = toIdObject(friends.items)
            updateFriendsLeft(friendsListLeft);
        }
    }) 
    .catch(function (e) {
        alert('Ошибка: ' + e.message);
    });