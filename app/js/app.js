/**
 * Copyright (C) 2016 myastro.fr
 * app.js
 *
 * changelog
 * 2016-11-04[09:55:41]:revised
 *
 * @author moughamir@gmail.com
 * @version 0.1.0
 * @since 0.1.0
 */
$(document).ready(function() {

    /*==========================================
     =            Variables settings            =
     ==========================================*/
    /**

     TODO:  - setting a variables array
     - looping through each var and set a $ selector
     FIXME: Fix This!
     */

    var steps;
    steps = ["intro", "voyant", "pick", "draw", "interpret", "read", "resault"];

    $.each(steps, function (i, step) {
        var step = $("#" + step);
        console.log(step);
    });

    /*=====  End of Variables settings  ======*/
    $(".on").animate([
        {transform: 'translate(0, 0, 0)'},
        {transform: 'translate(0, -300px, 0)'}
    ], {
        duration: 1000,
        iterations: Infinity
    });


    /*
     * SoundFX Initial
     * TODO: Add Ambient sounce
     * */
    var sfxOne;
    sfxOne = new Audio("app/audio/ambient-forest-birds.m4a");
    sfxOne.addEventListener("ended", function () {
        this.currentTime = 0;
        this.play();
    }, false);
    sfxOne.play();
    console.log("Init Audio One");
    // Check for display:none|block, ignore visible:true|false
    //$("#voyant").is(":visible");

    if (!$("#voyant").hasClass("rotateCarouselLeftIn")) {
    } else {
        var sfxOne;
        sfxOne = new Audio("app/audio/hummingbirds.m4a");
        sfxOne.addEventListener("ended", function () {
            this.currentTime = 0;
            this.play();
        }, false);
        sfxOne.play();
        console.log("Init Audio Two");
    }
    /*
     * Let's go to full screen mode
     * */

    $(".fullscreen").click(function () {
        $("#product-container").toggleFullScreen();
        console.info("fullscrenn");
    });

    // Shuffle Cards
    /*
    * FIXME: Shuffle Cards and change z-index
    * */
    (function($){

        $.fn.shuffle = function() {

            var elements = this.get();
            var copy = [].concat(elements);
            var shuffled = [];
            var placeholders = [];

            // Shuffle the element array
            while (copy.length) {
                var rand = Math.floor(Math.random() * copy.length);
                var element = copy.splice(rand, 1)[0];
                shuffled.push(element)
            }

            // replace all elements with a plcaceholder
            for (var i = 0; i < elements.length; i++) {
                var placeholder = document.createTextNode('');
                findAndReplace(elements[i], placeholder);
                placeholders.push(placeholder)
            }

            // replace the placeholders with the shuffled elements
            for (var i = 0; i < elements.length; i++) {
                findAndReplace(placeholders[i], shuffled[i])
            }

            return $(shuffled)

        };

        function findAndReplace(find, replace) {
            find.parentNode.replaceChild(replace, find)
        }

    })(jQuery);
    $('ul.circle-container li').shuffle();

/*
* MultiStep Form
* */
    /**
     * Copyright (C) 2016 omnizya.com
     *
     *
     * changelog
     * 2016-11-08[19:01:01]:revised
     *
     * @author moughamir@gmail.com
     * @version 0.1.0
     * @since 0.1.0
     */

    /**
     * Created by Moughamir on 14/11/2016.
     */

    var $slider = $('.cardSlide'); // class or id of carousel slider
    var $slide = $('.cardInfo');
    var $transition_time = 800; // 1 second
    var $time_between_slides = 14000; // 4 seconds
    var counter = 0;

    function slides() {
        return $slider.find($slide);
    }

    slides().fadeOut();

// set active classes
    slides().first().addClass('active');
    slides().first().fadeIn($transition_time);

// auto scroll
    $interval = setInterval(
        function () {
            var $i = $slider.find('.active').index();

            slides().eq($i).removeClass('active');
            slides().eq($i).fadeOut($transition_time);

            if (slides().length == $i + 1) $i = -1; // loop to start

            slides().eq($i + 1).fadeIn($transition_time);
            slides().eq($i + 1).addClass('active');
        }
        , $transition_time + $time_between_slides
    );


    //when user clicks the image for sliding right
    $('.previous').click(function () {
        var $i = $slider.find('.active').index();

        slides().eq($i).removeClass('active');
        slides().eq($i).fadeOut($transition_time);


        slides().eq($i - 1).fadeIn($transition_time);
        slides().eq($i - 1).addClass('active');
    });

    //when user clicks the image for sliding left
    $('.next').click(function () {
        var $i = $slider.find('.active').index();

        slides().eq($i).removeClass('active');
        slides().eq($i).fadeOut($transition_time);


        slides().eq($i + 1).fadeIn($transition_time);
        slides().eq($i + 1).addClass('active');

    });
    $(".next").bind("click", function () {
        counter++;
        switch (counter) {
            case 1:
                console.log('1');
                break;
            case 2:
                console.log('2');
                break;
            case 3:
                console.log('3');
                break;
            case 4:
                $('#draw').removeClass('moveFromTopFade').addClass('moveToTopFade');
                $('#result').removeClass('hidden').addClass('moveFromBottomFade');
                $('.parallax-tarot').animate({
                    backgroundPosition: '0 0'
                }, 700, 'swing');
                break;
        }
    })



});
/* Cards fetcher*/

//var app = angular.module('myApplication', ['ngSanitize'])
//app.controller('postController', function($scope, $http, $sce) {
//var url = './api.php/tarot';

//$http.get(url).success(function(response) {
//    $scope.tarot = php_crud_api_transform(response).tarot;
//});
//});
/* End of Card Fetcher*/
//app.filter('unsafe', function($sce) {
//    return function(val) {
//        return $sce.trustAsHtml(val);
//    };
//});

var app;
app = angular.module("myApplication", ["ngSanitize"])
    .controller("postController", ["$scope", "$http", "$sce", function postController($scope, $http, $sce) {
        var cards = "./api.php/tarot/";
        $http.get(cards).success(function (response) {
            $scope.tarot = php_crud_api_transform(response).tarot;
            });
            $scope.explicitlyTrustedHtml = $sce.trustAsHtml();
        $scope.saySomething = function () {
            console.log("Click Click");
        };
        /*
         * API Call
         *
         * @description: get JSON data of specific element
         * @author: Mohamed Moughamir <moughamir@gmail.com>
         * @site: http://omnizya.com/
         * @api: http://myastro.dev/tarot-g/api.php/tarot/
         * @param: ?filter=value,eq,[i]
         * @return: id, title, value, reading
         * s
         * */
        var cardId;
        var param = "?filter=value,eq,";
        $scope.getCard = function (cardId) {
            $http.get(cards + param + cardId).success(function (cardData) {
                $scope.card = cardData;

            });
        };

    }]);

