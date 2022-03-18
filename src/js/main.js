
$(function() {
    //маска телефонов
    $('[data-mask]').each(function() {
        input = $(this);
        mask = input.attr('data-mask');
        input.inputmask({"mask": mask});
    });

    //сворачивание мобильного меню
    $('.toggle-menu-js').on('click', function (e) {
        e.preventDefault();
        $('body').removeClass('show-phones-menu')
        if ($('body').hasClass('show-slide-menu')) {
            hideSlideMenu();
        } else {
            showSlideMenu();
        }
    });

    $('body').on('click', '[data-menu-show]', function() {
        $('[data-menu-show]').removeClass("active");
        $(this).addClass("active");

        var menuId = $(this).attr('data-menu-show');
        $('[data-menu-panel]').removeClass("active");
        $('[data-menu-panel="'+menuId+'"]').addClass("active");
    });

    //плавный переход по контенту
    $('body').on('click', '[data-goto]', function(e) {
        e.preventDefault();
        $('.mobile-menu').slideUp();
        var hx = 0;
        var selector = $(this).attr('data-goto');
        $('html, body').animate({ scrollTop: $(selector).offset().top + hx}, 1200);
    });

    //обрабатываем событие клика по табу
    $('[data-tab]').click(function(e){
        e.preventDefault();
        if ($(this).hasClass('active')) return false;

        var parent = $(this).parents('.xtab-container');
        var xtab = parent.find('.xtab');

        xtab.stop(true, true);
        parent.find('[data-tab]').removeClass('active');

        var data_tab = $(this).attr('data-tab');
        
        $(this).addClass('active');
        //$('[data-tab="'+data_tab+'"]').addClass('active');
        xtab.animate({ "opacity": 0.2 }, 150, function() {
            xtab.removeClass('active');
            xtab.animate({"opacity": 1});
            $(data_tab).addClass('active');
        });
        return false;
    });

    // слайдер на главной
    initLeadSlider();

    initXtab();
    toogler({
        "parent": ".price__item",
        "hiddenContainer": ".price__list",
        "link": ".price__title",
        "speed": 100,
        "openClass": "active"
    });
    toogler({
        "parent": ".faq__item",
        "hiddenContainer": ".faq__answer",
        "link": ".faq__title",
        "speed": 100,
        "openClass": "active"
    });
    /*
    toogler({
        "parent": ".footer-block",
        "hiddenContainer": ".footer-block__body",
        "link": ".footer-block__arrow",
        "speed": 100,
    });
    */

    toogler({
        "parent": "li",
        "hiddenContainer": "ul",
        "link": ".slide-menu__arrow",
        "speed": 100,
    });

    //плавный переход по контенту
    $('body').on('click', '[data-goto]', function(e) {
        e.preventDefault();
        $('.mobile-menu').slideUp();
        var hx = 0;
        var selector = $(this).attr('data-goto');
        $('html, body').animate({ scrollTop: $(selector).offset().top + hx}, 1200);
    });

    $('.sticky-menu-item').on('click', function(e) {
        e.preventDefault();
        
        $('.sticky-menu-item').removeClass('active');
        $(this).addClass('active');
        $('.sticky-menu').addClass('open');

        var submenuId = $(this).attr('data-submenu');
 
        $('.sticky-submenu').removeClass('active');
        setTimeout(function() {
            $('.sticky-submenu[data-submenu="'+submenuId+'"]').addClass('active');
        }, 500);

        if ($(this).hasClass('sticky-menu-item--search')) {
            $(this).find('input').focus();
        }
        
        
    });

    $('body').on('click', function(e) {
        if ($(e.target).parents('.sticky-menu').length == 0) {
            closeStickyMenu();
        }
    });

    $('.sticky-submenu-cross').on('click', function(e) {
        e.preventDefault();
        closeStickyMenu();
    })

    
    $('body').on('click', '.footer-block__arrow', function(e) {
        e.preventDefault();
        console.log("click");
        $(this).parents('.footer-block').toggleClass('opened');
    });

    $('[data-fancybox]').on('click', function() {
        hideSlideMenu();
    });

    new WOW().init();

    $(document).scroll(function(){
        setFixedHeader();
    });
});

$("body").on("click", "[data-hide-menu]", function() {
    hideSlideMenu();
});

var hideSlideMenu = function() {
    $('body').removeClass('show-slide-menu');
};

var showSlideMenu = function() {
    $('[data-menu-panel]').removeClass("active");
    $('[data-menu-panel="catalog"]').addClass("active");
    $('body').addClass('show-slide-menu');
};


var closeStickyMenu = function() {
    $('.sticky-submenu').removeClass('active');

    setTimeout(function() {
        $('.sticky-menu-item').removeClass('active');
        $('.sticky-menu').removeClass('open');
    }, 300);
}

var initMobileCategoryMenu = function() {
    $('.mobile-category-menu-js').owlCarousel({
        margin: 20,
        loop: false,
        autoWidth: true,
        items: 3,
        dots: false,
    })
}

var initLeadSlider = function() {
    var selector = '.lead-slider-js';

    $(selector).owlCarousel({
        loop: true,
        margin: 0,
        responsiveClass: true,
        responsive:{
            0:{
                items: 1,
                nav: true
            }
        }
    });
};

var initXtab = function() {
    setTimeout(function() {
        $('.xtab-container').each(function() {
            $(this).addClass('xtab-initialized');
        });
    }, 100);
};

var toogler = function(ops) {
    var defaultOptions = {
        "parent": "body",
        "speed": 300,
        "openClass": "opened",
        "stepCorrection": true,
    };

    // var options = Object.assign({}, defaultOptions, ops);
    var options = $.extend({}, defaultOptions, ops);

    $("body").on("click", options.link, function (e) {
        e.preventDefault();

        if (options.before) {
            options.before(this);    
        }

        var classOpened = options.openClass || "open";
        var parent = $(this).closest(options.parent);
        var body = parent.find(options.hiddenContainer).eq(0);
        var opened = parent.hasClass(classOpened);

        var v_up = 0;  
        var v_down = 0;  
        var bd = jQuery('body').get(0);

        if (opened) {
            $(body).slideUp({ 
                easing: "linear", 
                step: function(now, tween) {
                    if (options.stepCorrection && tween.prop == "height"){
                        if (v_up == 0){
                            v_up = now;
                        } else {
                            var k = v_up - now;
                            console.log("slideUp k", k);
                            bd.scrollTop -= k;
                            v_up = now;
                        }
                    }
                }, 
                duration: options.speed, 
                complete: function() { 
                    parent.removeClass(classOpened);

                    if (options.complete) {
                        options.complete("close");    
                    }
                }
            });

        } else {
            $(body).slideDown({ 
                easing: "linear", 
                step: function(now, tween) {
                    if (options.stepCorrection && tween.prop == "height"){
                        if (v_down == 0){
                            v_down = now;
                        }else{
                            var k = v_down - now;
                            console.log("slideDown k", k);
                            bd.scrollTop -= k;
                            v_down = now;
                        }
                    }
                }, 
                duration: options.speed, 
                complete: function() { 
                    parent.addClass(classOpened);

                    if (options.complete) {
                        options.complete("open");    
                    }
                }
            });
        }
    });  
};

var doit;
$(window).resize(function(){
    clearTimeout(doit);
    doit = setTimeout(resizedw, 100);
});

var resizedw = function(){
    // $('body').removeClass('show-slide-menu');
    // $('body').removeClass('show-phones-menu');
};

var setFixedHeader = function() {
    var scroll = $(window).scrollTop();

    if (scroll > 0) {
        $('header').addClass('header-scrolled');
    } else {
        $('header').removeClass('header-scrolled');
    }
}