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
        
    	TODO:
    	- setting a variables array
    	- looping through each var and set a $ selector
        
     */

    var steps = ["intro", "voyant", "pick", "draw", "interpret", "read", "resault"];

    $.each(steps, function(i, step) {
        var step = $("#" + step);
        console.log(step);
    });

    /*=====  End of Variables settings  ======*/
    $(".on").animate([
        { transform: 'translate(0, 0, 0)' },
        { transform: 'translate(0, -300px, 0)' }
    ], {
        duration: 1000,
        iterations: Infinity
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

var app = angular.module('myApplication', ['ngSanitize'])
    .controller('postController', ['$scope', '$http', '$sce',
        function postController($scope, $http, $sce) {
            
            var url = './api.php/tarot';

            $http.get(url).success(function(response) {
                $scope.tarot = php_crud_api_transform(response).tarot
            });
            $scope.explicitlyTrustedHtml = $sce.trustAsHtml();
        }
    ]);
