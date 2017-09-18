/**
 * ДЗ 7.2 - Создать редактор cookie с возможностью фильтрации
 *
 * На странице должна быть таблица со списком имеющихся cookie:
 * - имя
 * - значение
 * - удалить (при нажатии на кнопку, выбранная cookie удаляется из браузера и таблицы)
 *
 * На странице должна быть форма для добавления новой cookie:
 * - имя
 * - значение
 * - добавить (при нажатии на кнопку, в браузер и таблицу добавляется новая cookie с указанным именем и значением)
 *
 * Если добавляется cookie с именем уже существующией cookie, то ее значение в браузере и таблице должно быть обновлено
 *
 * На странице должно быть текстовое поле для фильтрации cookie
 * В таблице должны быть только те cookie, в имени или значении которых есть введенное значение
 * Если в поле фильтра пусто, то должны выводиться все доступные cookie
 * Если дабавляемая cookie не соответсвуте фильтру, то она должна быть добавлена только в браузер, но не в таблицу
 * Если добавляется cookie, с именем уже существующией cookie и ее новое значение не соответствует фильтру,
 * то ее значение должно быть обновлено в браузере, а из таблицы cookie должна быть удалена
 *
 * Для более подробной информации можно изучить код тестов
 *
 * Запрещено использовать сторонние библиотеки. Разрешено пользоваться только тем, что встроено в браузер
 */

/**
 * homeworkContainer - это контейнер для всех ваших домашних заданий
 * Если вы создаете новые html-элементы и добавляете их на страницу, то дабавляйте их только в этот контейнер
 *
 * @example
 * homeworkContainer.appendChild(...);
 */
let homeworkContainer = document.querySelector('#homework-container');
let filterNameInput = homeworkContainer.querySelector('#filter-name-input');
let addNameInput = homeworkContainer.querySelector('#add-name-input');
let addValueInput = homeworkContainer.querySelector('#add-value-input');
let addButton = homeworkContainer.querySelector('#add-button');
let listTable = homeworkContainer.querySelector('#list-table tbody');

/**
 * Функция должна создавать cookie с указанными именем и значением
 *
 * @param name - имя
 * @param value - значение
 */
function createCookie(name, value) {
    document.cookie = `${name.trim()}=${value}`;
}

/**
 * Удаление cookie с указанным именем
 *
 * @param name - имя
 */
function deleteCookie(name) {
    document.cookie = `${name}="";expires=${new Date(0).toUTCString()}`
}

/**
 * Получить все cookie в виде объекта: ключ -> значение
 *
 * @return {object}
 */
function getCookieList() {
    
    if (document.cookie === '') {
        return null;
    }

    let cookies = document.cookie.split(';'),
        result = {};

    for (let i = 0; i < cookies.length; i++) {        
        
        let [name, value] = cookies[i].split('=');
        
        result[name.trim()] = value;
    }

    return result;
}

/**
 * Вставить и отобразить все cookie в блоке
 *
 */
function viewCookieList() {

    listTable.innerHTML = ''; // очищаем поле для значений
    
    let chunk = filterNameInput.value,
        cookies = getCookieList();

    if (cookies) {
        for (let name in cookies) {
            if (isMatching(name, chunk) || isMatching(cookies[name], chunk)) {
                viewCookie(name, cookies[name]);
            }
        }
    }
}

/**
 * Вставить и отобразить одну cookie в блок
 *
 * @param {string} name - имя cookie
 * @param {string} value - значение cookie
 */
function viewCookie(name, value) {

    let tr = document.createElement('tr'),
        tdName = document.createElement('td'),
        tdValue = document.createElement('td'),
        tdDelete = document.createElement('td'),
        button = document.createElement('button');
    
    button.innerHTML = 'Удалить';
    button.setAttribute('cookie', name);

    tdName.innerHTML = name;
    tdValue.innerHTML = value;
    tdDelete.appendChild(button);

    tr.appendChild(tdName);
    tr.appendChild(tdValue);
    tr.appendChild(tdDelete);
    
    listTable.appendChild(tr);
}

/**
 * Встречается ли подстрока chunk в строке full без учета регистра
 *
 * @return {boolean}
 */
function isMatching(full, chunk) {
    return (full.toLowerCase().indexOf(chunk.toLowerCase()) >= 0)? true: false;
}

listTable.addEventListener('click', (e) => {    
    
    if (e.target.tagName === 'BUTTON') {
        deleteCookie(e.target.getAttribute('cookie'));
        viewCookieList();
    }
});

filterNameInput.addEventListener('keyup', () => {
    viewCookieList();
});

addButton.addEventListener('click', () => {
    if (addNameInput.value.trim() === '' || addValueInput.value.trim() === '') {
        alert('Поля "имя cookie" и "значение cookie" должны быть заполнены!');
    } else {
        createCookie(addNameInput.value, addValueInput.value);
        viewCookieList();
    }    
});

viewCookieList();