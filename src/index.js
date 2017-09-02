/* ДЗ 3 - работа с массивами и объеектами */

/*
 Задача 1:
 Напишите аналог встроенного метода forEach для работы с массивами
 */
function forEach(array, fn) {

    for (let i = 0; i < array.length; i++) {
        fn(array[i], i, array);
    }

}

/*
 Задача 2:
 Напишите аналог встроенного метода map для работы с массивами
 */
function map(array, fn) {

    let res = [],
        item;

    for (let i = 0; i < array.length; i++) {
        item = fn(array[i], i, array);
        if (item) {
            res.push(item);
        }
    }

    return res;
}

/*
 Задача 3:
 Напишите аналог встроенного метода reduce для работы с массивами
 */
function reduce(array, fn, initial) {
    
    let prev = initial || array[0],
        begin = (typeof initial !== 'undefined') ? 0 : 1;

    for (let i = begin; i < array.length; i++) {
        prev = fn(prev, array[i], i, array);
    }

    return prev;
}

/*
 Задача 4:
 Функция принимает объект и имя свойства, которое необходиом удалить из объекта
 Функция должна удалить указанное свойство из указанного объекта
 */
function deleteProperty(obj, prop) {
    for (let key in obj) {
        if (key === prop) {
            delete obj[prop];
        }
    }
}

/*
 Задача 5:
 Функция принимает объект и имя свойства и возвращает true или false
 Функция должна проверить существует ли укзаанное свойство в указанном объекте
 */
function hasProperty(obj, prop) {
    for (let key in obj) {
        if (key === prop) {
            return true;
        }
    }

    return false;
}

/*
 Задача 6:
 Функция должна получить все перечисляемые свойства объекта и вернуть их в виде массива
 */
function getEnumProps(obj) {
    
    return Object.keys(obj);
}

/*
 Задача 7:
 Функция должна перебрать все свойства объекта, преобразовать их имена в верхний регистра и вернуть в виде массива
 */
function upperProps(obj) {
    let res = [];
    
    for (let key in obj) {
        if (key) {
            res.push(key.toUpperCase());
        }
    }

    return res;
}

/*
 Задача 8 *:
 Напишите аналог встроенного метода slice для работы с массивами
 */
function slice(array, from = 0, to = array.length) {
    
    let res = [];    

    if (to < 0) {
        to += array.length;
    }
    if (from < 0) {
        from += array.length;
    }

    for (let i = 0; i < array.length; i++) {
        if (i >= from && i < to) {

            res.push(array[i]);
        }    
    }

    return res;

}

/*
 Задача 9 *:
 Функция принимает объект и должна вернуть Proxy для этого объекта
 Proxy должен перехватывать все попытки записи значений свойств и возводить это значение в квадрат
 */
function createProxy(obj) {
    let proxy = new Proxy(obj, {
        set(target, prop, value) {
            target[prop] = value * value;

            return true;
        }
    });

    return proxy;
}

export {
    forEach,
    map,
    reduce,
    deleteProperty,
    hasProperty,
    getEnumProps,
    upperProps,
    slice,
    createProxy
};
