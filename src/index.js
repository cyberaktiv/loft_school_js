let helper = require('./helper');

let App = function() {

    let map;
    let clusterer;

    ymaps.ready(init);

    function init () {
        map = new ymaps.Map('map', {
            center: [59.93772, 30.313622], // Санкт-Петербург
            zoom: 12
        }, { searchControlProvider: 'yandex#search' });

        clusterer = new ymaps.Clusterer({
            clusterBalloonContentLayout: 'cluster#balloonCarousel',
            clusterDisableClickZoom: true, // запрет на увеличение
            visible: false // оставлять видимым при всплытии карусели
        });

        map.geoObjects.add(clusterer);

        map.events.add('mouseup', (e) => {

            map.balloon.close();
            closeWindowReviews();

            let [x, y] = e.get('position'),
                coords = e.get('coords');

            ymaps.geocode(coords).then((res) => {

                let address = res.geoObjects.get(0).getAddressLine();

                moveMap(x, y, (newX, newY) => {
                    windowReviewsOpen(newX, newY, address);
                    sessionStorage.setItem('currentMark', JSON.stringify({ coords, address }));
                });
            });
        });

        map.events.add('wheel', () => {
            closeWindowReviews();
            map.balloon.close();
        });

        map.events.add('mousedown', () => {
            closeWindowReviews();
        });

        clusterer.events.add('click', (e) => {

            map.balloon.close();

            let target = e.get('target'),
                [x, y] = e.get('position'),
                // запоминаем координаты которые были назначены в начале
                coords = target.geometry._coordinates;

            if (target.options._name === 'cluster') {

                let geoObjects = e.get('target').getGeoObjects(),
                    reviews = [];

                for (let i = 0; i < geoObjects.length; i++) {
                    reviews.push(geoObjects[i].properties._data);
                }

                sessionStorage.setItem('currentCluster', JSON.stringify(reviews));

            } else {
                let { name, place, review, date } = target.properties._data;

                ymaps.geocode(coords).then((res) => {

                    const address = res.geoObjects.get(0).getAddressLine();

                    moveMap(x, y, (newX, newY) => {
                        windowReviewsOpen(newX, newY, address);
                        addReview(name, place, review, date);
                        sessionStorage.setItem('currentMark', JSON.stringify({ coords, address }));
                    });
                });
            }
        });
    }

    function addReview(name, place, review, date) {

        let content = document.querySelector('#reviews'),
            empty = document.querySelector('#empty'),
            render = require('./views/review.hbs');

        if (empty) {
            content.innerHTML = render({ name, place, review, date });
        } else {
            content.innerHTML += render({ name, place, review, date });
        }
    }

    function putPointOnMap() {

        let { coords, address } = JSON.parse(sessionStorage.getItem('currentMark')),
            inputName = document.querySelector('#name'),
            inputPlace = document.querySelector('#place'),
            inputReview = document.querySelector('#review');

        let name = inputName.value.trim(),
            place = inputPlace.value.trim(),
            review = inputReview.value.trim(),
            date = helper.currentDate(),
            renderHeader = require('./views/cluster_header.hbs'),
            renderBody = require('./views/cluster_body.hbs'),
            renderFooter = require('./views/cluster_footer.hbs');

        if (name === '' || place === '' || review === '') {
            return messagePopup('Заполните все поля!');
        }

        addReview(name, place, review, date);
        inputName.value = '';
        inputPlace.value = '';
        inputReview.value = '';

        clusterer.add(
            new ymaps.Placemark(coords, {
                balloonContentHeader: renderHeader({ place }),
                balloonContentBody: renderBody({ coords: coords.toString(), address }),
                balloonContentFooter: renderFooter({ review, date }),
                name,
                place,
                review,
                date,
                address
            }, {
                hasBalloon: false
            })
        );
    }

    function moveMap(x, y, callback) {

        let popupWidth = 300,
            popupHeight = 420,
            timeShift = 300,
            height = document.documentElement.clientHeight,
            width = document.documentElement.clientWidth,
            enoughSpace = true, // по умолчанию достаточно места
            enoughSpaceOnBottom = ((height - y) < popupHeight)?false:true,
            enoughSpaceOnRight = ((width - x) < popupWidth)?false:true,
            shiftTop = 0,
            shiftLeft = 0;

        if (!enoughSpaceOnRight) { // если не хватает места справа
            enoughSpace = false; // недостаточно места
            shiftLeft = (popupWidth - (width - x) + 10);
        }

        if (!enoughSpaceOnBottom) { // если не хватает места снизу
            enoughSpace = false; // недостаточно места
            shiftTop = (popupHeight - (height - y) + 10);
        }

        if (!enoughSpace) { // если места недостаточно
            setTimeout(() => {
                return callback(x - shiftLeft, y - shiftTop);
            }, timeShift + 100);

            let position = map.getGlobalPixelCenter();

            // двигаем карту для освобождения места под всплывающее окно
            map.setGlobalPixelCenter([ position[0] + shiftLeft, position[1] + shiftTop ], map._zoom, {
                duration: timeShift
            });
        } else {
            return callback(x, y);
        }
    }

    function windowReviewsOpen(x, y, address) {

        let div = document.createElement('div');

        div.addEventListener('click', closeWindowReviewsEvent);

        div.id = 'window_reviews';

        div.style.top = `${y}px`;
        div.style.left = `${x}px`;

        const render = require('./views/window_reviews.hbs');

        div.innerHTML = render();
        div.querySelector('#address').innerHTML = address;

        document.body.appendChild(div);
    }

    function closeWindowReviews() {
        let windowReviews = document.querySelector('#window_reviews');

        if (windowReviews) {
            windowReviews.removeEventListener('click', closeWindowReviewsEvent);
            document.body.removeChild(windowReviews);
        }
    }

    function closeWindowReviewsEvent(e) {
        if (e.target.id === 'close_window_reviews') {
            closeWindowReviews();
        }
    }

    function messagePopup(text) {

        let div = document.createElement('div');

        div.classList.add('message_popup');

        div.innerText = text;

        let windowReviews = document.querySelector('#window_reviews');

        windowReviews.appendChild(div);

        setTimeout(function() {
            windowReviews.removeChild(div);
        }, 2000);
    }

    document.addEventListener('click', (e) => {

        const target = e.target;

        if (target.id === 'add-point-button') {
            putPointOnMap();            
        }

        if (target.classList.contains('cluster_address')) {
            map.balloon.close();

            let coords = target.id.split(','),
                address = target.innerHTML,
                { x, y } = helper.getOffsetPosition(e);

            moveMap(x, y, (newX, newY) => {

                windowReviewsOpen(newX, newY, address);

                let reviews = JSON.parse(sessionStorage.getItem('currentCluster'));

                for (let i = 0; i < reviews.length; i++) {
                    if (reviews[i].address === address) {
                        addReview(
                            reviews[i].name,
                            reviews[i].place,
                            reviews[i].review,
                            reviews[i].date
                        );
                    }
                }
                sessionStorage.setItem('currentMark', JSON.stringify({ coords, address }));
            });
        }
    });
};

let app = new App();