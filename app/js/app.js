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
