ymaps.ready(init);

function init() {
    mapData.forEach(function(item, index) {
        createMap({ center: item.center, zoom: item.zoom, controls:['zoomControl'], scroll: false }, item);
    });

}


function createMap(state, mapData) {
    // Если карта еще не была создана, то создадим ее и добавим метку с адресом.
    //alert(state.toSource());

    var map = new ymaps.Map(mapData.id, state);


    MyBalloonLayout = ymaps.templateLayoutFactory.createClass(
        '<div class="popover top">' +
            '<a class="close" href="#">&times;</a>' +
            '<div class="arrow"></div>' +
            '<div class="popover__grid">' +
                '<div class="popover-inner">' +
                     '$[[options.contentLayout observeSize minWidth=235 maxWidth=235 maxHeight=350]]' +
                '</div>' +
            '</div>' +
        '</div>', {
            build: function () {
                this.constructor.superclass.build.call(this);
                this._$element = $('.popover', this.getParentElement());
                this.applyElementOffset();
                this._$element.find('.close')
                    .on('click', $.proxy(this.onCloseClick, this));
             },
            clear: function () {
                this._$element.find('.close')
                    .off('click');

                this.constructor.superclass.clear.call(this);
             },

            onSublayoutSizeChange: function () {
                MyBalloonLayout.superclass.onSublayoutSizeChange.apply(this, arguments);
                if(!this._isElement(this._$element)) {
                    return;
                 }
                this.applyElementOffset();

                this.events.fire('shapechange');
             },
            applyElementOffset: function () {
                /*
                this._$element.css({
                    left: '-50%',
                    top: -68,
                    position: 'absolute',
                 });
                 */
             },

            onCloseClick: function (e) {
                e.preventDefault();

                this.events.fire('userclose');
             },
            getShape: function () {
                if(!this._isElement(this._$element)) {
                    return MyBalloonLayout.superclass.getShape.call(this);
                 }

                var position = this._$element.position();

                return new ymaps.shape.Rectangle(new ymaps.geometry.pixel.Rectangle([
                    [position.left, position.top], [
                        position.left + this._$element[0].offsetWidth,
                        position.top + this._$element[0].offsetHeight + this._$element.find('.arrow')[0].offsetHeight
                    ]
                ]));
             },
            _isElement: function (element) {
                return element && element[0] && element.find('.arrow')[0];
             }
         }),

        // Создание вложенного макета содержимого балуна.
        MyBalloonContentLayout = ymaps.templateLayoutFactory.createClass(
            '<div class="popover__address">$[properties.balloonHeader]</div>'
        );


    for (var item of mapData.placemarks) {
        var placemark = new ymaps.Placemark(
            item.coords, {
                balloonHeader: item.header
            }, {
                balloonShadow: false,
                balloonLayout: MyBalloonLayout,
                balloonContentLayout: MyBalloonContentLayout,
                balloonPanelMaxMapArea: 0,
                hideIconOnBalloonOpen: false,

                iconLayout: 'default#image',
                // Своё изображение иконки метки.
                iconImageHref: item.iconImageHref,
                // Размеры метки.
                iconImageSize: item.iconImageSize,
                // Смещение левого верхнего угла иконки относительно
                // её "ножки" (точки привязки).
                iconImageOffset: item.iconImageOffset,
                pane: 'balloon'
            });
        map.geoObjects.add(placemark);

        if (item.opened) {
            placemark.balloon.open();
        }
    };





    map.behaviors.disable('drag');
    map.controls.remove('geolocationControl'); // удаляем геолокацию
    map.controls.remove('searchControl'); // удаляем поиск
    map.controls.remove('trafficControl'); // удаляем контроль трафика
    map.controls.remove('typeSelector'); // удаляем тип
    map.controls.remove('fullscreenControl'); // удаляем кнопку перехода в полноэкранный режим
    map.controls.remove('zoomControl'); // удаляем контрол зуммирования
    map.controls.remove('rulerControl'); // удаляем контрол правил
    map.behaviors.disable(['scrollZoom']); // отключаем скролл карты (опционально)
    //hideMapOnMobile();
    //map.controls.add('zoomControl');
    // Если карта есть, то выставляем новый центр карты и меняем данные и позицию метки в соответствии с найденным адресом.

    map.events.once('click', function () {
        map.behaviors
            .enable('scrollZoom')
            .enable('multiTouch');
    });

}


