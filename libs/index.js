/**

	TODO:
	- Initial impress
	- add btn when clicked go to next slide

 */

/*impress().init();
impress().play();*/
var impress = impress();
impress.init();

/**
 *
 * jQuery define
 *
 */
var voyant = document.getElementById("voyant");
$('.start').click(function() {
    impress.goto(voyant);
    console.log('done');
});

	var rootElement = document.getElementById("impress");
	$('#impress').blind("impress:stepenter", function() {
    var currentStep = document.querySelector(".present");
    console.log("Entered the Step Element '" + currentStep.id + "'");
});
