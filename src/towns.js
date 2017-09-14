/**
 * ДЗ 6.2 - Создать страницу с текстовым полем для фильтрации городов
 *
 * Страница должна предварительно загрузить список городов из
 * https://raw.githubusercontent.com/smelukov/citiesTest/master/cities.json
 * и отсортировать в алфавитном порядке.
 *
 * При вводе в текстовое поле, под ним должен появляться список тех городов,
 * в названии которых, хотя бы частично, есть введенное значение.
 * Регистр символов учитываться не должен, то есть "Moscow" и "moscow" - одинаковые названия.
 *
 * Во время загрузки городов, на странице должна быть надпись "Загрузка..."
 * После окончания загрузки городов, надпись исчезает и появляется текстовое поле.
 *
 * Запрещено использовать сторонние библиотеки. Разрешено пользоваться только тем, что встроено в браузер
 *
 * *** Часть со звездочкой ***
 * Если загрузка городов не удалась (например, отключился интернет или сервер вернул ошибку),
 * то необходимо показать надпись "Не удалось загрузить города" и кнопку "Повторить".
 * При клике на кнопку, процесс загрузки повторяется заново
 */

/**
 * homeworkContainer - это контейнер для всех ваших домашних заданий
 * Если вы создаете новые html-элементы и добавляете их на страницу, то дабавляйте их только в этот контейнер
 *
 * @example
 * homeworkContainer.appendChild(...);
 */
let homeworkContainer = document.querySelector('#homework-container');

/**
 * Функция должна загружать список городов из https://raw.githubusercontent.com/smelukov/citiesTest/master/cities.json
 * И возвращать Promise, которой должен разрешиться массивом загруженных городов
 *
 * @return {Promise<Array<{name: string}>>}
 */
function loadTowns() {
    let link = 'https://raw.githubusercontent.com/smelukov/citiesTest/master/cities.json',
        towns = null;

    return new Promise(function(resolve, reject) {
        let xhr = new XMLHttpRequest();

        xhr.responseType = 'json';
        xhr.open('GET', link, true);
        xhr.onload = function() {
            if (xhr.status < 400) {
                towns = xhr.response;
                towns.sort((a, b) => {
                    if (a.name > b.name) {
                        return 1;
                    }
                    if (a.name < b.name) {
                        return -1;
                    }

                    return 0;
                });
                resolve(towns);
            } else {
                reject();
            }
        };
        xhr.send();
    });
}

/**
 * Функция должна проверять встречается ли подстрока chunk в строке full
 * Проверка должна происходить без учета регистра символов
 *
 * @example
 * isMatching('Moscow', 'moscow') // true
 * isMatching('Moscow', 'mosc') // true
 * isMatching('Moscow', 'cow') // true
 * isMatching('Moscow', 'SCO') // true
 * isMatching('Moscow', 'Moscov') // false
 *
 * @return {boolean}
 */
function isMatching(full, chunk) {
    return (full.toLowerCase().indexOf(chunk.toLowerCase()) >= 0)? true: false;
}

let loadingBlock = homeworkContainer.querySelector('#loading-block');
let filterBlock = homeworkContainer.querySelector('#filter-block');
let filterInput = homeworkContainer.querySelector('#filter-input');
let filterResult = homeworkContainer.querySelector('#filter-result');
let townsPromise;

function resultToDataBlock(towns) {
    let result = '';
    
    for (let i = 0; i < towns.length; i++) {
        if (isMatching(towns[i].name, filterInput.value)) {
            result += `${towns[i].name}<br>`;
        }
    }
    filterResult.innerHTML = result;
}

function errorToDataBlock() {
    
    filterResult.innerHTML = '';

    let p = document.createElement('p'),
        button = document.createElement('button');

    p.innerHTML = 'Не удалось загрузить города';
    button.innerHTML = 'Повторить';
    filterResult.appendChild(p);
    filterResult.appendChild(button);

    button.onclick = () => { // каждый раз перезаписывает событие
        filterInput.dispatchEvent(new Event('keyup'));
    };
}

filterInput.addEventListener('keyup', function() {

    filterResult.innerHTML = '';

    if (filterInput.value !== '') {
        loadingBlock.innerHTML = 'Загрузка...';
        
        loadTowns()
            .then((towns) => {
                loadingBlock.innerHTML = '';
                resultToDataBlock(towns);
            })
            .catch(() => {
                loadingBlock.innerHTML = '';
                errorToDataBlock();
            });
    }
});

export {
    loadTowns,
    isMatching
};
