/** Со звездочкой */
/**
 * Создать страницу с кнопкой
 * При нажатии на кнопку должен создаваться div со случайными размерами, цветом и позицией
 * Необходимо предоставить возможность перетаскивать созданные div при помощи drag and drop
 * Запрощено использовать сторонние библиотеки. Разрешено пользоваться только тем, что встроено в браузер
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
 * Генерация псевдослучайного десятичного числа от begin до end
 * @param {Number} begin
 * @param {Number} end
 */
function rand(begin, end) {

    return Math.floor( Math.random() * (end - begin + 1) ) + begin;
}

/**
 * Генерация двузначного шестнадцатиричного числа
 */
function randDoubleDigitHexNumber() {
    let num = rand(1, 255).toString(16);
    
    if (num.length === 1) {
        num = `0${num}`;
    }

    return num;
}

/**
 * Генерация случайного цвета формата '#000000'
 */
function randColor() {
    
    return '#'+
        randDoubleDigitHexNumber()+
        randDoubleDigitHexNumber()+
        randDoubleDigitHexNumber();
}

/**
 * Функция должна создавать и возвращать новый div с классом draggable-div и случайными размерами/цветом/позицией
 * Функция должна только создавать элемент и задвать ему случайные размер/позицию/цвет
 * Функция НЕ должна добавлять элемент на страницу
 *
 * @return {Element}
 */
function createDiv() {

    let div = document.createElement('div'),
        width = rand(10, 200),
        height = rand(10, 200),
        left = rand(25, window.innerWidth - width),
        top = rand(25, window.innerHeight - height),
        background = randColor();

    div.classList.add('draggable-div');

    div.setAttribute('style',
        `width: ${width}px;`+
        `height: ${height}px;`+
        `background: ${background};`+
        `position: absolute;`+
        `left: ${left}px;`+
        `top: ${top}px;`
    );
    div.draggable = true;

    return div;
}

function getCoords(elem) {

    let box = elem.getBoundingClientRect(),
        body = document.body,
        docEl = document.documentElement,
        scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop,
        scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft,
        clientTop = docEl.clientTop || body.clientTop || 0,
        clientLeft = docEl.clientLeft || body.clientLeft || 0,
        top = box.top + scrollTop - clientTop,
        left = box.left + scrollLeft - clientLeft;

    return { top: Math.round(top), left: Math.round(left) };
}

/**
 * Функция должна добавлять обработчики событий для перетаскивания элемента при помощи drag and drop
 *
 * @param {Element} target
 */
function addListeners(target) {
    
    target.addEventListener('mousedown', function(e) {
        
        let coords = getCoords(target),
            shiftX = e.pageX - coords.left,
            shiftY = e.pageY - coords.top;

        moveAt(e);
        target.style.zIndex = 1000;

        function moveAt(e) {
            target.style.left = `${e.pageX - shiftX}px`;
            target.style.top = `${e.pageY - shiftY}px`;
        }
        
        let mouseMoveHandler = function(e) {
            moveAt(e);
        };

        let mouseUpHandler = function(e) {
            document.removeEventListener('mousemove', mouseMoveHandler);
            target.removeEventListener('mouseup', mouseUpHandler);
        };

        document.addEventListener('mousemove', mouseMoveHandler);
        target.addEventListener('mouseup', mouseUpHandler);
    });

    target.addEventListener('dragstart', function(e) {
        e.preventDefault();
    });
}

/**
 * Проверяет является ли элемент elem DIV и дочерним по отношению к container
 * 
 * @param {Element} elem
 * @param {Element} container
 */
function isElementInContainer(elem, container) {    
    return elem.parentNode === container && elem.tagName === 'DIV';
}

/**
 * Функция для делегирования, навешивает событие только на document
 *
 * @param {Element} container
 */
function addDelegateListener(container) {
    
    document.addEventListener('mousedown', function(e) {

        let target = e.target;

        if (isElementInContainer(target, container)) {

            let coords = getCoords(target),
                shiftX = e.pageX - coords.left,
                shiftY = e.pageY - coords.top;

            moveAt(e);
            target.style.zIndex = 1000;

            function moveAt(e) {

                target.style.left = `${e.pageX - shiftX}px`;
                target.style.top = `${e.pageY - shiftY}px`;
            }
            
            let mouseMoveHandler = function(e) {
                moveAt(e);
            };

            let mouseUpHandler = function() {
                document.removeEventListener('mousemove', mouseMoveHandler);
                target.removeEventListener('mouseup', mouseUpHandler);
            };

            document.addEventListener('mousemove', mouseMoveHandler);
            target.addEventListener('mouseup', mouseUpHandler);
        }        
    });

    document.addEventListener('dragstart', function(e) {

        if (isElementInContainer(e.target, container)) {
            e.preventDefault();
        }
    });
}

// addDelegateListener(homeworkContainer); // функция для делегирования

let addDivButton = homeworkContainer.querySelector('#addDiv');

addDivButton.addEventListener('click', function() {
    // создать новый div
    let div = createDiv();

    // добавить на страницу
    homeworkContainer.appendChild(div);
    // назначить обработчики событий мыши для реализации d&d
    addListeners(div);
    // можно не назначать обработчики событий каждому div в отдельности, а использовать делегирование
    // или использовать HTML5 D&D - https://www.html5rocks.com/ru/tutorials/dnd/basics/
});

export {
    createDiv
};
