/* ДЗ 6.1 - Асинхронность и работа с сетью */

/**
 * Функция должна создавать Promise, который должен быть resolved через seconds секунду после создания
 *
 * @param {number} seconds - количество секунд, через которое Promise должен быть resolved
 * @return {Promise}
 */
function delayPromise(seconds) {    
    return new Promise(function(resolve) {
        setTimeout(function() {
            resolve();
        }, seconds * 1000);
    });
}

/**
 * Функция должна вернуть Promise, который должен быть разрешен массивом городов, загруженным из
 * https://raw.githubusercontent.com/smelukov/citiesTest/master/cities.json
 * Элементы полученного массива должны быть отсортированы по имени города
 *
 * @return {Promise<Array<{name: String}>>}
 */
function loadAndSortTowns() {
    let link = 'https://raw.githubusercontent.com/smelukov/citiesTest/master/cities.json';
    
    return new Promise(function(resolve, reject) {
        let req = new XMLHttpRequest();        
        
        req.responseType = 'json';
        req.open('GET', link, true);
        req.onload = function() {

            let towns = req.response;

            towns.sort(function (a, b) {
                if (a.name > b.name) {
                    return 1;
                }
                if (a.name < b.name) {
                    return -1;
                }

                return 0;
            });
            resolve(towns);
        };
        req.onerror = function() {
            reject('Something wrong!');
        };
        req.send();
    });
}

export {
    delayPromise,
    loadAndSortTowns
};
