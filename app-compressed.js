/* IMPRESS.CUSTOM.JS */
// HELPER FUNCTIONS
var helpers = {
    // `pfx` is a function that takes a standard CSS property name as a parameter
    // and returns it's prefixed version valid for current browser it runs in.
    // The code is heavily inspired by Modernizr http://www.modernizr.com/
    'pfx': (function() {
        
        var style = document.createElement('dummy').style,
            prefixes = 'Webkit Moz O ms Khtml'.split(' '),
            memory = {};
        
        return function ( prop ) {
            if ( typeof memory[ prop ] === "undefined" ) {
                
                var ucProp  = prop.charAt(0).toUpperCase() + prop.substr(1),
                    props   = (prop + ' ' + prefixes.join(ucProp + ' ') + ucProp).split(' ');

                memory[ prop ] = null;
                for ( var i in props ) {
                    if ( style[ props[i] ] !== undefined ) {
                        memory[ prop ] = props[i];
                        break;
                    }
                }
            
            }
            
            return memory[ prop ];
        };
    
    })(),
    
    'format': function(v){
      return (''+v).match(/%/) ? v : v + 'px';
    },
    
    // `translate` builds a translate transform string for given data.
    'translate': function ( t ) {
        return " translate3d(" + helpers.format(t.x) + "," + helpers.format(t.y) + "," + helpers.format(t.z) + ") ";
    },
    
    // `rotate` builds a rotate transform string for given data.
    // By default the rotations are in X Y Z order that can be reverted by passing `true`
    // as second parameter.
    'rotate': function ( r, revert ) {
        var rX = " rotateX(" + r.x + "deg) ",
            rY = " rotateY(" + r.y + "deg) ",
            rZ = " rotateZ(" + r.z + "deg) ";
        
        return revert ? rZ+rY+rX : rX+rY+rZ;
    },
    
    // `scale` builds a scale transform string for given data.
    'scale': function ( s ) {
        return " scale(" + s + ") ";
    },
    
    // `perspective` builds a perspective transform string for given data.
    'perspective': function ( p ) {
        return " perspective(" + p + "px) ";
    },
    
    // `css` function applies the styles given in `props` object to the element
    // given as `el`. It runs all property names through `pfx` function to make
    // sure proper prefixed version of the property is used.
    'css': function ( el, props ) {
        var key, pkey;
        var pfx = helpers.pfx;

        for ( key in props ) {
            if ( props.hasOwnProperty(key) ) {
                pkey = pfx(key);
                if ( pkey !== null ) {
                    if(el === null){
                      console.log(pkey, props[key]);
                      console.trace('ok');
                    }
                    el.style[pkey] = props[key];
                }
            }
        }
        return el;
    },
    
    // `toNumber` takes a value given as `numeric` parameter and tries to turn
    // it into a number. If it is not possible it returns 0 (or other value
    // given as `fallback`).
    'toNumber': function (numeric, fallback) {
        return isNaN(numeric) ? (fallback || 0) : Number(numeric);
        // return numeric || 0;
    },

    'toNotNull': function (v, ratio) {
        // return isNaN(numeric) ? (fallback || 0) : Number(numeric);
        if(v && ratio && v.match(/%/))
          v = (parseInt(v.replace(/%/, '')) * ratio) + '%';
        return v || 0;
    },

    'toInverse': function (v) {
        return isNaN(v) ? (v.match(/\-/) ? v.replace(/\-/, '') : '-'+v ) : -1 * v;
        // return numeric || 0;
    },

    // `dataSet` is a workaround for IE
    'dataSet': function(el) {
      var dataset = {};
      for (var att, i = 0, atts = el.attributes, n = atts.length; i < n; i++){
          att = atts[i];
          if(att.nodeName.match(/data\-/))
            dataset[att.nodeName.replace(/data\-/, '')] = att.nodeValue;
      }
      return dataset;
    },
    
    // throttling function calls, by Remy Sharp
    // http://remysharp.com/2010/07/21/throttling-function-calls/
    'throttle': function (fn, delay) {
        var timer = null;
        return function () {
            var context = this, args = arguments;
            clearTimeout(timer);
            timer = setTimeout(function () {
                fn.apply(context, args);
            }, delay);
        };
    }
    
};
/**
 * impress.js
 *
 * impress.js is a presentation tool based on the power of CSS3 transforms and transitions
 * in modern browsers and inspired by the idea behind prezi.com.
 *
 *
 * Copyright 2011-2012 Bartek Szopka (@bartaz)
 *
 * Released under the MIT and GPL Licenses.
 *
 * ------------------------------------------------
 *  author:  Bartek Szopka
 *  version: 0.5.3
 *  url:     http://bartaz.github.com/impress.js/
 *  source:  http://github.com/bartaz/impress.js/
 */

/*jshint bitwise:true, curly:true, eqeqeq:true, forin:true, latedef:true, newcap:true,
         noarg:true, noempty:true, undef:true, strict:true, browser:true */

// You are one of those who like to know how things work inside?
// Let me show you the cogs that make impress.js run...
(function ( document, window ) {
    'use strict';

    var pfx = helpers.pfx;
    var translate = helpers.translate;
    var rotate = helpers.rotate;
    var scale = helpers.scale;
    var perspective = helpers.perspective;
    var css = helpers.css;
    var toNumber = helpers.toNumber;
    var dataSet = helpers.dataSet;
        
    // `arraify` takes an array-like object and turns it into real Array
    // to make all the Array.prototype goodness available.
    var arrayify = function ( a ) {
        return [].slice.call( a );
    };
    
    // `byId` returns element with given `id` - you probably have guessed that ;)
    var byId = function ( id ) {
        return document.getElementById(id);
    };
    
    // `$` returns first element for given CSS `selector` in the `context` of
    // the given element or whole document.
    var $ = function ( selector, context ) {
        context = context || document;
        return context.querySelector(selector);
    };
    
    // `$$` return an array of elements for given CSS `selector` in the `context` of
    // the given element or whole document.
    var $$ = function ( selector, context ) {
        context = context || document;
        return arrayify( context.querySelectorAll(selector) );
    };
    
    // `triggerEvent` builds a custom DOM event with given `eventName` and `detail` data
    // and triggers it on element given as `el`.
    var triggerEvent = function (el, eventName, detail) {
        var event = document.createEvent("CustomEvent");
        event.initCustomEvent(eventName, true, true, detail);
        el.dispatchEvent(event);
    };
    
    // `getElementFromHash` returns an element located by id from hash part of
    // window location.
    var getElementFromHash = function () {
        // get id from url # by removing `#` or `#/` from the beginning,
        // so both "fallback" `#slide-id` and "enhanced" `#/slide-id` will work
        return byId( window.location.hash.replace(/^#\/?/,"") );
    };
    
    // `computeWindowScale` counts the scale factor between window size and size
    // defined for the presentation in the config.
    var computeWindowScale = function ( config ) {
        var hScale = window.innerHeight / config.height,
            wScale = window.innerWidth / config.width,
            scale = hScale > wScale ? wScale : hScale;
        
        if (config.maxScale && scale > config.maxScale) {
            scale = config.maxScale;
        }
        
        if (config.minScale && scale < config.minScale) {
            scale = config.minScale;
        }
        
        return scale;
    };
    
    // CHECK SUPPORT
    var body = document.body;
    
    var ua = navigator.userAgent.toLowerCase();
    var impressSupported = 
                          // browser should support CSS 3D transtorms 
                           ( pfx("perspective") !== null ) &&
                           
                          // and `classList` and `dataset` APIs
                           ( body.classList );// &&
                          // ( body.dataset ) &&
                           
                          // but some mobile devices need to be blacklisted,
                          // because their CSS 3D support or hardware is not
                          // good enough to run impress.js properly, sorry...
                           // ( ua.search(/(iphone)|(ipod)|(android)/) === -1 );
    
    if (!impressSupported) {
        // we can't be sure that `classList` is supported
        body.className += " impress-not-supported ";
    } else {
        body.classList.remove("impress-not-supported");
        body.classList.add("impress-supported");
    }
    
    // GLOBALS AND DEFAULTS
    
    // This is where the root elements of all impress.js instances will be kept.
    // Yes, this means you can have more than one instance on a page, but I'm not
    // sure if it makes any sense in practice ;)
    var roots = {};
    
    // some default config values.
    var defaults = {
        width: 1024,
        height: 768,
        maxScale: 1,
        minScale: 0,
        
        perspective: 1000,
        
        transitionDuration: 1000
    };
    
    // it's just an empty function ... and a useless comment.
    var empty = function () { return false; };
    
    // IMPRESS.JS API
    
    // And that's where interesting things will start to happen.
    // It's the core `impress` function that returns the impress.js API
    // for a presentation based on the element with given id ('impress'
    // by default).
    var impress = window.impress = function ( rootId ) {
        
        // If impress.js is not supported by the browser return a dummy API
        // it may not be a perfect solution but we return early and avoid
        // running code that may use features not implemented in the browser.
        if (!impressSupported) {
            return {
                init: empty,
                goto: empty,
                prev: empty,
                next: empty
            };
        }
        
        rootId = rootId || "impress";
        
        // if given root is already initialized just return the API
        if (roots["impress-root-" + rootId]) {
            return roots["impress-root-" + rootId];
        }
        
        // data of all presentation steps
        var stepsData = {};
        
        // element of currently active step
        var activeStep = null;
        
        // current state (position, rotation and scale) of the presentation
        var currentState = null;
        
        // array of step elements
        var steps = null;
        
        // configuration options
        var config = null;
        
        // scale factor of the browser window
        var windowScale = null;        
        
        // root presentation elements
        var root = byId( rootId );
        var canvas = document.createElement("div");
        
        var initialized = false;
        
        // STEP EVENTS
        //
        // There are currently two step events triggered by impress.js
        // `impress:stepenter` is triggered when the step is shown on the 
        // screen (the transition from the previous one is finished) and
        // `impress:stepleave` is triggered when the step is left (the
        // transition to next step just starts).
        
        // reference to last entered step
        var lastEntered = null;
        
        // `onStepEnter` is called whenever the step element is entered
        // but the event is triggered only if the step is different than
        // last entered step.
        var onStartGoTo = function (el, duration) {
            triggerEvent(el, "impress:startgoto", { duration: duration });
        };
        
        // `onStepEnter` is called whenever the step element is entered
        // but the event is triggered only if the step is different than
        // last entered step.
        var onStepEnter = function (step) {
            if (lastEntered !== step) {
                triggerEvent(step, "impress:stepenter");
                lastEntered = step;
            } else {
                triggerEvent(step, "impress:stepreenter");      
            }
        };
        
        // `onStepLeave` is called whenever the step element is left
        // but the event is triggered only if the step is the same as
        // last entered step.
        var onStepLeave = function (step) {
            if (lastEntered === step) {
                triggerEvent(step, "impress:stepleave");
                lastEntered = null;
            }
        };
        
        // `initStep` initializes given step element by reading data from its
        // data attributes and setting correct styles.
        var initStep = function ( el, idx ) {
            var data = el.dataset || dataSet(el),
                step = {
                    translate: {
                        x: helpers.toNotNull(data.x),
                        y: helpers.toNotNull(data.y),
                        z: helpers.toNotNull(data.z)
                    },
                    rotate: {
                        x: toNumber(data.rotateX),
                        y: toNumber(data.rotateY),
                        z: toNumber(data.rotateZ || data.rotate)
                    },
                    scale: toNumber(data.scale, 1),
                    el: el
                };
            
            if ( !el.id ) {
                el.id = "step-" + (idx + 1);
            }
            
            stepsData["impress-" + el.id] = step;

            var _step = { 'translate' : step.translate };
            // console.log(_step.translate.y, jQuery(canvas).height(), jQuery(el).height(), jQuery(canvas).height() / jQuery(el).height());
            _step.translate = {
                x: helpers.toNotNull(_step.translate.x, jQuery(canvas).width() / jQuery(el).width()),
                y: helpers.toNotNull(_step.translate.y, jQuery(canvas).height() / jQuery(el).height()),
                z: helpers.toNotNull(_step.translate.z, jQuery(canvas).width() / jQuery(el).width())
            };
            
            css(el, {
                position: "absolute",
                transform: "translate(-50%,-50%)" +
                           translate(_step.translate) +
                           rotate(step.rotate) +
                           scale(step.scale),
                transformStyle: "preserve-3d"
            });
        };
        
        // `init` API function that initializes (and runs) the presentation.
        var init = function () {
            var init = initialized;
            //if (initialized) { return; }
            
            // First we set up the viewport for mobile devices.
            // For some reason iPad goes nuts when it is not done properly.
            // var meta = $("meta[name='viewport']") || document.createElement("meta");
            // meta.content = "width=device-width, minimum-scale=1, maximum-scale=1, user-scalable=no";
            // if (meta.parentNode !== document.head) {
                // meta.name = 'viewport';
                // document.head.appendChild(meta);
            // }
            
            // initialize configuration object
            var rootData = root.dataset || dataSet(root);
            config = {
                width: toNumber( rootData.width, defaults.width ),
                height: toNumber( rootData.height, defaults.height ),
                maxScale: toNumber( rootData.maxScale, defaults.maxScale ),
                minScale: toNumber( rootData.minScale, defaults.minScale ),                
                perspective: toNumber( rootData.perspective, defaults.perspective ),
                transitionDuration: toNumber( rootData.transitionDuration, defaults.transitionDuration )
            };

            windowScale = rootData.scale || computeWindowScale( config );
            
            if (!initialized) {
                // wrap steps with "canvas" element
                arrayify( root.childNodes ).forEach(function ( el ) {
                    canvas.appendChild( el );
                });
                root.appendChild(canvas);
                canvas.classList.add('canvas');
                
                // set initial styles
                // document.documentElement.style.height = "100%";
                
                // css(body, {
                    // height: "100%",
                    // overflow: "hidden"
                // });
            }

            var rootStyles = {
                position: "absolute",
                transformOrigin: "top left",
                transition: "all 0s ease-in-out",
                transformStyle: "preserve-3d"
            };

            css(root, rootStyles);
            css(root, {
                top: "50%",
                left: "50%",
                transform: perspective( config.perspective/windowScale ) + scale( windowScale )
            });
            css(canvas, rootStyles);
            
            if (!initialized) {
                body.classList.remove("impress-disabled");
                body.classList.add("impress-enabled");

                // get and init steps
                steps = $$(".step", root);
                steps.forEach( initStep );
            
                // set a default initial state of the canvas
                currentState = {
                    translate: { x: 0, y: 0, z: 0 },
                    rotate:    { x: 0, y: 0, z: 0 },
                    scale:     1
                };
            }
            
            initialized = true;
            
            if (!init) {
              triggerEvent(root, "impress:init", { api: roots[ "impress-root-" + rootId ] });
            }
        };
        
        // `getStep` is a helper function that returns a step element defined by parameter.
        // If a number is given, step with index given by the number is returned, if a string
        // is given step element with such id is returned, if DOM element is given it is returned
        // if it is a correct step element.
        var getStep = function ( step ) {
            if (typeof step === "number") {
                step = step < 0 ? steps[ steps.length + step] : steps[ step ];
            } else if (typeof step === "string") {
                step = byId(step);
            }
            return (step && step.id && stepsData["impress-" + step.id]) ? step : null;
        };
        
        // used to reset timeout for `impress:stepenter` event
        var stepEnterTimeout = null;
        
        // `goto` API function that moves to step given with `el` parameter (by index, id or element),
        // with a transition `duration` optionally given as second parameter.
        var goto = function ( el, duration ) {
            if ( !initialized || !(el = getStep(el)) ) {
                // presentation not initialized or given element is not a step
                return false;
            }
            
            // Sometimes it's possible to trigger focus on first link with some keyboard action.
            // Browser in such a case tries to scroll the page to make this element visible
            // (even that body overflow is set to hidden) and it breaks our careful positioning.
            //
            // So, as a lousy (and lazy) workaround we will make the page scroll back to the top
            // whenever slide is selected
            //
            // If you are reading this and know any better way to handle it, I'll be glad to hear about it!
            // window.scrollTo(0, 0);
            
            var step = stepsData["impress-" + el.id];
            
           
            if ( activeStep ) {
                activeStep.classList.remove("active");
                body.classList.remove("impress-on-" + activeStep.id);
            }
            el.classList.add("active");
            
            body.classList.add("impress-on-" + el.id);
            
            duration = duration == 0 ? duration : (duration || config.transitionDuration);
            
            //
            onStartGoTo(el, duration);
            
            // compute target state of the canvas based on given step
            var target = {
                rotate: {
                    x: -step.rotate.x,
                    y: -step.rotate.y,
                    z: -step.rotate.z
                },
                translate: {
                    x: helpers.toInverse(step.translate.x),
                    y: helpers.toInverse(step.translate.y),
                    z: helpers.toInverse(step.translate.z)
                },
                scale: 1 / step.scale
            };
            
            // Check if the transition is zooming in or not.
            //
            // This information is used to alter the transition style:
            // when we are zooming in - we start with move and rotate transition
            // and the scaling is delayed, but when we are zooming out we start
            // with scaling down and move and rotation are delayed.
            var zoomin = target.scale >= currentState.scale;
            
            var delay = jQuery(el).hasClass('no-delay') ? 0 : (duration / 2);
            
            // if the same step is re-selected, force computing window scaling,
            // because it is likely to be caused by window resize
            if (el === activeStep && !windowScale) {
                windowScale = computeWindowScale(config);
            }
            
            var targetScale = target.scale * windowScale;
            
            // trigger leave of currently active element (if it's not the same step again)
            if (activeStep && activeStep !== el) {
                onStepLeave(activeStep);
            }

            // Now we alter transforms of `root` and `canvas` to trigger transitions.
            //
            // And here is why there are two elements: `root` and `canvas` - they are
            // being animated separately:
            // `root` is used for scaling and `canvas` for translate and rotations.
            // Transitions on them are triggered with different delays (to make
            // visually nice and 'natural' looking transitions), so we need to know
            // that both of them are finished.
            var d = {
                // to keep the perspective look similar for different scales
                // we need to 'scale' the perspective, too
                transform: perspective( config.perspective / targetScale ) + scale( targetScale ),
                transitionDuration: duration + "ms",
                transitionDelay: (zoomin ? delay : 0) + "ms"
            };
            // console.log('root ', d);
            css(root, d);
            
            d = {
                transform: rotate(target.rotate, true) + translate(target.translate),
                transitionDuration: duration + "ms",
                transitionDelay: (zoomin ? 0 : delay) + "ms"
            };
            // console.log('canvas ', d);
            css(canvas, d);

            if(jQuery('.spotlight').length > 0){
                // console.log('step ', step);
                var _step = { translate : {
                    x: helpers.toNotNull(step.translate.x, jQuery(canvas).width() / jQuery(el).width()),
                    y: helpers.toNotNull(step.translate.y, jQuery(canvas).width() / jQuery(el).width()),
                    z: helpers.toNotNull(step.translate.z, jQuery(canvas).width() / jQuery(el).width())
                }};
                d = {
                    transform: "translate(-50%,-50%)"+rotate(step.rotate, true) + translate(_step.translate),
                    transitionDuration: duration + "ms",
                    transitionDelay: 0 + "ms"
                };
                // console.log('step ',d);
                css($('.spotlight'), d);
            }
            
            
            // Here is a tricky part...
            //
            // If there is no change in scale or no change in rotation and translation, it means there was actually
            // no delay - because there was no transition on `root` or `canvas` elements.
            // We want to trigger `impress:stepenter` event in the correct moment, so here we compare the current
            // and target values to check if delay should be taken into account.
            //
            // I know that this `if` statement looks scary, but it's pretty simple when you know what is going on
            // - it's simply comparing all the values.
            if ( currentState.scale === target.scale ||
                (currentState.rotate.x === target.rotate.x && currentState.rotate.y === target.rotate.y &&
                 currentState.rotate.z === target.rotate.z && currentState.translate.x === target.translate.x &&
                 currentState.translate.y === target.translate.y && currentState.translate.z === target.translate.z) ) {
                delay = 0;
            }
            
            // store current state
            currentState = target;
            activeStep = el;
            
            // And here is where we trigger `impress:stepenter` event.
            // We simply set up a timeout to fire it taking transition duration (and possible delay) into account.
            //
            // I really wanted to make it in more elegant way. The `transitionend` event seemed to be the best way
            // to do it, but the fact that I'm using transitions on two separate elements and that the `transitionend`
            // event is only triggered when there was a transition (change in the values) caused some bugs and 
            // made the code really complicated, cause I had to handle all the conditions separately. And it still
            // needed a `setTimeout` fallback for the situations when there is no transition at all.
            // So I decided that I'd rather make the code simpler than use shiny new `transitionend`.
            //
            // If you want learn something interesting and see how it was done with `transitionend` go back to
            // version 0.5.2 of impress.js: http://github.com/bartaz/impress.js/blob/0.5.2/js/impress.js
            onStepEnter(activeStep);
            window.clearTimeout(stepEnterTimeout);
            stepEnterTimeout = window.setTimeout(function() {
                onStepEnter(activeStep);
            }, duration + delay);
            
            return el;
        };
        
        // `prev` API function goes to previous step (in document order)
        var prev = function () {
            var prev = steps.indexOf( activeStep ) - 1;
            prev = prev >= 0 ? steps[ prev ] : steps[ steps.length-1 ];
            
            return goto(prev);
        };
        
        // `next` API function goes to next step (in document order)
        var next = function () {
            var next = steps.indexOf( activeStep ) + 1;
            next = next < steps.length ? steps[ next ] : steps[ 0 ];
            
            return goto(next);
        };
        
        // Adding some useful classes to step elements.
        //
        // All the steps that have not been shown yet are given `future` class.
        // When the step is entered the `future` class is removed and the `present`
        // class is given. When the step is left `present` class is replaced with
        // `past` class.
        //
        // So every step element is always in one of three possible states:
        // `future`, `present` and `past`.
        //
        // There classes can be used in CSS to style different types of steps.
        // For example the `present` class can be used to trigger some custom
        // animations when step is shown.
        root.addEventListener("impress:init", function(){
            // STEP CLASSES
            steps.forEach(function (step) {
                step.classList.add("future");
            });
            
            root.addEventListener("impress:stepenter", function (event) {
                event.target.classList.remove("past");
                event.target.classList.remove("future");
                event.target.classList.add("present");
            }, false);
            
            root.addEventListener("impress:stepleave", function (event) {
                event.target.classList.remove("present");
                event.target.classList.add("past");
            }, false);
            
        }, false);
        
        if(root.className.match(/nohash/) === -1){
          // Adding hash change support.
          root.addEventListener("impress:init", function(){
              
              // last hash detected
              var lastHash = "";
              
              // `#/step-id` is used instead of `#step-id` to prevent default browser
              // scrolling to element in hash.
              //
              // And it has to be set after animation finishes, because in Chrome it
              // makes transtion laggy.
              // BUG: http://code.google.com/p/chromium/issues/detail?id=62820
              root.addEventListener("impress:stepenter", function (event) {
                  window.location.hash = lastHash = "#/" + event.target.id;
              }, false);
              
              window.addEventListener("hashchange", function () {
                  // When the step is entered hash in the location is updated
                  // (just few lines above from here), so the hash change is 
                  // triggered and we would call `goto` again on the same element.
                  //
                  // To avoid this we store last entered hash and compare.
                  if (window.location.hash !== lastHash) {
                      goto( getElementFromHash() );
                  }
              }, false);
              
              // START 
              // by selecting step defined in url or first step of the presentation
              goto(getElementFromHash() || steps[0], 0);
          }, false);
        } else {
          root.addEventListener("impress:init", function(){
            goto(steps[0], 0);
          }, false);
        }
        body.classList.add("impress-disabled");
        
        // store and return API for given impress.js root element
        return (roots[ "impress-root-" + rootId ] = {
            init: init,
            initStep: initStep,
            goto: goto,
            next: next,
            prev: prev
        });

    };
    
    // flag that can be used in JS to check if browser have passed the support test
    impress.supported = impressSupported;
    
})(document, window);

// RESIZE EVENTS

// As you can see this part is separate from the impress.js core code.
// It's because these navigation actions only need what impress.js provides with
// its simple API.
//
// In future I think about moving it to make them optional, move to separate files
// and treat more like a 'plugins'.
(function ( document, window ) {
    'use strict';
    
    // wait for impress.js to be initialized
    document.addEventListener("impress:init", function (event) {
        // Getting API from event data.
        // So you don't event need to know what is the id of the root element
        // or anything. `impress:init` event data gives you everything you 
        // need to control the presentation that was just initialized.
        var api = event.detail.api;
        
        // KEYBOARD NAVIGATION HANDLERS
        
        // Prevent default keydown action when one of supported key is pressed.
        // document.addEventListener("keydown", function ( event ) {
            // if ( event.keyCode === 9 || ( event.keyCode >= 32 && event.keyCode <= 34 ) || (event.keyCode >= 37 && event.keyCode <= 40) ) {
                // event.preventDefault();
            // }
        // }, false);
        
        // Trigger impress action (next or prev) on keyup.
        
        // Supported keys are:
        // [space] - quite common in presentation software to move forward
        // [up] [right] / [down] [left] - again common and natural addition,
        // [pgdown] / [pgup] - often triggered by remote controllers,
        // [tab] - this one is quite controversial, but the reason it ended up on
        //   this list is quite an interesting story... Remember that strange part
        //   in the impress.js code where window is scrolled to 0,0 on every presentation
        //   step, because sometimes browser scrolls viewport because of the focused element?
        //   Well, the [tab] key by default navigates around focusable elements, so clicking
        //   it very often caused scrolling to focused element and breaking impress.js
        //   positioning. I didn't want to just prevent this default action, so I used [tab]
        //   as another way to moving to next step... And yes, I know that for the sake of
        //   consistency I should add [shift+tab] as opposite action...
        // document.addEventListener("keyup", function ( event ) {
            // if ( event.keyCode === 9 || ( event.keyCode >= 32 && event.keyCode <= 34 ) || (event.keyCode >= 37 && event.keyCode <= 40) ) {
                // switch( event.keyCode ) {
                    // case 33: // pg up
                    // case 37: // left
                    // case 38: // up
                             // api.prev();
                             // break;
                    // case 9:  // tab
                    // case 32: // space
                    // case 34: // pg down
                    // case 39: // right
                    // case 40: // down
                             // api.next();
                             // break;
                // }
                
                // event.preventDefault();
            // }
        // }, false);
        
        // // delegated handler for clicking on the links to presentation steps
        // document.addEventListener("click", function ( event ) {
            // // event delegation with "bubbling"
            // // check if event target (or any of its parents is a link)
            // var target = event.target;
            // while ( (target.tagName !== "A") &&
                    // (target !== document.documentElement) ) {
                // target = target.parentNode;
            // }
            
            // if ( target.tagName === "A" ) {
                // var href = target.getAttribute("href");
                
                // // if it's a link to presentation step, target this step
                // if ( href && href[0] === '#' ) {
                    // target = document.getElementById( href.slice(1) );
                // }
            // }
            
            // if ( api.goto(target) ) {
                // event.stopImmediatePropagation();
                // event.preventDefault();
            // }
        // }, false);
        
        // // delegated handler for clicking on step elements
        // document.addEventListener("click", function ( event ) {
            // var target = event.target;
            // // find closest step element that is not active
            // while ( !(target.classList.contains("step") && !target.classList.contains("active")) &&
                    // (target !== document.documentElement) ) {
                // target = target.parentNode;
            // }
            
            // if ( api.goto(target) ) {
                // event.preventDefault();
            // }
        // }, false);
        
        // // touch handler to detect taps on the left and right side of the screen
        // // based on awesome work of @hakimel: https://github.com/hakimel/reveal.js
        // document.addEventListener("touchstart", function ( event ) {
            // if (event.touches.length === 1) {
                // var x = event.touches[0].clientX,
                    // width = window.innerWidth * 0.3,
                    // result = null;
                    
                // if ( x < width ) {
                    // result = api.prev();
                // } else if ( x > window.innerWidth - width ) {
                    // result = api.next();
                // }
                
                // if (result) {
                    // event.preventDefault();
                // }
            // }
        // }, false);
        
        // rescale presentation when window is resized
        window.addEventListener("resize", helpers.throttle(function () {
            // force going to active step again, to trigger rescaling
            api.goto( document.querySelector(".step.active"), 500 );
        }, 250), false);
        
    }, false);
        
})(document, window);

// THAT'S ALL FOLKS!
//
// Thanks for reading it all.
// Or thanks for scrolling down and reading the last part.
//
// I've learnt a lot when building impress.js and I hope this code and comments
// will help somebody learn at least some part of it.
/* TWEENMAX.MIN.JS */
/*!
 * VERSION: 1.13.1
 * DATE: 2014-07-19
 * UPDATES AND DOCS AT: http://www.greensock.com
 * 
 * Includes all of the following: TweenLite, TweenMax, TimelineLite, TimelineMax, EasePack, CSSPlugin, RoundPropsPlugin, BezierPlugin, AttrPlugin, DirectionalRotationPlugin
 *
 * @license Copyright (c) 2008-2014, GreenSock. All rights reserved.
 * This work is subject to the terms at http://www.greensock.com/terms_of_use.html or for
 * Club GreenSock members, the software agreement that was issued with your membership.
 * 
 * @author: Jack Doyle, jack@greensock.com
 **/
var _gsScope="undefined"!=typeof module&&module.exports&&"undefined"!=typeof global?global:this||window;(_gsScope._gsQueue||(_gsScope._gsQueue=[])).push(function(){"use strict";_gsScope._gsDefine("TweenMax",["core.Animation","core.SimpleTimeline","TweenLite"],function(t,e,i){var s=function(t){var e,i=[],s=t.length;for(e=0;e!==s;i.push(t[e++]));return i},r=function(t,e,s){i.call(this,t,e,s),this._cycle=0,this._yoyo=this.vars.yoyo===!0,this._repeat=this.vars.repeat||0,this._repeatDelay=this.vars.repeatDelay||0,this._dirty=!0,this.render=r.prototype.render},n=1e-10,a=i._internals,o=a.isSelector,h=a.isArray,l=r.prototype=i.to({},.1,{}),_=[];r.version="1.13.1",l.constructor=r,l.kill()._gc=!1,r.killTweensOf=r.killDelayedCallsTo=i.killTweensOf,r.getTweensOf=i.getTweensOf,r.lagSmoothing=i.lagSmoothing,r.ticker=i.ticker,r.render=i.render,l.invalidate=function(){return this._yoyo=this.vars.yoyo===!0,this._repeat=this.vars.repeat||0,this._repeatDelay=this.vars.repeatDelay||0,this._uncache(!0),i.prototype.invalidate.call(this)},l.updateTo=function(t,e){var s,r=this.ratio;e&&this._startTime<this._timeline._time&&(this._startTime=this._timeline._time,this._uncache(!1),this._gc?this._enabled(!0,!1):this._timeline.insert(this,this._startTime-this._delay));for(s in t)this.vars[s]=t[s];if(this._initted)if(e)this._initted=!1;else if(this._gc&&this._enabled(!0,!1),this._notifyPluginsOfEnabled&&this._firstPT&&i._onPluginEvent("_onDisable",this),this._time/this._duration>.998){var n=this._time;this.render(0,!0,!1),this._initted=!1,this.render(n,!0,!1)}else if(this._time>0){this._initted=!1,this._init();for(var a,o=1/(1-r),h=this._firstPT;h;)a=h.s+h.c,h.c*=o,h.s=a-h.c,h=h._next}return this},l.render=function(t,e,i){this._initted||0===this._duration&&this.vars.repeat&&this.invalidate();var s,r,o,h,l,u,p,c,f=this._dirty?this.totalDuration():this._totalDuration,m=this._time,d=this._totalTime,g=this._cycle,v=this._duration,y=this._rawPrevTime;if(t>=f?(this._totalTime=f,this._cycle=this._repeat,this._yoyo&&0!==(1&this._cycle)?(this._time=0,this.ratio=this._ease._calcEnd?this._ease.getRatio(0):0):(this._time=v,this.ratio=this._ease._calcEnd?this._ease.getRatio(1):1),this._reversed||(s=!0,r="onComplete"),0===v&&(this._initted||!this.vars.lazy||i)&&(this._startTime===this._timeline._duration&&(t=0),(0===t||0>y||y===n)&&y!==t&&(i=!0,y>n&&(r="onReverseComplete")),this._rawPrevTime=c=!e||t||y===t?t:n)):1e-7>t?(this._totalTime=this._time=this._cycle=0,this.ratio=this._ease._calcEnd?this._ease.getRatio(0):0,(0!==d||0===v&&y>0&&y!==n)&&(r="onReverseComplete",s=this._reversed),0>t?(this._active=!1,0===v&&(this._initted||!this.vars.lazy||i)&&(y>=0&&(i=!0),this._rawPrevTime=c=!e||t||y===t?t:n)):this._initted||(i=!0)):(this._totalTime=this._time=t,0!==this._repeat&&(h=v+this._repeatDelay,this._cycle=this._totalTime/h>>0,0!==this._cycle&&this._cycle===this._totalTime/h&&this._cycle--,this._time=this._totalTime-this._cycle*h,this._yoyo&&0!==(1&this._cycle)&&(this._time=v-this._time),this._time>v?this._time=v:0>this._time&&(this._time=0)),this._easeType?(l=this._time/v,u=this._easeType,p=this._easePower,(1===u||3===u&&l>=.5)&&(l=1-l),3===u&&(l*=2),1===p?l*=l:2===p?l*=l*l:3===p?l*=l*l*l:4===p&&(l*=l*l*l*l),this.ratio=1===u?1-l:2===u?l:.5>this._time/v?l/2:1-l/2):this.ratio=this._ease.getRatio(this._time/v)),m===this._time&&!i&&g===this._cycle)return d!==this._totalTime&&this._onUpdate&&(e||this._onUpdate.apply(this.vars.onUpdateScope||this,this.vars.onUpdateParams||_)),void 0;if(!this._initted){if(this._init(),!this._initted||this._gc)return;if(!i&&this._firstPT&&(this.vars.lazy!==!1&&this._duration||this.vars.lazy&&!this._duration))return this._time=m,this._totalTime=d,this._rawPrevTime=y,this._cycle=g,a.lazyTweens.push(this),this._lazy=t,void 0;this._time&&!s?this.ratio=this._ease.getRatio(this._time/v):s&&this._ease._calcEnd&&(this.ratio=this._ease.getRatio(0===this._time?0:1))}for(this._lazy!==!1&&(this._lazy=!1),this._active||!this._paused&&this._time!==m&&t>=0&&(this._active=!0),0===d&&(2===this._initted&&t>0&&this._init(),this._startAt&&(t>=0?this._startAt.render(t,e,i):r||(r="_dummyGS")),this.vars.onStart&&(0!==this._totalTime||0===v)&&(e||this.vars.onStart.apply(this.vars.onStartScope||this,this.vars.onStartParams||_))),o=this._firstPT;o;)o.f?o.t[o.p](o.c*this.ratio+o.s):o.t[o.p]=o.c*this.ratio+o.s,o=o._next;this._onUpdate&&(0>t&&this._startAt&&this._startTime&&this._startAt.render(t,e,i),e||(this._totalTime!==d||s)&&this._onUpdate.apply(this.vars.onUpdateScope||this,this.vars.onUpdateParams||_)),this._cycle!==g&&(e||this._gc||this.vars.onRepeat&&this.vars.onRepeat.apply(this.vars.onRepeatScope||this,this.vars.onRepeatParams||_)),r&&(!this._gc||i)&&(0>t&&this._startAt&&!this._onUpdate&&this._startTime&&this._startAt.render(t,e,i),s&&(this._timeline.autoRemoveChildren&&this._enabled(!1,!1),this._active=!1),!e&&this.vars[r]&&this.vars[r].apply(this.vars[r+"Scope"]||this,this.vars[r+"Params"]||_),0===v&&this._rawPrevTime===n&&c!==n&&(this._rawPrevTime=0))},r.to=function(t,e,i){return new r(t,e,i)},r.from=function(t,e,i){return i.runBackwards=!0,i.immediateRender=0!=i.immediateRender,new r(t,e,i)},r.fromTo=function(t,e,i,s){return s.startAt=i,s.immediateRender=0!=s.immediateRender&&0!=i.immediateRender,new r(t,e,s)},r.staggerTo=r.allTo=function(t,e,n,a,l,u,p){a=a||0;var c,f,m,d,g=n.delay||0,v=[],y=function(){n.onComplete&&n.onComplete.apply(n.onCompleteScope||this,arguments),l.apply(p||this,u||_)};for(h(t)||("string"==typeof t&&(t=i.selector(t)||t),o(t)&&(t=s(t))),c=t.length,m=0;c>m;m++){f={};for(d in n)f[d]=n[d];f.delay=g,m===c-1&&l&&(f.onComplete=y),v[m]=new r(t[m],e,f),g+=a}return v},r.staggerFrom=r.allFrom=function(t,e,i,s,n,a,o){return i.runBackwards=!0,i.immediateRender=0!=i.immediateRender,r.staggerTo(t,e,i,s,n,a,o)},r.staggerFromTo=r.allFromTo=function(t,e,i,s,n,a,o,h){return s.startAt=i,s.immediateRender=0!=s.immediateRender&&0!=i.immediateRender,r.staggerTo(t,e,s,n,a,o,h)},r.delayedCall=function(t,e,i,s,n){return new r(e,0,{delay:t,onComplete:e,onCompleteParams:i,onCompleteScope:s,onReverseComplete:e,onReverseCompleteParams:i,onReverseCompleteScope:s,immediateRender:!1,useFrames:n,overwrite:0})},r.set=function(t,e){return new r(t,0,e)},r.isTweening=function(t){return i.getTweensOf(t,!0).length>0};var u=function(t,e){for(var s=[],r=0,n=t._first;n;)n instanceof i?s[r++]=n:(e&&(s[r++]=n),s=s.concat(u(n,e)),r=s.length),n=n._next;return s},p=r.getAllTweens=function(e){return u(t._rootTimeline,e).concat(u(t._rootFramesTimeline,e))};r.killAll=function(t,i,s,r){null==i&&(i=!0),null==s&&(s=!0);var n,a,o,h=p(0!=r),l=h.length,_=i&&s&&r;for(o=0;l>o;o++)a=h[o],(_||a instanceof e||(n=a.target===a.vars.onComplete)&&s||i&&!n)&&(t?a.totalTime(a._reversed?0:a.totalDuration()):a._enabled(!1,!1))},r.killChildTweensOf=function(t,e){if(null!=t){var n,l,_,u,p,c=a.tweenLookup;if("string"==typeof t&&(t=i.selector(t)||t),o(t)&&(t=s(t)),h(t))for(u=t.length;--u>-1;)r.killChildTweensOf(t[u],e);else{n=[];for(_ in c)for(l=c[_].target.parentNode;l;)l===t&&(n=n.concat(c[_].tweens)),l=l.parentNode;for(p=n.length,u=0;p>u;u++)e&&n[u].totalTime(n[u].totalDuration()),n[u]._enabled(!1,!1)}}};var c=function(t,i,s,r){i=i!==!1,s=s!==!1,r=r!==!1;for(var n,a,o=p(r),h=i&&s&&r,l=o.length;--l>-1;)a=o[l],(h||a instanceof e||(n=a.target===a.vars.onComplete)&&s||i&&!n)&&a.paused(t)};return r.pauseAll=function(t,e,i){c(!0,t,e,i)},r.resumeAll=function(t,e,i){c(!1,t,e,i)},r.globalTimeScale=function(e){var s=t._rootTimeline,r=i.ticker.time;return arguments.length?(e=e||n,s._startTime=r-(r-s._startTime)*s._timeScale/e,s=t._rootFramesTimeline,r=i.ticker.frame,s._startTime=r-(r-s._startTime)*s._timeScale/e,s._timeScale=t._rootTimeline._timeScale=e,e):s._timeScale},l.progress=function(t){return arguments.length?this.totalTime(this.duration()*(this._yoyo&&0!==(1&this._cycle)?1-t:t)+this._cycle*(this._duration+this._repeatDelay),!1):this._time/this.duration()},l.totalProgress=function(t){return arguments.length?this.totalTime(this.totalDuration()*t,!1):this._totalTime/this.totalDuration()},l.time=function(t,e){return arguments.length?(this._dirty&&this.totalDuration(),t>this._duration&&(t=this._duration),this._yoyo&&0!==(1&this._cycle)?t=this._duration-t+this._cycle*(this._duration+this._repeatDelay):0!==this._repeat&&(t+=this._cycle*(this._duration+this._repeatDelay)),this.totalTime(t,e)):this._time},l.duration=function(e){return arguments.length?t.prototype.duration.call(this,e):this._duration},l.totalDuration=function(t){return arguments.length?-1===this._repeat?this:this.duration((t-this._repeat*this._repeatDelay)/(this._repeat+1)):(this._dirty&&(this._totalDuration=-1===this._repeat?999999999999:this._duration*(this._repeat+1)+this._repeatDelay*this._repeat,this._dirty=!1),this._totalDuration)},l.repeat=function(t){return arguments.length?(this._repeat=t,this._uncache(!0)):this._repeat},l.repeatDelay=function(t){return arguments.length?(this._repeatDelay=t,this._uncache(!0)):this._repeatDelay},l.yoyo=function(t){return arguments.length?(this._yoyo=t,this):this._yoyo},r},!0),_gsScope._gsDefine("TimelineLite",["core.Animation","core.SimpleTimeline","TweenLite"],function(t,e,i){var s=function(t){e.call(this,t),this._labels={},this.autoRemoveChildren=this.vars.autoRemoveChildren===!0,this.smoothChildTiming=this.vars.smoothChildTiming===!0,this._sortChildren=!0,this._onUpdate=this.vars.onUpdate;var i,s,r=this.vars;for(s in r)i=r[s],o(i)&&-1!==i.join("").indexOf("{self}")&&(r[s]=this._swapSelfInParams(i));o(r.tweens)&&this.add(r.tweens,0,r.align,r.stagger)},r=1e-10,n=i._internals,a=n.isSelector,o=n.isArray,h=n.lazyTweens,l=n.lazyRender,_=[],u=_gsScope._gsDefine.globals,p=function(t){var e,i={};for(e in t)i[e]=t[e];return i},c=function(t,e,i,s){t._timeline.pause(t._startTime),e&&e.apply(s||t._timeline,i||_)},f=function(t){var e,i=[],s=t.length;for(e=0;e!==s;i.push(t[e++]));return i},m=s.prototype=new e;return s.version="1.13.1",m.constructor=s,m.kill()._gc=!1,m.to=function(t,e,s,r){var n=s.repeat&&u.TweenMax||i;return e?this.add(new n(t,e,s),r):this.set(t,s,r)},m.from=function(t,e,s,r){return this.add((s.repeat&&u.TweenMax||i).from(t,e,s),r)},m.fromTo=function(t,e,s,r,n){var a=r.repeat&&u.TweenMax||i;return e?this.add(a.fromTo(t,e,s,r),n):this.set(t,r,n)},m.staggerTo=function(t,e,r,n,o,h,l,_){var u,c=new s({onComplete:h,onCompleteParams:l,onCompleteScope:_,smoothChildTiming:this.smoothChildTiming});for("string"==typeof t&&(t=i.selector(t)||t),a(t)&&(t=f(t)),n=n||0,u=0;t.length>u;u++)r.startAt&&(r.startAt=p(r.startAt)),c.to(t[u],e,p(r),u*n);return this.add(c,o)},m.staggerFrom=function(t,e,i,s,r,n,a,o){return i.immediateRender=0!=i.immediateRender,i.runBackwards=!0,this.staggerTo(t,e,i,s,r,n,a,o)},m.staggerFromTo=function(t,e,i,s,r,n,a,o,h){return s.startAt=i,s.immediateRender=0!=s.immediateRender&&0!=i.immediateRender,this.staggerTo(t,e,s,r,n,a,o,h)},m.call=function(t,e,s,r){return this.add(i.delayedCall(0,t,e,s),r)},m.set=function(t,e,s){return s=this._parseTimeOrLabel(s,0,!0),null==e.immediateRender&&(e.immediateRender=s===this._time&&!this._paused),this.add(new i(t,0,e),s)},s.exportRoot=function(t,e){t=t||{},null==t.smoothChildTiming&&(t.smoothChildTiming=!0);var r,n,a=new s(t),o=a._timeline;for(null==e&&(e=!0),o._remove(a,!0),a._startTime=0,a._rawPrevTime=a._time=a._totalTime=o._time,r=o._first;r;)n=r._next,e&&r instanceof i&&r.target===r.vars.onComplete||a.add(r,r._startTime-r._delay),r=n;return o.add(a,0),a},m.add=function(r,n,a,h){var l,_,u,p,c,f;if("number"!=typeof n&&(n=this._parseTimeOrLabel(n,0,!0,r)),!(r instanceof t)){if(r instanceof Array||r&&r.push&&o(r)){for(a=a||"normal",h=h||0,l=n,_=r.length,u=0;_>u;u++)o(p=r[u])&&(p=new s({tweens:p})),this.add(p,l),"string"!=typeof p&&"function"!=typeof p&&("sequence"===a?l=p._startTime+p.totalDuration()/p._timeScale:"start"===a&&(p._startTime-=p.delay())),l+=h;return this._uncache(!0)}if("string"==typeof r)return this.addLabel(r,n);if("function"!=typeof r)throw"Cannot add "+r+" into the timeline; it is not a tween, timeline, function, or string.";r=i.delayedCall(0,r)}if(e.prototype.add.call(this,r,n),(this._gc||this._time===this._duration)&&!this._paused&&this._duration<this.duration())for(c=this,f=c.rawTime()>r._startTime;c._timeline;)f&&c._timeline.smoothChildTiming?c.totalTime(c._totalTime,!0):c._gc&&c._enabled(!0,!1),c=c._timeline;return this},m.remove=function(e){if(e instanceof t)return this._remove(e,!1);if(e instanceof Array||e&&e.push&&o(e)){for(var i=e.length;--i>-1;)this.remove(e[i]);return this}return"string"==typeof e?this.removeLabel(e):this.kill(null,e)},m._remove=function(t,i){e.prototype._remove.call(this,t,i);var s=this._last;return s?this._time>s._startTime+s._totalDuration/s._timeScale&&(this._time=this.duration(),this._totalTime=this._totalDuration):this._time=this._totalTime=this._duration=this._totalDuration=0,this},m.append=function(t,e){return this.add(t,this._parseTimeOrLabel(null,e,!0,t))},m.insert=m.insertMultiple=function(t,e,i,s){return this.add(t,e||0,i,s)},m.appendMultiple=function(t,e,i,s){return this.add(t,this._parseTimeOrLabel(null,e,!0,t),i,s)},m.addLabel=function(t,e){return this._labels[t]=this._parseTimeOrLabel(e),this},m.addPause=function(t,e,i,s){return this.call(c,["{self}",e,i,s],this,t)},m.removeLabel=function(t){return delete this._labels[t],this},m.getLabelTime=function(t){return null!=this._labels[t]?this._labels[t]:-1},m._parseTimeOrLabel=function(e,i,s,r){var n;if(r instanceof t&&r.timeline===this)this.remove(r);else if(r&&(r instanceof Array||r.push&&o(r)))for(n=r.length;--n>-1;)r[n]instanceof t&&r[n].timeline===this&&this.remove(r[n]);if("string"==typeof i)return this._parseTimeOrLabel(i,s&&"number"==typeof e&&null==this._labels[i]?e-this.duration():0,s);if(i=i||0,"string"!=typeof e||!isNaN(e)&&null==this._labels[e])null==e&&(e=this.duration());else{if(n=e.indexOf("="),-1===n)return null==this._labels[e]?s?this._labels[e]=this.duration()+i:i:this._labels[e]+i;i=parseInt(e.charAt(n-1)+"1",10)*Number(e.substr(n+1)),e=n>1?this._parseTimeOrLabel(e.substr(0,n-1),0,s):this.duration()}return Number(e)+i},m.seek=function(t,e){return this.totalTime("number"==typeof t?t:this._parseTimeOrLabel(t),e!==!1)},m.stop=function(){return this.paused(!0)},m.gotoAndPlay=function(t,e){return this.play(t,e)},m.gotoAndStop=function(t,e){return this.pause(t,e)},m.render=function(t,e,i){this._gc&&this._enabled(!0,!1);var s,n,a,o,u,p=this._dirty?this.totalDuration():this._totalDuration,c=this._time,f=this._startTime,m=this._timeScale,d=this._paused;if(t>=p?(this._totalTime=this._time=p,this._reversed||this._hasPausedChild()||(n=!0,o="onComplete",0===this._duration&&(0===t||0>this._rawPrevTime||this._rawPrevTime===r)&&this._rawPrevTime!==t&&this._first&&(u=!0,this._rawPrevTime>r&&(o="onReverseComplete"))),this._rawPrevTime=this._duration||!e||t||this._rawPrevTime===t?t:r,t=p+1e-4):1e-7>t?(this._totalTime=this._time=0,(0!==c||0===this._duration&&this._rawPrevTime!==r&&(this._rawPrevTime>0||0>t&&this._rawPrevTime>=0))&&(o="onReverseComplete",n=this._reversed),0>t?(this._active=!1,this._rawPrevTime>=0&&this._first&&(u=!0),this._rawPrevTime=t):(this._rawPrevTime=this._duration||!e||t||this._rawPrevTime===t?t:r,t=0,this._initted||(u=!0))):this._totalTime=this._time=this._rawPrevTime=t,this._time!==c&&this._first||i||u){if(this._initted||(this._initted=!0),this._active||!this._paused&&this._time!==c&&t>0&&(this._active=!0),0===c&&this.vars.onStart&&0!==this._time&&(e||this.vars.onStart.apply(this.vars.onStartScope||this,this.vars.onStartParams||_)),this._time>=c)for(s=this._first;s&&(a=s._next,!this._paused||d);)(s._active||s._startTime<=this._time&&!s._paused&&!s._gc)&&(s._reversed?s.render((s._dirty?s.totalDuration():s._totalDuration)-(t-s._startTime)*s._timeScale,e,i):s.render((t-s._startTime)*s._timeScale,e,i)),s=a;else for(s=this._last;s&&(a=s._prev,!this._paused||d);)(s._active||c>=s._startTime&&!s._paused&&!s._gc)&&(s._reversed?s.render((s._dirty?s.totalDuration():s._totalDuration)-(t-s._startTime)*s._timeScale,e,i):s.render((t-s._startTime)*s._timeScale,e,i)),s=a;this._onUpdate&&(e||(h.length&&l(),this._onUpdate.apply(this.vars.onUpdateScope||this,this.vars.onUpdateParams||_))),o&&(this._gc||(f===this._startTime||m!==this._timeScale)&&(0===this._time||p>=this.totalDuration())&&(n&&(h.length&&l(),this._timeline.autoRemoveChildren&&this._enabled(!1,!1),this._active=!1),!e&&this.vars[o]&&this.vars[o].apply(this.vars[o+"Scope"]||this,this.vars[o+"Params"]||_)))}},m._hasPausedChild=function(){for(var t=this._first;t;){if(t._paused||t instanceof s&&t._hasPausedChild())return!0;t=t._next}return!1},m.getChildren=function(t,e,s,r){r=r||-9999999999;for(var n=[],a=this._first,o=0;a;)r>a._startTime||(a instanceof i?e!==!1&&(n[o++]=a):(s!==!1&&(n[o++]=a),t!==!1&&(n=n.concat(a.getChildren(!0,e,s)),o=n.length))),a=a._next;return n},m.getTweensOf=function(t,e){var s,r,n=this._gc,a=[],o=0;for(n&&this._enabled(!0,!0),s=i.getTweensOf(t),r=s.length;--r>-1;)(s[r].timeline===this||e&&this._contains(s[r]))&&(a[o++]=s[r]);return n&&this._enabled(!1,!0),a},m._contains=function(t){for(var e=t.timeline;e;){if(e===this)return!0;e=e.timeline}return!1},m.shiftChildren=function(t,e,i){i=i||0;for(var s,r=this._first,n=this._labels;r;)r._startTime>=i&&(r._startTime+=t),r=r._next;if(e)for(s in n)n[s]>=i&&(n[s]+=t);return this._uncache(!0)},m._kill=function(t,e){if(!t&&!e)return this._enabled(!1,!1);for(var i=e?this.getTweensOf(e):this.getChildren(!0,!0,!1),s=i.length,r=!1;--s>-1;)i[s]._kill(t,e)&&(r=!0);return r},m.clear=function(t){var e=this.getChildren(!1,!0,!0),i=e.length;for(this._time=this._totalTime=0;--i>-1;)e[i]._enabled(!1,!1);return t!==!1&&(this._labels={}),this._uncache(!0)},m.invalidate=function(){for(var t=this._first;t;)t.invalidate(),t=t._next;return this},m._enabled=function(t,i){if(t===this._gc)for(var s=this._first;s;)s._enabled(t,!0),s=s._next;return e.prototype._enabled.call(this,t,i)},m.duration=function(t){return arguments.length?(0!==this.duration()&&0!==t&&this.timeScale(this._duration/t),this):(this._dirty&&this.totalDuration(),this._duration)},m.totalDuration=function(t){if(!arguments.length){if(this._dirty){for(var e,i,s=0,r=this._last,n=999999999999;r;)e=r._prev,r._dirty&&r.totalDuration(),r._startTime>n&&this._sortChildren&&!r._paused?this.add(r,r._startTime-r._delay):n=r._startTime,0>r._startTime&&!r._paused&&(s-=r._startTime,this._timeline.smoothChildTiming&&(this._startTime+=r._startTime/this._timeScale),this.shiftChildren(-r._startTime,!1,-9999999999),n=0),i=r._startTime+r._totalDuration/r._timeScale,i>s&&(s=i),r=e;this._duration=this._totalDuration=s,this._dirty=!1}return this._totalDuration}return 0!==this.totalDuration()&&0!==t&&this.timeScale(this._totalDuration/t),this},m.usesFrames=function(){for(var e=this._timeline;e._timeline;)e=e._timeline;return e===t._rootFramesTimeline},m.rawTime=function(){return this._paused?this._totalTime:(this._timeline.rawTime()-this._startTime)*this._timeScale},s},!0),_gsScope._gsDefine("TimelineMax",["TimelineLite","TweenLite","easing.Ease"],function(t,e,i){var s=function(e){t.call(this,e),this._repeat=this.vars.repeat||0,this._repeatDelay=this.vars.repeatDelay||0,this._cycle=0,this._yoyo=this.vars.yoyo===!0,this._dirty=!0},r=1e-10,n=[],a=e._internals,o=a.lazyTweens,h=a.lazyRender,l=new i(null,null,1,0),_=s.prototype=new t;return _.constructor=s,_.kill()._gc=!1,s.version="1.13.1",_.invalidate=function(){return this._yoyo=this.vars.yoyo===!0,this._repeat=this.vars.repeat||0,this._repeatDelay=this.vars.repeatDelay||0,this._uncache(!0),t.prototype.invalidate.call(this)},_.addCallback=function(t,i,s,r){return this.add(e.delayedCall(0,t,s,r),i)},_.removeCallback=function(t,e){if(t)if(null==e)this._kill(null,t);else for(var i=this.getTweensOf(t,!1),s=i.length,r=this._parseTimeOrLabel(e);--s>-1;)i[s]._startTime===r&&i[s]._enabled(!1,!1);return this},_.tweenTo=function(t,i){i=i||{};var s,r,a,o={ease:l,overwrite:i.delay?2:1,useFrames:this.usesFrames(),immediateRender:!1};for(r in i)o[r]=i[r];return o.time=this._parseTimeOrLabel(t),s=Math.abs(Number(o.time)-this._time)/this._timeScale||.001,a=new e(this,s,o),o.onStart=function(){a.target.paused(!0),a.vars.time!==a.target.time()&&s===a.duration()&&a.duration(Math.abs(a.vars.time-a.target.time())/a.target._timeScale),i.onStart&&i.onStart.apply(i.onStartScope||a,i.onStartParams||n)},a},_.tweenFromTo=function(t,e,i){i=i||{},t=this._parseTimeOrLabel(t),i.startAt={onComplete:this.seek,onCompleteParams:[t],onCompleteScope:this},i.immediateRender=i.immediateRender!==!1;var s=this.tweenTo(e,i);return s.duration(Math.abs(s.vars.time-t)/this._timeScale||.001)},_.render=function(t,e,i){this._gc&&this._enabled(!0,!1);var s,a,l,_,u,p,c=this._dirty?this.totalDuration():this._totalDuration,f=this._duration,m=this._time,d=this._totalTime,g=this._startTime,v=this._timeScale,y=this._rawPrevTime,T=this._paused,w=this._cycle;if(t>=c?(this._locked||(this._totalTime=c,this._cycle=this._repeat),this._reversed||this._hasPausedChild()||(a=!0,_="onComplete",0===this._duration&&(0===t||0>y||y===r)&&y!==t&&this._first&&(u=!0,y>r&&(_="onReverseComplete"))),this._rawPrevTime=this._duration||!e||t||this._rawPrevTime===t?t:r,this._yoyo&&0!==(1&this._cycle)?this._time=t=0:(this._time=f,t=f+1e-4)):1e-7>t?(this._locked||(this._totalTime=this._cycle=0),this._time=0,(0!==m||0===f&&y!==r&&(y>0||0>t&&y>=0)&&!this._locked)&&(_="onReverseComplete",a=this._reversed),0>t?(this._active=!1,y>=0&&this._first&&(u=!0),this._rawPrevTime=t):(this._rawPrevTime=f||!e||t||this._rawPrevTime===t?t:r,t=0,this._initted||(u=!0))):(0===f&&0>y&&(u=!0),this._time=this._rawPrevTime=t,this._locked||(this._totalTime=t,0!==this._repeat&&(p=f+this._repeatDelay,this._cycle=this._totalTime/p>>0,0!==this._cycle&&this._cycle===this._totalTime/p&&this._cycle--,this._time=this._totalTime-this._cycle*p,this._yoyo&&0!==(1&this._cycle)&&(this._time=f-this._time),this._time>f?(this._time=f,t=f+1e-4):0>this._time?this._time=t=0:t=this._time))),this._cycle!==w&&!this._locked){var x=this._yoyo&&0!==(1&w),b=x===(this._yoyo&&0!==(1&this._cycle)),P=this._totalTime,S=this._cycle,k=this._rawPrevTime,R=this._time;if(this._totalTime=w*f,w>this._cycle?x=!x:this._totalTime+=f,this._time=m,this._rawPrevTime=0===f?y-1e-4:y,this._cycle=w,this._locked=!0,m=x?0:f,this.render(m,e,0===f),e||this._gc||this.vars.onRepeat&&this.vars.onRepeat.apply(this.vars.onRepeatScope||this,this.vars.onRepeatParams||n),b&&(m=x?f+1e-4:-1e-4,this.render(m,!0,!1)),this._locked=!1,this._paused&&!T)return;this._time=R,this._totalTime=P,this._cycle=S,this._rawPrevTime=k}if(!(this._time!==m&&this._first||i||u))return d!==this._totalTime&&this._onUpdate&&(e||this._onUpdate.apply(this.vars.onUpdateScope||this,this.vars.onUpdateParams||n)),void 0;if(this._initted||(this._initted=!0),this._active||!this._paused&&this._totalTime!==d&&t>0&&(this._active=!0),0===d&&this.vars.onStart&&0!==this._totalTime&&(e||this.vars.onStart.apply(this.vars.onStartScope||this,this.vars.onStartParams||n)),this._time>=m)for(s=this._first;s&&(l=s._next,!this._paused||T);)(s._active||s._startTime<=this._time&&!s._paused&&!s._gc)&&(s._reversed?s.render((s._dirty?s.totalDuration():s._totalDuration)-(t-s._startTime)*s._timeScale,e,i):s.render((t-s._startTime)*s._timeScale,e,i)),s=l;else for(s=this._last;s&&(l=s._prev,!this._paused||T);)(s._active||m>=s._startTime&&!s._paused&&!s._gc)&&(s._reversed?s.render((s._dirty?s.totalDuration():s._totalDuration)-(t-s._startTime)*s._timeScale,e,i):s.render((t-s._startTime)*s._timeScale,e,i)),s=l;this._onUpdate&&(e||(o.length&&h(),this._onUpdate.apply(this.vars.onUpdateScope||this,this.vars.onUpdateParams||n))),_&&(this._locked||this._gc||(g===this._startTime||v!==this._timeScale)&&(0===this._time||c>=this.totalDuration())&&(a&&(o.length&&h(),this._timeline.autoRemoveChildren&&this._enabled(!1,!1),this._active=!1),!e&&this.vars[_]&&this.vars[_].apply(this.vars[_+"Scope"]||this,this.vars[_+"Params"]||n)))},_.getActive=function(t,e,i){null==t&&(t=!0),null==e&&(e=!0),null==i&&(i=!1);var s,r,n=[],a=this.getChildren(t,e,i),o=0,h=a.length;for(s=0;h>s;s++)r=a[s],r.isActive()&&(n[o++]=r);return n},_.getLabelAfter=function(t){t||0!==t&&(t=this._time);var e,i=this.getLabelsArray(),s=i.length;for(e=0;s>e;e++)if(i[e].time>t)return i[e].name;return null},_.getLabelBefore=function(t){null==t&&(t=this._time);for(var e=this.getLabelsArray(),i=e.length;--i>-1;)if(t>e[i].time)return e[i].name;return null},_.getLabelsArray=function(){var t,e=[],i=0;for(t in this._labels)e[i++]={time:this._labels[t],name:t};return e.sort(function(t,e){return t.time-e.time}),e},_.progress=function(t){return arguments.length?this.totalTime(this.duration()*(this._yoyo&&0!==(1&this._cycle)?1-t:t)+this._cycle*(this._duration+this._repeatDelay),!1):this._time/this.duration()},_.totalProgress=function(t){return arguments.length?this.totalTime(this.totalDuration()*t,!1):this._totalTime/this.totalDuration()},_.totalDuration=function(e){return arguments.length?-1===this._repeat?this:this.duration((e-this._repeat*this._repeatDelay)/(this._repeat+1)):(this._dirty&&(t.prototype.totalDuration.call(this),this._totalDuration=-1===this._repeat?999999999999:this._duration*(this._repeat+1)+this._repeatDelay*this._repeat),this._totalDuration)},_.time=function(t,e){return arguments.length?(this._dirty&&this.totalDuration(),t>this._duration&&(t=this._duration),this._yoyo&&0!==(1&this._cycle)?t=this._duration-t+this._cycle*(this._duration+this._repeatDelay):0!==this._repeat&&(t+=this._cycle*(this._duration+this._repeatDelay)),this.totalTime(t,e)):this._time},_.repeat=function(t){return arguments.length?(this._repeat=t,this._uncache(!0)):this._repeat},_.repeatDelay=function(t){return arguments.length?(this._repeatDelay=t,this._uncache(!0)):this._repeatDelay},_.yoyo=function(t){return arguments.length?(this._yoyo=t,this):this._yoyo},_.currentLabel=function(t){return arguments.length?this.seek(t,!0):this.getLabelBefore(this._time+1e-8)},s},!0),function(){var t=180/Math.PI,e=[],i=[],s=[],r={},n=function(t,e,i,s){this.a=t,this.b=e,this.c=i,this.d=s,this.da=s-t,this.ca=i-t,this.ba=e-t},a=",x,y,z,left,top,right,bottom,marginTop,marginLeft,marginRight,marginBottom,paddingLeft,paddingTop,paddingRight,paddingBottom,backgroundPosition,backgroundPosition_y,",o=function(t,e,i,s){var r={a:t},n={},a={},o={c:s},h=(t+e)/2,l=(e+i)/2,_=(i+s)/2,u=(h+l)/2,p=(l+_)/2,c=(p-u)/8;return r.b=h+(t-h)/4,n.b=u+c,r.c=n.a=(r.b+n.b)/2,n.c=a.a=(u+p)/2,a.b=p-c,o.b=_+(s-_)/4,a.c=o.a=(a.b+o.b)/2,[r,n,a,o]},h=function(t,r,n,a,h){var l,_,u,p,c,f,m,d,g,v,y,T,w,x=t.length-1,b=0,P=t[0].a;for(l=0;x>l;l++)c=t[b],_=c.a,u=c.d,p=t[b+1].d,h?(y=e[l],T=i[l],w=.25*(T+y)*r/(a?.5:s[l]||.5),f=u-(u-_)*(a?.5*r:0!==y?w/y:0),m=u+(p-u)*(a?.5*r:0!==T?w/T:0),d=u-(f+((m-f)*(3*y/(y+T)+.5)/4||0))):(f=u-.5*(u-_)*r,m=u+.5*(p-u)*r,d=u-(f+m)/2),f+=d,m+=d,c.c=g=f,c.b=0!==l?P:P=c.a+.6*(c.c-c.a),c.da=u-_,c.ca=g-_,c.ba=P-_,n?(v=o(_,P,g,u),t.splice(b,1,v[0],v[1],v[2],v[3]),b+=4):b++,P=m;c=t[b],c.b=P,c.c=P+.4*(c.d-P),c.da=c.d-c.a,c.ca=c.c-c.a,c.ba=P-c.a,n&&(v=o(c.a,P,c.c,c.d),t.splice(b,1,v[0],v[1],v[2],v[3]))},l=function(t,s,r,a){var o,h,l,_,u,p,c=[];if(a)for(t=[a].concat(t),h=t.length;--h>-1;)"string"==typeof(p=t[h][s])&&"="===p.charAt(1)&&(t[h][s]=a[s]+Number(p.charAt(0)+p.substr(2)));if(o=t.length-2,0>o)return c[0]=new n(t[0][s],0,0,t[-1>o?0:1][s]),c;for(h=0;o>h;h++)l=t[h][s],_=t[h+1][s],c[h]=new n(l,0,0,_),r&&(u=t[h+2][s],e[h]=(e[h]||0)+(_-l)*(_-l),i[h]=(i[h]||0)+(u-_)*(u-_));return c[h]=new n(t[h][s],0,0,t[h+1][s]),c},_=function(t,n,o,_,u,p){var c,f,m,d,g,v,y,T,w={},x=[],b=p||t[0];u="string"==typeof u?","+u+",":a,null==n&&(n=1);for(f in t[0])x.push(f);if(t.length>1){for(T=t[t.length-1],y=!0,c=x.length;--c>-1;)if(f=x[c],Math.abs(b[f]-T[f])>.05){y=!1;break}y&&(t=t.concat(),p&&t.unshift(p),t.push(t[1]),p=t[t.length-3])}for(e.length=i.length=s.length=0,c=x.length;--c>-1;)f=x[c],r[f]=-1!==u.indexOf(","+f+","),w[f]=l(t,f,r[f],p);for(c=e.length;--c>-1;)e[c]=Math.sqrt(e[c]),i[c]=Math.sqrt(i[c]);if(!_){for(c=x.length;--c>-1;)if(r[f])for(m=w[x[c]],v=m.length-1,d=0;v>d;d++)g=m[d+1].da/i[d]+m[d].da/e[d],s[d]=(s[d]||0)+g*g;for(c=s.length;--c>-1;)s[c]=Math.sqrt(s[c])}for(c=x.length,d=o?4:1;--c>-1;)f=x[c],m=w[f],h(m,n,o,_,r[f]),y&&(m.splice(0,d),m.splice(m.length-d,d));return w},u=function(t,e,i){e=e||"soft";var s,r,a,o,h,l,_,u,p,c,f,m={},d="cubic"===e?3:2,g="soft"===e,v=[];if(g&&i&&(t=[i].concat(t)),null==t||d+1>t.length)throw"invalid Bezier data";for(p in t[0])v.push(p);for(l=v.length;--l>-1;){for(p=v[l],m[p]=h=[],c=0,u=t.length,_=0;u>_;_++)s=null==i?t[_][p]:"string"==typeof(f=t[_][p])&&"="===f.charAt(1)?i[p]+Number(f.charAt(0)+f.substr(2)):Number(f),g&&_>1&&u-1>_&&(h[c++]=(s+h[c-2])/2),h[c++]=s;for(u=c-d+1,c=0,_=0;u>_;_+=d)s=h[_],r=h[_+1],a=h[_+2],o=2===d?0:h[_+3],h[c++]=f=3===d?new n(s,r,a,o):new n(s,(2*r+s)/3,(2*r+a)/3,a);h.length=c}return m},p=function(t,e,i){for(var s,r,n,a,o,h,l,_,u,p,c,f=1/i,m=t.length;--m>-1;)for(p=t[m],n=p.a,a=p.d-n,o=p.c-n,h=p.b-n,s=r=0,_=1;i>=_;_++)l=f*_,u=1-l,s=r-(r=(l*l*a+3*u*(l*o+u*h))*l),c=m*i+_-1,e[c]=(e[c]||0)+s*s},c=function(t,e){e=e>>0||6;var i,s,r,n,a=[],o=[],h=0,l=0,_=e-1,u=[],c=[];for(i in t)p(t[i],a,e);for(r=a.length,s=0;r>s;s++)h+=Math.sqrt(a[s]),n=s%e,c[n]=h,n===_&&(l+=h,n=s/e>>0,u[n]=c,o[n]=l,h=0,c=[]);return{length:l,lengths:o,segments:u}},f=_gsScope._gsDefine.plugin({propName:"bezier",priority:-1,version:"1.3.3",API:2,global:!0,init:function(t,e,i){this._target=t,e instanceof Array&&(e={values:e}),this._func={},this._round={},this._props=[],this._timeRes=null==e.timeResolution?6:parseInt(e.timeResolution,10);var s,r,n,a,o,h=e.values||[],l={},p=h[0],f=e.autoRotate||i.vars.orientToBezier;this._autoRotate=f?f instanceof Array?f:[["x","y","rotation",f===!0?0:Number(f)||0]]:null;for(s in p)this._props.push(s);for(n=this._props.length;--n>-1;)s=this._props[n],this._overwriteProps.push(s),r=this._func[s]="function"==typeof t[s],l[s]=r?t[s.indexOf("set")||"function"!=typeof t["get"+s.substr(3)]?s:"get"+s.substr(3)]():parseFloat(t[s]),o||l[s]!==h[0][s]&&(o=l);if(this._beziers="cubic"!==e.type&&"quadratic"!==e.type&&"soft"!==e.type?_(h,isNaN(e.curviness)?1:e.curviness,!1,"thruBasic"===e.type,e.correlate,o):u(h,e.type,l),this._segCount=this._beziers[s].length,this._timeRes){var m=c(this._beziers,this._timeRes);this._length=m.length,this._lengths=m.lengths,this._segments=m.segments,this._l1=this._li=this._s1=this._si=0,this._l2=this._lengths[0],this._curSeg=this._segments[0],this._s2=this._curSeg[0],this._prec=1/this._curSeg.length}if(f=this._autoRotate)for(this._initialRotations=[],f[0]instanceof Array||(this._autoRotate=f=[f]),n=f.length;--n>-1;){for(a=0;3>a;a++)s=f[n][a],this._func[s]="function"==typeof t[s]?t[s.indexOf("set")||"function"!=typeof t["get"+s.substr(3)]?s:"get"+s.substr(3)]:!1;s=f[n][2],this._initialRotations[n]=this._func[s]?this._func[s].call(this._target):this._target[s]}return this._startRatio=i.vars.runBackwards?1:0,!0},set:function(e){var i,s,r,n,a,o,h,l,_,u,p=this._segCount,c=this._func,f=this._target,m=e!==this._startRatio;if(this._timeRes){if(_=this._lengths,u=this._curSeg,e*=this._length,r=this._li,e>this._l2&&p-1>r){for(l=p-1;l>r&&e>=(this._l2=_[++r]););this._l1=_[r-1],this._li=r,this._curSeg=u=this._segments[r],this._s2=u[this._s1=this._si=0]}else if(this._l1>e&&r>0){for(;r>0&&(this._l1=_[--r])>=e;);0===r&&this._l1>e?this._l1=0:r++,this._l2=_[r],this._li=r,this._curSeg=u=this._segments[r],this._s1=u[(this._si=u.length-1)-1]||0,this._s2=u[this._si]}if(i=r,e-=this._l1,r=this._si,e>this._s2&&u.length-1>r){for(l=u.length-1;l>r&&e>=(this._s2=u[++r]););this._s1=u[r-1],this._si=r}else if(this._s1>e&&r>0){for(;r>0&&(this._s1=u[--r])>=e;);0===r&&this._s1>e?this._s1=0:r++,this._s2=u[r],this._si=r}o=(r+(e-this._s1)/(this._s2-this._s1))*this._prec}else i=0>e?0:e>=1?p-1:p*e>>0,o=(e-i*(1/p))*p;for(s=1-o,r=this._props.length;--r>-1;)n=this._props[r],a=this._beziers[n][i],h=(o*o*a.da+3*s*(o*a.ca+s*a.ba))*o+a.a,this._round[n]&&(h=Math.round(h)),c[n]?f[n](h):f[n]=h;if(this._autoRotate){var d,g,v,y,T,w,x,b=this._autoRotate;
for(r=b.length;--r>-1;)n=b[r][2],w=b[r][3]||0,x=b[r][4]===!0?1:t,a=this._beziers[b[r][0]],d=this._beziers[b[r][1]],a&&d&&(a=a[i],d=d[i],g=a.a+(a.b-a.a)*o,y=a.b+(a.c-a.b)*o,g+=(y-g)*o,y+=(a.c+(a.d-a.c)*o-y)*o,v=d.a+(d.b-d.a)*o,T=d.b+(d.c-d.b)*o,v+=(T-v)*o,T+=(d.c+(d.d-d.c)*o-T)*o,h=m?Math.atan2(T-v,y-g)*x+w:this._initialRotations[r],c[n]?f[n](h):f[n]=h)}}}),m=f.prototype;f.bezierThrough=_,f.cubicToQuadratic=o,f._autoCSS=!0,f.quadraticToCubic=function(t,e,i){return new n(t,(2*e+t)/3,(2*e+i)/3,i)},f._cssRegister=function(){var t=_gsScope._gsDefine.globals.CSSPlugin;if(t){var e=t._internals,i=e._parseToProxy,s=e._setPluginRatio,r=e.CSSPropTween;e._registerComplexSpecialProp("bezier",{parser:function(t,e,n,a,o,h){e instanceof Array&&(e={values:e}),h=new f;var l,_,u,p=e.values,c=p.length-1,m=[],d={};if(0>c)return o;for(l=0;c>=l;l++)u=i(t,p[l],a,o,h,c!==l),m[l]=u.end;for(_ in e)d[_]=e[_];return d.values=m,o=new r(t,"bezier",0,0,u.pt,2),o.data=u,o.plugin=h,o.setRatio=s,0===d.autoRotate&&(d.autoRotate=!0),!d.autoRotate||d.autoRotate instanceof Array||(l=d.autoRotate===!0?0:Number(d.autoRotate),d.autoRotate=null!=u.end.left?[["left","top","rotation",l,!1]]:null!=u.end.x?[["x","y","rotation",l,!1]]:!1),d.autoRotate&&(a._transform||a._enableTransforms(!1),u.autoRotate=a._target._gsTransform),h._onInitTween(u.proxy,d,a._tween),o}})}},m._roundProps=function(t,e){for(var i=this._overwriteProps,s=i.length;--s>-1;)(t[i[s]]||t.bezier||t.bezierThrough)&&(this._round[i[s]]=e)},m._kill=function(t){var e,i,s=this._props;for(e in this._beziers)if(e in t)for(delete this._beziers[e],delete this._func[e],i=s.length;--i>-1;)s[i]===e&&s.splice(i,1);return this._super._kill.call(this,t)}}(),_gsScope._gsDefine("plugins.CSSPlugin",["plugins.TweenPlugin","TweenLite"],function(t,e){var i,s,r,n,a=function(){t.call(this,"css"),this._overwriteProps.length=0,this.setRatio=a.prototype.setRatio},o={},h=a.prototype=new t("css");h.constructor=a,a.version="1.13.1",a.API=2,a.defaultTransformPerspective=0,a.defaultSkewType="compensated",h="px",a.suffixMap={top:h,right:h,bottom:h,left:h,width:h,height:h,fontSize:h,padding:h,margin:h,perspective:h,lineHeight:""};var l,_,u,p,c,f,m=/(?:\d|\-\d|\.\d|\-\.\d)+/g,d=/(?:\d|\-\d|\.\d|\-\.\d|\+=\d|\-=\d|\+=.\d|\-=\.\d)+/g,g=/(?:\+=|\-=|\-|\b)[\d\-\.]+[a-zA-Z0-9]*(?:%|\b)/gi,v=/[^\d\-\.]/g,y=/(?:\d|\-|\+|=|#|\.)*/g,T=/opacity *= *([^)]*)/i,w=/opacity:([^;]*)/i,x=/alpha\(opacity *=.+?\)/i,b=/^(rgb|hsl)/,P=/([A-Z])/g,S=/-([a-z])/gi,k=/(^(?:url\(\"|url\())|(?:(\"\))$|\)$)/gi,R=function(t,e){return e.toUpperCase()},A=/(?:Left|Right|Width)/i,C=/(M11|M12|M21|M22)=[\d\-\.e]+/gi,O=/progid\:DXImageTransform\.Microsoft\.Matrix\(.+?\)/i,D=/,(?=[^\)]*(?:\(|$))/gi,M=Math.PI/180,z=180/Math.PI,I={},E=document,L=E.createElement("div"),F=E.createElement("img"),N=a._internals={_specialProps:o},X=navigator.userAgent,U=function(){var t,e=X.indexOf("Android"),i=E.createElement("div");return u=-1!==X.indexOf("Safari")&&-1===X.indexOf("Chrome")&&(-1===e||Number(X.substr(e+8,1))>3),c=u&&6>Number(X.substr(X.indexOf("Version/")+8,1)),p=-1!==X.indexOf("Firefox"),/MSIE ([0-9]{1,}[\.0-9]{0,})/.exec(X)&&(f=parseFloat(RegExp.$1)),i.innerHTML="<a style='top:1px;opacity:.55;'>a</a>",t=i.getElementsByTagName("a")[0],t?/^0.55/.test(t.style.opacity):!1}(),Y=function(t){return T.test("string"==typeof t?t:(t.currentStyle?t.currentStyle.filter:t.style.filter)||"")?parseFloat(RegExp.$1)/100:1},j=function(t){window.console&&console.log(t)},B="",q="",V=function(t,e){e=e||L;var i,s,r=e.style;if(void 0!==r[t])return t;for(t=t.charAt(0).toUpperCase()+t.substr(1),i=["O","Moz","ms","Ms","Webkit"],s=5;--s>-1&&void 0===r[i[s]+t];);return s>=0?(q=3===s?"ms":i[s],B="-"+q.toLowerCase()+"-",q+t):null},G=E.defaultView?E.defaultView.getComputedStyle:function(){},W=a.getStyle=function(t,e,i,s,r){var n;return U||"opacity"!==e?(!s&&t.style[e]?n=t.style[e]:(i=i||G(t))?n=i[e]||i.getPropertyValue(e)||i.getPropertyValue(e.replace(P,"-$1").toLowerCase()):t.currentStyle&&(n=t.currentStyle[e]),null==r||n&&"none"!==n&&"auto"!==n&&"auto auto"!==n?n:r):Y(t)},Q=N.convertToPixels=function(t,i,s,r,n){if("px"===r||!r)return s;if("auto"===r||!s)return 0;var o,h,l,_=A.test(i),u=t,p=L.style,c=0>s;if(c&&(s=-s),"%"===r&&-1!==i.indexOf("border"))o=s/100*(_?t.clientWidth:t.clientHeight);else{if(p.cssText="border:0 solid red;position:"+W(t,"position")+";line-height:0;","%"!==r&&u.appendChild)p[_?"borderLeftWidth":"borderTopWidth"]=s+r;else{if(u=t.parentNode||E.body,h=u._gsCache,l=e.ticker.frame,h&&_&&h.time===l)return h.width*s/100;p[_?"width":"height"]=s+r}u.appendChild(L),o=parseFloat(L[_?"offsetWidth":"offsetHeight"]),u.removeChild(L),_&&"%"===r&&a.cacheWidths!==!1&&(h=u._gsCache=u._gsCache||{},h.time=l,h.width=100*(o/s)),0!==o||n||(o=Q(t,i,s,r,!0))}return c?-o:o},Z=N.calculateOffset=function(t,e,i){if("absolute"!==W(t,"position",i))return 0;var s="left"===e?"Left":"Top",r=W(t,"margin"+s,i);return t["offset"+s]-(Q(t,e,parseFloat(r),r.replace(y,""))||0)},$=function(t,e){var i,s,r={};if(e=e||G(t,null))if(i=e.length)for(;--i>-1;)r[e[i].replace(S,R)]=e.getPropertyValue(e[i]);else for(i in e)r[i]=e[i];else if(e=t.currentStyle||t.style)for(i in e)"string"==typeof i&&void 0===r[i]&&(r[i.replace(S,R)]=e[i]);return U||(r.opacity=Y(t)),s=Pe(t,e,!1),r.rotation=s.rotation,r.skewX=s.skewX,r.scaleX=s.scaleX,r.scaleY=s.scaleY,r.x=s.x,r.y=s.y,xe&&(r.z=s.z,r.rotationX=s.rotationX,r.rotationY=s.rotationY,r.scaleZ=s.scaleZ),r.filters&&delete r.filters,r},H=function(t,e,i,s,r){var n,a,o,h={},l=t.style;for(a in i)"cssText"!==a&&"length"!==a&&isNaN(a)&&(e[a]!==(n=i[a])||r&&r[a])&&-1===a.indexOf("Origin")&&("number"==typeof n||"string"==typeof n)&&(h[a]="auto"!==n||"left"!==a&&"top"!==a?""!==n&&"auto"!==n&&"none"!==n||"string"!=typeof e[a]||""===e[a].replace(v,"")?n:0:Z(t,a),void 0!==l[a]&&(o=new ue(l,a,l[a],o)));if(s)for(a in s)"className"!==a&&(h[a]=s[a]);return{difs:h,firstMPT:o}},K={width:["Left","Right"],height:["Top","Bottom"]},J=["marginLeft","marginRight","marginTop","marginBottom"],te=function(t,e,i){var s=parseFloat("width"===e?t.offsetWidth:t.offsetHeight),r=K[e],n=r.length;for(i=i||G(t,null);--n>-1;)s-=parseFloat(W(t,"padding"+r[n],i,!0))||0,s-=parseFloat(W(t,"border"+r[n]+"Width",i,!0))||0;return s},ee=function(t,e){(null==t||""===t||"auto"===t||"auto auto"===t)&&(t="0 0");var i=t.split(" "),s=-1!==t.indexOf("left")?"0%":-1!==t.indexOf("right")?"100%":i[0],r=-1!==t.indexOf("top")?"0%":-1!==t.indexOf("bottom")?"100%":i[1];return null==r?r="0":"center"===r&&(r="50%"),("center"===s||isNaN(parseFloat(s))&&-1===(s+"").indexOf("="))&&(s="50%"),e&&(e.oxp=-1!==s.indexOf("%"),e.oyp=-1!==r.indexOf("%"),e.oxr="="===s.charAt(1),e.oyr="="===r.charAt(1),e.ox=parseFloat(s.replace(v,"")),e.oy=parseFloat(r.replace(v,""))),s+" "+r+(i.length>2?" "+i[2]:"")},ie=function(t,e){return"string"==typeof t&&"="===t.charAt(1)?parseInt(t.charAt(0)+"1",10)*parseFloat(t.substr(2)):parseFloat(t)-parseFloat(e)},se=function(t,e){return null==t?e:"string"==typeof t&&"="===t.charAt(1)?parseInt(t.charAt(0)+"1",10)*Number(t.substr(2))+e:parseFloat(t)},re=function(t,e,i,s){var r,n,a,o,h=1e-6;return null==t?o=e:"number"==typeof t?o=t:(r=360,n=t.split("_"),a=Number(n[0].replace(v,""))*(-1===t.indexOf("rad")?1:z)-("="===t.charAt(1)?0:e),n.length&&(s&&(s[i]=e+a),-1!==t.indexOf("short")&&(a%=r,a!==a%(r/2)&&(a=0>a?a+r:a-r)),-1!==t.indexOf("_cw")&&0>a?a=(a+9999999999*r)%r-(0|a/r)*r:-1!==t.indexOf("ccw")&&a>0&&(a=(a-9999999999*r)%r-(0|a/r)*r)),o=e+a),h>o&&o>-h&&(o=0),o},ne={aqua:[0,255,255],lime:[0,255,0],silver:[192,192,192],black:[0,0,0],maroon:[128,0,0],teal:[0,128,128],blue:[0,0,255],navy:[0,0,128],white:[255,255,255],fuchsia:[255,0,255],olive:[128,128,0],yellow:[255,255,0],orange:[255,165,0],gray:[128,128,128],purple:[128,0,128],green:[0,128,0],red:[255,0,0],pink:[255,192,203],cyan:[0,255,255],transparent:[255,255,255,0]},ae=function(t,e,i){return t=0>t?t+1:t>1?t-1:t,0|255*(1>6*t?e+6*(i-e)*t:.5>t?i:2>3*t?e+6*(i-e)*(2/3-t):e)+.5},oe=function(t){var e,i,s,r,n,a;return t&&""!==t?"number"==typeof t?[t>>16,255&t>>8,255&t]:(","===t.charAt(t.length-1)&&(t=t.substr(0,t.length-1)),ne[t]?ne[t]:"#"===t.charAt(0)?(4===t.length&&(e=t.charAt(1),i=t.charAt(2),s=t.charAt(3),t="#"+e+e+i+i+s+s),t=parseInt(t.substr(1),16),[t>>16,255&t>>8,255&t]):"hsl"===t.substr(0,3)?(t=t.match(m),r=Number(t[0])%360/360,n=Number(t[1])/100,a=Number(t[2])/100,i=.5>=a?a*(n+1):a+n-a*n,e=2*a-i,t.length>3&&(t[3]=Number(t[3])),t[0]=ae(r+1/3,e,i),t[1]=ae(r,e,i),t[2]=ae(r-1/3,e,i),t):(t=t.match(m)||ne.transparent,t[0]=Number(t[0]),t[1]=Number(t[1]),t[2]=Number(t[2]),t.length>3&&(t[3]=Number(t[3])),t)):ne.black},he="(?:\\b(?:(?:rgb|rgba|hsl|hsla)\\(.+?\\))|\\B#.+?\\b";for(h in ne)he+="|"+h+"\\b";he=RegExp(he+")","gi");var le=function(t,e,i,s){if(null==t)return function(t){return t};var r,n=e?(t.match(he)||[""])[0]:"",a=t.split(n).join("").match(g)||[],o=t.substr(0,t.indexOf(a[0])),h=")"===t.charAt(t.length-1)?")":"",l=-1!==t.indexOf(" ")?" ":",",_=a.length,u=_>0?a[0].replace(m,""):"";return _?r=e?function(t){var e,p,c,f;if("number"==typeof t)t+=u;else if(s&&D.test(t)){for(f=t.replace(D,"|").split("|"),c=0;f.length>c;c++)f[c]=r(f[c]);return f.join(",")}if(e=(t.match(he)||[n])[0],p=t.split(e).join("").match(g)||[],c=p.length,_>c--)for(;_>++c;)p[c]=i?p[0|(c-1)/2]:a[c];return o+p.join(l)+l+e+h+(-1!==t.indexOf("inset")?" inset":"")}:function(t){var e,n,p;if("number"==typeof t)t+=u;else if(s&&D.test(t)){for(n=t.replace(D,"|").split("|"),p=0;n.length>p;p++)n[p]=r(n[p]);return n.join(",")}if(e=t.match(g)||[],p=e.length,_>p--)for(;_>++p;)e[p]=i?e[0|(p-1)/2]:a[p];return o+e.join(l)+h}:function(t){return t}},_e=function(t){return t=t.split(","),function(e,i,s,r,n,a,o){var h,l=(i+"").split(" ");for(o={},h=0;4>h;h++)o[t[h]]=l[h]=l[h]||l[(h-1)/2>>0];return r.parse(e,o,n,a)}},ue=(N._setPluginRatio=function(t){this.plugin.setRatio(t);for(var e,i,s,r,n=this.data,a=n.proxy,o=n.firstMPT,h=1e-6;o;)e=a[o.v],o.r?e=Math.round(e):h>e&&e>-h&&(e=0),o.t[o.p]=e,o=o._next;if(n.autoRotate&&(n.autoRotate.rotation=a.rotation),1===t)for(o=n.firstMPT;o;){if(i=o.t,i.type){if(1===i.type){for(r=i.xs0+i.s+i.xs1,s=1;i.l>s;s++)r+=i["xn"+s]+i["xs"+(s+1)];i.e=r}}else i.e=i.s+i.xs0;o=o._next}},function(t,e,i,s,r){this.t=t,this.p=e,this.v=i,this.r=r,s&&(s._prev=this,this._next=s)}),pe=(N._parseToProxy=function(t,e,i,s,r,n){var a,o,h,l,_,u=s,p={},c={},f=i._transform,m=I;for(i._transform=null,I=e,s=_=i.parse(t,e,s,r),I=m,n&&(i._transform=f,u&&(u._prev=null,u._prev&&(u._prev._next=null)));s&&s!==u;){if(1>=s.type&&(o=s.p,c[o]=s.s+s.c,p[o]=s.s,n||(l=new ue(s,"s",o,l,s.r),s.c=0),1===s.type))for(a=s.l;--a>0;)h="xn"+a,o=s.p+"_"+h,c[o]=s.data[h],p[o]=s[h],n||(l=new ue(s,h,o,l,s.rxp[h]));s=s._next}return{proxy:p,end:c,firstMPT:l,pt:_}},N.CSSPropTween=function(t,e,s,r,a,o,h,l,_,u,p){this.t=t,this.p=e,this.s=s,this.c=r,this.n=h||e,t instanceof pe||n.push(this.n),this.r=l,this.type=o||0,_&&(this.pr=_,i=!0),this.b=void 0===u?s:u,this.e=void 0===p?s+r:p,a&&(this._next=a,a._prev=this)}),ce=a.parseComplex=function(t,e,i,s,r,n,a,o,h,_){i=i||n||"",a=new pe(t,e,0,0,a,_?2:1,null,!1,o,i,s),s+="";var u,p,c,f,g,v,y,T,w,x,P,S,k=i.split(", ").join(",").split(" "),R=s.split(", ").join(",").split(" "),A=k.length,C=l!==!1;for((-1!==s.indexOf(",")||-1!==i.indexOf(","))&&(k=k.join(" ").replace(D,", ").split(" "),R=R.join(" ").replace(D,", ").split(" "),A=k.length),A!==R.length&&(k=(n||"").split(" "),A=k.length),a.plugin=h,a.setRatio=_,u=0;A>u;u++)if(f=k[u],g=R[u],T=parseFloat(f),T||0===T)a.appendXtra("",T,ie(g,T),g.replace(d,""),C&&-1!==g.indexOf("px"),!0);else if(r&&("#"===f.charAt(0)||ne[f]||b.test(f)))S=","===g.charAt(g.length-1)?"),":")",f=oe(f),g=oe(g),w=f.length+g.length>6,w&&!U&&0===g[3]?(a["xs"+a.l]+=a.l?" transparent":"transparent",a.e=a.e.split(R[u]).join("transparent")):(U||(w=!1),a.appendXtra(w?"rgba(":"rgb(",f[0],g[0]-f[0],",",!0,!0).appendXtra("",f[1],g[1]-f[1],",",!0).appendXtra("",f[2],g[2]-f[2],w?",":S,!0),w&&(f=4>f.length?1:f[3],a.appendXtra("",f,(4>g.length?1:g[3])-f,S,!1)));else if(v=f.match(m)){if(y=g.match(d),!y||y.length!==v.length)return a;for(c=0,p=0;v.length>p;p++)P=v[p],x=f.indexOf(P,c),a.appendXtra(f.substr(c,x-c),Number(P),ie(y[p],P),"",C&&"px"===f.substr(x+P.length,2),0===p),c=x+P.length;a["xs"+a.l]+=f.substr(c)}else a["xs"+a.l]+=a.l?" "+f:f;if(-1!==s.indexOf("=")&&a.data){for(S=a.xs0+a.data.s,u=1;a.l>u;u++)S+=a["xs"+u]+a.data["xn"+u];a.e=S+a["xs"+u]}return a.l||(a.type=-1,a.xs0=a.e),a.xfirst||a},fe=9;for(h=pe.prototype,h.l=h.pr=0;--fe>0;)h["xn"+fe]=0,h["xs"+fe]="";h.xs0="",h._next=h._prev=h.xfirst=h.data=h.plugin=h.setRatio=h.rxp=null,h.appendXtra=function(t,e,i,s,r,n){var a=this,o=a.l;return a["xs"+o]+=n&&o?" "+t:t||"",i||0===o||a.plugin?(a.l++,a.type=a.setRatio?2:1,a["xs"+a.l]=s||"",o>0?(a.data["xn"+o]=e+i,a.rxp["xn"+o]=r,a["xn"+o]=e,a.plugin||(a.xfirst=new pe(a,"xn"+o,e,i,a.xfirst||a,0,a.n,r,a.pr),a.xfirst.xs0=0),a):(a.data={s:e+i},a.rxp={},a.s=e,a.c=i,a.r=r,a)):(a["xs"+o]+=e+(s||""),a)};var me=function(t,e){e=e||{},this.p=e.prefix?V(t)||t:t,o[t]=o[this.p]=this,this.format=e.formatter||le(e.defaultValue,e.color,e.collapsible,e.multi),e.parser&&(this.parse=e.parser),this.clrs=e.color,this.multi=e.multi,this.keyword=e.keyword,this.dflt=e.defaultValue,this.pr=e.priority||0},de=N._registerComplexSpecialProp=function(t,e,i){"object"!=typeof e&&(e={parser:i});var s,r,n=t.split(","),a=e.defaultValue;for(i=i||[a],s=0;n.length>s;s++)e.prefix=0===s&&e.prefix,e.defaultValue=i[s]||a,r=new me(n[s],e)},ge=function(t){if(!o[t]){var e=t.charAt(0).toUpperCase()+t.substr(1)+"Plugin";de(t,{parser:function(t,i,s,r,n,a,h){var l=(_gsScope.GreenSockGlobals||_gsScope).com.greensock.plugins[e];return l?(l._cssRegister(),o[s].parse(t,i,s,r,n,a,h)):(j("Error: "+e+" js file not loaded."),n)}})}};h=me.prototype,h.parseComplex=function(t,e,i,s,r,n){var a,o,h,l,_,u,p=this.keyword;if(this.multi&&(D.test(i)||D.test(e)?(o=e.replace(D,"|").split("|"),h=i.replace(D,"|").split("|")):p&&(o=[e],h=[i])),h){for(l=h.length>o.length?h.length:o.length,a=0;l>a;a++)e=o[a]=o[a]||this.dflt,i=h[a]=h[a]||this.dflt,p&&(_=e.indexOf(p),u=i.indexOf(p),_!==u&&(i=-1===u?h:o,i[a]+=" "+p));e=o.join(", "),i=h.join(", ")}return ce(t,this.p,e,i,this.clrs,this.dflt,s,this.pr,r,n)},h.parse=function(t,e,i,s,n,a){return this.parseComplex(t.style,this.format(W(t,this.p,r,!1,this.dflt)),this.format(e),n,a)},a.registerSpecialProp=function(t,e,i){de(t,{parser:function(t,s,r,n,a,o){var h=new pe(t,r,0,0,a,2,r,!1,i);return h.plugin=o,h.setRatio=e(t,s,n._tween,r),h},priority:i})};var ve="scaleX,scaleY,scaleZ,x,y,z,skewX,skewY,rotation,rotationX,rotationY,perspective,xPercent,yPercent".split(","),ye=V("transform"),Te=B+"transform",we=V("transformOrigin"),xe=null!==V("perspective"),be=N.Transform=function(){this.skewY=0},Pe=N.getTransform=function(t,e,i,s){if(t._gsTransform&&i&&!s)return t._gsTransform;var r,n,o,h,l,_,u,p,c,f,m,d,g,v=i?t._gsTransform||new be:new be,y=0>v.scaleX,T=2e-5,w=1e5,x=179.99,b=x*M,P=xe?parseFloat(W(t,we,e,!1,"0 0 0").split(" ")[2])||v.zOrigin||0:0;if(ye?r=W(t,Te,e,!0):t.currentStyle&&(r=t.currentStyle.filter.match(C),r=r&&4===r.length?[r[0].substr(4),Number(r[2].substr(4)),Number(r[1].substr(4)),r[3].substr(4),v.x||0,v.y||0].join(","):""),r&&"none"!==r&&"matrix(1, 0, 0, 1, 0, 0)"!==r){for(n=(r||"").match(/(?:\-|\b)[\d\-\.e]+\b/gi)||[],o=n.length;--o>-1;)h=Number(n[o]),n[o]=(l=h-(h|=0))?(0|l*w+(0>l?-.5:.5))/w+h:h;if(16===n.length){var S=n[8],k=n[9],R=n[10],A=n[12],O=n[13],D=n[14];if(v.zOrigin&&(D=-v.zOrigin,A=S*D-n[12],O=k*D-n[13],D=R*D+v.zOrigin-n[14]),!i||s||null==v.rotationX){var I,E,L,F,N,X,U,Y=n[0],j=n[1],B=n[2],q=n[3],V=n[4],G=n[5],Q=n[6],Z=n[7],$=n[11],H=Math.atan2(Q,R),K=-b>H||H>b;v.rotationX=H*z,H&&(F=Math.cos(-H),N=Math.sin(-H),I=V*F+S*N,E=G*F+k*N,L=Q*F+R*N,S=V*-N+S*F,k=G*-N+k*F,R=Q*-N+R*F,$=Z*-N+$*F,V=I,G=E,Q=L),H=Math.atan2(S,Y),v.rotationY=H*z,H&&(X=-b>H||H>b,F=Math.cos(-H),N=Math.sin(-H),I=Y*F-S*N,E=j*F-k*N,L=B*F-R*N,k=j*N+k*F,R=B*N+R*F,$=q*N+$*F,Y=I,j=E,B=L),H=Math.atan2(j,G),v.rotation=H*z,H&&(U=-b>H||H>b,F=Math.cos(-H),N=Math.sin(-H),Y=Y*F+V*N,E=j*F+G*N,G=j*-N+G*F,Q=B*-N+Q*F,j=E),U&&K?v.rotation=v.rotationX=0:U&&X?v.rotation=v.rotationY=0:X&&K&&(v.rotationY=v.rotationX=0),v.scaleX=(0|Math.sqrt(Y*Y+j*j)*w+.5)/w,v.scaleY=(0|Math.sqrt(G*G+k*k)*w+.5)/w,v.scaleZ=(0|Math.sqrt(Q*Q+R*R)*w+.5)/w,v.skewX=0,v.perspective=$?1/(0>$?-$:$):0,v.x=A,v.y=O,v.z=D}}else if(!(xe&&!s&&n.length&&v.x===n[4]&&v.y===n[5]&&(v.rotationX||v.rotationY)||void 0!==v.x&&"none"===W(t,"display",e))){var J=n.length>=6,te=J?n[0]:1,ee=n[1]||0,ie=n[2]||0,se=J?n[3]:1;v.x=n[4]||0,v.y=n[5]||0,_=Math.sqrt(te*te+ee*ee),u=Math.sqrt(se*se+ie*ie),p=te||ee?Math.atan2(ee,te)*z:v.rotation||0,c=ie||se?Math.atan2(ie,se)*z+p:v.skewX||0,f=_-Math.abs(v.scaleX||0),m=u-Math.abs(v.scaleY||0),Math.abs(c)>90&&270>Math.abs(c)&&(y?(_*=-1,c+=0>=p?180:-180,p+=0>=p?180:-180):(u*=-1,c+=0>=c?180:-180)),d=(p-v.rotation)%180,g=(c-v.skewX)%180,(void 0===v.skewX||f>T||-T>f||m>T||-T>m||d>-x&&x>d&&false|d*w||g>-x&&x>g&&false|g*w)&&(v.scaleX=_,v.scaleY=u,v.rotation=p,v.skewX=c),xe&&(v.rotationX=v.rotationY=v.z=0,v.perspective=parseFloat(a.defaultTransformPerspective)||0,v.scaleZ=1)}v.zOrigin=P;for(o in v)T>v[o]&&v[o]>-T&&(v[o]=0)}else v={x:0,y:0,z:0,scaleX:1,scaleY:1,scaleZ:1,skewX:0,perspective:0,rotation:0,rotationX:0,rotationY:0,zOrigin:0};return i&&(t._gsTransform=v),v.xPercent=v.yPercent=0,v},Se=function(t){var e,i,s=this.data,r=-s.rotation*M,n=r+s.skewX*M,a=1e5,o=(0|Math.cos(r)*s.scaleX*a)/a,h=(0|Math.sin(r)*s.scaleX*a)/a,l=(0|Math.sin(n)*-s.scaleY*a)/a,_=(0|Math.cos(n)*s.scaleY*a)/a,u=this.t.style,p=this.t.currentStyle;if(p){i=h,h=-l,l=-i,e=p.filter,u.filter="";var c,m,d=this.t.offsetWidth,g=this.t.offsetHeight,v="absolute"!==p.position,w="progid:DXImageTransform.Microsoft.Matrix(M11="+o+", M12="+h+", M21="+l+", M22="+_,x=s.x+d*s.xPercent/100,b=s.y+g*s.yPercent/100;if(null!=s.ox&&(c=(s.oxp?.01*d*s.ox:s.ox)-d/2,m=(s.oyp?.01*g*s.oy:s.oy)-g/2,x+=c-(c*o+m*h),b+=m-(c*l+m*_)),v?(c=d/2,m=g/2,w+=", Dx="+(c-(c*o+m*h)+x)+", Dy="+(m-(c*l+m*_)+b)+")"):w+=", sizingMethod='auto expand')",u.filter=-1!==e.indexOf("DXImageTransform.Microsoft.Matrix(")?e.replace(O,w):w+" "+e,(0===t||1===t)&&1===o&&0===h&&0===l&&1===_&&(v&&-1===w.indexOf("Dx=0, Dy=0")||T.test(e)&&100!==parseFloat(RegExp.$1)||-1===e.indexOf("gradient("&&e.indexOf("Alpha"))&&u.removeAttribute("filter")),!v){var P,S,k,R=8>f?1:-1;for(c=s.ieOffsetX||0,m=s.ieOffsetY||0,s.ieOffsetX=Math.round((d-((0>o?-o:o)*d+(0>h?-h:h)*g))/2+x),s.ieOffsetY=Math.round((g-((0>_?-_:_)*g+(0>l?-l:l)*d))/2+b),fe=0;4>fe;fe++)S=J[fe],P=p[S],i=-1!==P.indexOf("px")?parseFloat(P):Q(this.t,S,parseFloat(P),P.replace(y,""))||0,k=i!==s[S]?2>fe?-s.ieOffsetX:-s.ieOffsetY:2>fe?c-s.ieOffsetX:m-s.ieOffsetY,u[S]=(s[S]=Math.round(i-k*(0===fe||2===fe?1:R)))+"px"}}},ke=N.set3DTransformRatio=function(t){var e,i,s,r,n,a,o,h,l,_,u,c,f,m,d,g,v,y,T,w,x,b,P,S=this.data,k=this.t.style,R=S.rotation*M,A=S.scaleX,C=S.scaleY,O=S.scaleZ,D=S.x,z=S.y,I=S.z,E=S.perspective;if(!(1!==t&&0!==t||"auto"!==S.force3D||S.rotationY||S.rotationX||1!==O||E||I))return Re.call(this,t),void 0;if(p){var L=1e-4;L>A&&A>-L&&(A=O=2e-5),L>C&&C>-L&&(C=O=2e-5),!E||S.z||S.rotationX||S.rotationY||(E=0)}if(R||S.skewX)y=Math.cos(R),T=Math.sin(R),e=y,n=T,S.skewX&&(R-=S.skewX*M,y=Math.cos(R),T=Math.sin(R),"simple"===S.skewType&&(w=Math.tan(S.skewX*M),w=Math.sqrt(1+w*w),y*=w,T*=w)),i=-T,a=y;else{if(!(S.rotationY||S.rotationX||1!==O||E))return k[ye]=(S.xPercent||S.yPercent?"translate("+S.xPercent+"%,"+S.yPercent+"%) translate3d(":"translate3d(")+D+"px,"+z+"px,"+I+"px)"+(1!==A||1!==C?" scale("+A+","+C+")":""),void 0;e=a=1,i=n=0}u=1,s=r=o=h=l=_=c=f=m=0,d=E?-1/E:0,g=S.zOrigin,v=1e5,R=S.rotationY*M,R&&(y=Math.cos(R),T=Math.sin(R),l=u*-T,f=d*-T,s=e*T,o=n*T,u*=y,d*=y,e*=y,n*=y),R=S.rotationX*M,R&&(y=Math.cos(R),T=Math.sin(R),w=i*y+s*T,x=a*y+o*T,b=_*y+u*T,P=m*y+d*T,s=i*-T+s*y,o=a*-T+o*y,u=_*-T+u*y,d=m*-T+d*y,i=w,a=x,_=b,m=P),1!==O&&(s*=O,o*=O,u*=O,d*=O),1!==C&&(i*=C,a*=C,_*=C,m*=C),1!==A&&(e*=A,n*=A,l*=A,f*=A),g&&(c-=g,r=s*c,h=o*c,c=u*c+g),r=(w=(r+=D)-(r|=0))?(0|w*v+(0>w?-.5:.5))/v+r:r,h=(w=(h+=z)-(h|=0))?(0|w*v+(0>w?-.5:.5))/v+h:h,c=(w=(c+=I)-(c|=0))?(0|w*v+(0>w?-.5:.5))/v+c:c,k[ye]=(S.xPercent||S.yPercent?"translate("+S.xPercent+"%,"+S.yPercent+"%) matrix3d(":"matrix3d(")+[(0|e*v)/v,(0|n*v)/v,(0|l*v)/v,(0|f*v)/v,(0|i*v)/v,(0|a*v)/v,(0|_*v)/v,(0|m*v)/v,(0|s*v)/v,(0|o*v)/v,(0|u*v)/v,(0|d*v)/v,r,h,c,E?1+-c/E:1].join(",")+")"},Re=N.set2DTransformRatio=function(t){var e,i,s,r,n,a=this.data,o=this.t,h=o.style,l=a.x,_=a.y;return a.rotationX||a.rotationY||a.z||a.force3D===!0||"auto"===a.force3D&&1!==t&&0!==t?(this.setRatio=ke,ke.call(this,t),void 0):(a.rotation||a.skewX?(e=a.rotation*M,i=e-a.skewX*M,s=1e5,r=a.scaleX*s,n=a.scaleY*s,h[ye]=(a.xPercent||a.yPercent?"translate("+a.xPercent+"%,"+a.yPercent+"%) matrix(":"matrix(")+(0|Math.cos(e)*r)/s+","+(0|Math.sin(e)*r)/s+","+(0|Math.sin(i)*-n)/s+","+(0|Math.cos(i)*n)/s+","+l+","+_+")"):h[ye]=(a.xPercent||a.yPercent?"translate("+a.xPercent+"%,"+a.yPercent+"%) matrix(":"matrix(")+a.scaleX+",0,0,"+a.scaleY+","+l+","+_+")",void 0)};de("transform,scale,scaleX,scaleY,scaleZ,x,y,z,rotation,rotationX,rotationY,rotationZ,skewX,skewY,shortRotation,shortRotationX,shortRotationY,shortRotationZ,transformOrigin,transformPerspective,directionalRotation,parseTransform,force3D,skewType,xPercent,yPercent",{parser:function(t,e,i,s,n,o,h){if(s._transform)return n;var l,_,u,p,c,f,m,d=s._transform=Pe(t,r,!0,h.parseTransform),g=t.style,v=1e-6,y=ve.length,T=h,w={};if("string"==typeof T.transform&&ye)u=L.style,u[ye]=T.transform,u.display="block",u.position="absolute",E.body.appendChild(L),l=Pe(L,null,!1),E.body.removeChild(L);else if("object"==typeof T){if(l={scaleX:se(null!=T.scaleX?T.scaleX:T.scale,d.scaleX),scaleY:se(null!=T.scaleY?T.scaleY:T.scale,d.scaleY),scaleZ:se(T.scaleZ,d.scaleZ),x:se(T.x,d.x),y:se(T.y,d.y),z:se(T.z,d.z),xPercent:se(T.xPercent,d.xPercent),yPercent:se(T.yPercent,d.yPercent),perspective:se(T.transformPerspective,d.perspective)},m=T.directionalRotation,null!=m)if("object"==typeof m)for(u in m)T[u]=m[u];else T.rotation=m;"string"==typeof T.x&&-1!==T.x.indexOf("%")&&(l.x=0,l.xPercent=se(T.x,d.xPercent)),"string"==typeof T.y&&-1!==T.y.indexOf("%")&&(l.y=0,l.yPercent=se(T.y,d.yPercent)),l.rotation=re("rotation"in T?T.rotation:"shortRotation"in T?T.shortRotation+"_short":"rotationZ"in T?T.rotationZ:d.rotation,d.rotation,"rotation",w),xe&&(l.rotationX=re("rotationX"in T?T.rotationX:"shortRotationX"in T?T.shortRotationX+"_short":d.rotationX||0,d.rotationX,"rotationX",w),l.rotationY=re("rotationY"in T?T.rotationY:"shortRotationY"in T?T.shortRotationY+"_short":d.rotationY||0,d.rotationY,"rotationY",w)),l.skewX=null==T.skewX?d.skewX:re(T.skewX,d.skewX),l.skewY=null==T.skewY?d.skewY:re(T.skewY,d.skewY),(_=l.skewY-d.skewY)&&(l.skewX+=_,l.rotation+=_)}for(xe&&null!=T.force3D&&(d.force3D=T.force3D,f=!0),d.skewType=T.skewType||d.skewType||a.defaultSkewType,c=d.force3D||d.z||d.rotationX||d.rotationY||l.z||l.rotationX||l.rotationY||l.perspective,c||null==T.scale||(l.scaleZ=1);--y>-1;)i=ve[y],p=l[i]-d[i],(p>v||-v>p||null!=I[i])&&(f=!0,n=new pe(d,i,d[i],p,n),i in w&&(n.e=w[i]),n.xs0=0,n.plugin=o,s._overwriteProps.push(n.n));return p=T.transformOrigin,(p||xe&&c&&d.zOrigin)&&(ye?(f=!0,i=we,p=(p||W(t,i,r,!1,"50% 50%"))+"",n=new pe(g,i,0,0,n,-1,"transformOrigin"),n.b=g[i],n.plugin=o,xe?(u=d.zOrigin,p=p.split(" "),d.zOrigin=(p.length>2&&(0===u||"0px"!==p[2])?parseFloat(p[2]):u)||0,n.xs0=n.e=p[0]+" "+(p[1]||"50%")+" 0px",n=new pe(d,"zOrigin",0,0,n,-1,n.n),n.b=u,n.xs0=n.e=d.zOrigin):n.xs0=n.e=p):ee(p+"",d)),f&&(s._transformType=c||3===this._transformType?3:2),n},prefix:!0}),de("boxShadow",{defaultValue:"0px 0px 0px 0px #999",prefix:!0,color:!0,multi:!0,keyword:"inset"}),de("borderRadius",{defaultValue:"0px",parser:function(t,e,i,n,a){e=this.format(e);var o,h,l,_,u,p,c,f,m,d,g,v,y,T,w,x,b=["borderTopLeftRadius","borderTopRightRadius","borderBottomRightRadius","borderBottomLeftRadius"],P=t.style;for(m=parseFloat(t.offsetWidth),d=parseFloat(t.offsetHeight),o=e.split(" "),h=0;b.length>h;h++)this.p.indexOf("border")&&(b[h]=V(b[h])),u=_=W(t,b[h],r,!1,"0px"),-1!==u.indexOf(" ")&&(_=u.split(" "),u=_[0],_=_[1]),p=l=o[h],c=parseFloat(u),v=u.substr((c+"").length),y="="===p.charAt(1),y?(f=parseInt(p.charAt(0)+"1",10),p=p.substr(2),f*=parseFloat(p),g=p.substr((f+"").length-(0>f?1:0))||""):(f=parseFloat(p),g=p.substr((f+"").length)),""===g&&(g=s[i]||v),g!==v&&(T=Q(t,"borderLeft",c,v),w=Q(t,"borderTop",c,v),"%"===g?(u=100*(T/m)+"%",_=100*(w/d)+"%"):"em"===g?(x=Q(t,"borderLeft",1,"em"),u=T/x+"em",_=w/x+"em"):(u=T+"px",_=w+"px"),y&&(p=parseFloat(u)+f+g,l=parseFloat(_)+f+g)),a=ce(P,b[h],u+" "+_,p+" "+l,!1,"0px",a);return a},prefix:!0,formatter:le("0px 0px 0px 0px",!1,!0)}),de("backgroundPosition",{defaultValue:"0 0",parser:function(t,e,i,s,n,a){var o,h,l,_,u,p,c="background-position",m=r||G(t,null),d=this.format((m?f?m.getPropertyValue(c+"-x")+" "+m.getPropertyValue(c+"-y"):m.getPropertyValue(c):t.currentStyle.backgroundPositionX+" "+t.currentStyle.backgroundPositionY)||"0 0"),g=this.format(e);if(-1!==d.indexOf("%")!=(-1!==g.indexOf("%"))&&(p=W(t,"backgroundImage").replace(k,""),p&&"none"!==p)){for(o=d.split(" "),h=g.split(" "),F.setAttribute("src",p),l=2;--l>-1;)d=o[l],_=-1!==d.indexOf("%"),_!==(-1!==h[l].indexOf("%"))&&(u=0===l?t.offsetWidth-F.width:t.offsetHeight-F.height,o[l]=_?parseFloat(d)/100*u+"px":100*(parseFloat(d)/u)+"%");d=o.join(" ")}return this.parseComplex(t.style,d,g,n,a)},formatter:ee}),de("backgroundSize",{defaultValue:"0 0",formatter:ee}),de("perspective",{defaultValue:"0px",prefix:!0}),de("perspectiveOrigin",{defaultValue:"50% 50%",prefix:!0}),de("transformStyle",{prefix:!0}),de("backfaceVisibility",{prefix:!0}),de("userSelect",{prefix:!0}),de("margin",{parser:_e("marginTop,marginRight,marginBottom,marginLeft")}),de("padding",{parser:_e("paddingTop,paddingRight,paddingBottom,paddingLeft")}),de("clip",{defaultValue:"rect(0px,0px,0px,0px)",parser:function(t,e,i,s,n,a){var o,h,l;return 9>f?(h=t.currentStyle,l=8>f?" ":",",o="rect("+h.clipTop+l+h.clipRight+l+h.clipBottom+l+h.clipLeft+")",e=this.format(e).split(",").join(l)):(o=this.format(W(t,this.p,r,!1,this.dflt)),e=this.format(e)),this.parseComplex(t.style,o,e,n,a)}}),de("textShadow",{defaultValue:"0px 0px 0px #999",color:!0,multi:!0}),de("autoRound,strictUnits",{parser:function(t,e,i,s,r){return r}}),de("border",{defaultValue:"0px solid #000",parser:function(t,e,i,s,n,a){return this.parseComplex(t.style,this.format(W(t,"borderTopWidth",r,!1,"0px")+" "+W(t,"borderTopStyle",r,!1,"solid")+" "+W(t,"borderTopColor",r,!1,"#000")),this.format(e),n,a)},color:!0,formatter:function(t){var e=t.split(" ");return e[0]+" "+(e[1]||"solid")+" "+(t.match(he)||["#000"])[0]}}),de("borderWidth",{parser:_e("borderTopWidth,borderRightWidth,borderBottomWidth,borderLeftWidth")}),de("float,cssFloat,styleFloat",{parser:function(t,e,i,s,r){var n=t.style,a="cssFloat"in n?"cssFloat":"styleFloat";return new pe(n,a,0,0,r,-1,i,!1,0,n[a],e)}});var Ae=function(t){var e,i=this.t,s=i.filter||W(this.data,"filter"),r=0|this.s+this.c*t;100===r&&(-1===s.indexOf("atrix(")&&-1===s.indexOf("radient(")&&-1===s.indexOf("oader(")?(i.removeAttribute("filter"),e=!W(this.data,"filter")):(i.filter=s.replace(x,""),e=!0)),e||(this.xn1&&(i.filter=s=s||"alpha(opacity="+r+")"),-1===s.indexOf("pacity")?0===r&&this.xn1||(i.filter=s+" alpha(opacity="+r+")"):i.filter=s.replace(T,"opacity="+r))};de("opacity,alpha,autoAlpha",{defaultValue:"1",parser:function(t,e,i,s,n,a){var o=parseFloat(W(t,"opacity",r,!1,"1")),h=t.style,l="autoAlpha"===i;return"string"==typeof e&&"="===e.charAt(1)&&(e=("-"===e.charAt(0)?-1:1)*parseFloat(e.substr(2))+o),l&&1===o&&"hidden"===W(t,"visibility",r)&&0!==e&&(o=0),U?n=new pe(h,"opacity",o,e-o,n):(n=new pe(h,"opacity",100*o,100*(e-o),n),n.xn1=l?1:0,h.zoom=1,n.type=2,n.b="alpha(opacity="+n.s+")",n.e="alpha(opacity="+(n.s+n.c)+")",n.data=t,n.plugin=a,n.setRatio=Ae),l&&(n=new pe(h,"visibility",0,0,n,-1,null,!1,0,0!==o?"inherit":"hidden",0===e?"hidden":"inherit"),n.xs0="inherit",s._overwriteProps.push(n.n),s._overwriteProps.push(i)),n}});var Ce=function(t,e){e&&(t.removeProperty?("ms"===e.substr(0,2)&&(e="M"+e.substr(1)),t.removeProperty(e.replace(P,"-$1").toLowerCase())):t.removeAttribute(e))},Oe=function(t){if(this.t._gsClassPT=this,1===t||0===t){this.t.setAttribute("class",0===t?this.b:this.e);for(var e=this.data,i=this.t.style;e;)e.v?i[e.p]=e.v:Ce(i,e.p),e=e._next;1===t&&this.t._gsClassPT===this&&(this.t._gsClassPT=null)}else this.t.getAttribute("class")!==this.e&&this.t.setAttribute("class",this.e)};de("className",{parser:function(t,e,s,n,a,o,h){var l,_,u,p,c,f=t.getAttribute("class")||"",m=t.style.cssText;if(a=n._classNamePT=new pe(t,s,0,0,a,2),a.setRatio=Oe,a.pr=-11,i=!0,a.b=f,_=$(t,r),u=t._gsClassPT){for(p={},c=u.data;c;)p[c.p]=1,c=c._next;u.setRatio(1)}return t._gsClassPT=a,a.e="="!==e.charAt(1)?e:f.replace(RegExp("\\s*\\b"+e.substr(2)+"\\b"),"")+("+"===e.charAt(0)?" "+e.substr(2):""),n._tween._duration&&(t.setAttribute("class",a.e),l=H(t,_,$(t),h,p),t.setAttribute("class",f),a.data=l.firstMPT,t.style.cssText=m,a=a.xfirst=n.parse(t,l.difs,a,o)),a}});var De=function(t){if((1===t||0===t)&&this.data._totalTime===this.data._totalDuration&&"isFromStart"!==this.data.data){var e,i,s,r,n=this.t.style,a=o.transform.parse;if("all"===this.e)n.cssText="",r=!0;else for(e=this.e.split(","),s=e.length;--s>-1;)i=e[s],o[i]&&(o[i].parse===a?r=!0:i="transformOrigin"===i?we:o[i].p),Ce(n,i);r&&(Ce(n,ye),this.t._gsTransform&&delete this.t._gsTransform)}};for(de("clearProps",{parser:function(t,e,s,r,n){return n=new pe(t,s,0,0,n,2),n.setRatio=De,n.e=e,n.pr=-10,n.data=r._tween,i=!0,n}}),h="bezier,throwProps,physicsProps,physics2D".split(","),fe=h.length;fe--;)ge(h[fe]);h=a.prototype,h._firstPT=null,h._onInitTween=function(t,e,o){if(!t.nodeType)return!1;this._target=t,this._tween=o,this._vars=e,l=e.autoRound,i=!1,s=e.suffixMap||a.suffixMap,r=G(t,""),n=this._overwriteProps;var h,p,f,m,d,g,v,y,T,x=t.style;if(_&&""===x.zIndex&&(h=W(t,"zIndex",r),("auto"===h||""===h)&&this._addLazySet(x,"zIndex",0)),"string"==typeof e&&(m=x.cssText,h=$(t,r),x.cssText=m+";"+e,h=H(t,h,$(t)).difs,!U&&w.test(e)&&(h.opacity=parseFloat(RegExp.$1)),e=h,x.cssText=m),this._firstPT=p=this.parse(t,e,null),this._transformType){for(T=3===this._transformType,ye?u&&(_=!0,""===x.zIndex&&(v=W(t,"zIndex",r),("auto"===v||""===v)&&this._addLazySet(x,"zIndex",0)),c&&this._addLazySet(x,"WebkitBackfaceVisibility",this._vars.WebkitBackfaceVisibility||(T?"visible":"hidden"))):x.zoom=1,f=p;f&&f._next;)f=f._next;y=new pe(t,"transform",0,0,null,2),this._linkCSSP(y,null,f),y.setRatio=T&&xe?ke:ye?Re:Se,y.data=this._transform||Pe(t,r,!0),n.pop()}if(i){for(;p;){for(g=p._next,f=m;f&&f.pr>p.pr;)f=f._next;(p._prev=f?f._prev:d)?p._prev._next=p:m=p,(p._next=f)?f._prev=p:d=p,p=g}this._firstPT=m}return!0},h.parse=function(t,e,i,n){var a,h,_,u,p,c,f,m,d,g,v=t.style;for(a in e)c=e[a],h=o[a],h?i=h.parse(t,c,a,this,i,n,e):(p=W(t,a,r)+"",d="string"==typeof c,"color"===a||"fill"===a||"stroke"===a||-1!==a.indexOf("Color")||d&&b.test(c)?(d||(c=oe(c),c=(c.length>3?"rgba(":"rgb(")+c.join(",")+")"),i=ce(v,a,p,c,!0,"transparent",i,0,n)):!d||-1===c.indexOf(" ")&&-1===c.indexOf(",")?(_=parseFloat(p),f=_||0===_?p.substr((_+"").length):"",(""===p||"auto"===p)&&("width"===a||"height"===a?(_=te(t,a,r),f="px"):"left"===a||"top"===a?(_=Z(t,a,r),f="px"):(_="opacity"!==a?0:1,f="")),g=d&&"="===c.charAt(1),g?(u=parseInt(c.charAt(0)+"1",10),c=c.substr(2),u*=parseFloat(c),m=c.replace(y,"")):(u=parseFloat(c),m=d?c.substr((u+"").length)||"":""),""===m&&(m=a in s?s[a]:f),c=u||0===u?(g?u+_:u)+m:e[a],f!==m&&""!==m&&(u||0===u)&&_&&(_=Q(t,a,_,f),"%"===m?(_/=Q(t,a,100,"%")/100,e.strictUnits!==!0&&(p=_+"%")):"em"===m?_/=Q(t,a,1,"em"):"px"!==m&&(u=Q(t,a,u,m),m="px"),g&&(u||0===u)&&(c=u+_+m)),g&&(u+=_),!_&&0!==_||!u&&0!==u?void 0!==v[a]&&(c||"NaN"!=c+""&&null!=c)?(i=new pe(v,a,u||_||0,0,i,-1,a,!1,0,p,c),i.xs0="none"!==c||"display"!==a&&-1===a.indexOf("Style")?c:p):j("invalid "+a+" tween value: "+e[a]):(i=new pe(v,a,_,u-_,i,0,a,l!==!1&&("px"===m||"zIndex"===a),0,p,c),i.xs0=m)):i=ce(v,a,p,c,!0,null,i,0,n)),n&&i&&!i.plugin&&(i.plugin=n);
return i},h.setRatio=function(t){var e,i,s,r=this._firstPT,n=1e-6;if(1!==t||this._tween._time!==this._tween._duration&&0!==this._tween._time)if(t||this._tween._time!==this._tween._duration&&0!==this._tween._time||this._tween._rawPrevTime===-1e-6)for(;r;){if(e=r.c*t+r.s,r.r?e=Math.round(e):n>e&&e>-n&&(e=0),r.type)if(1===r.type)if(s=r.l,2===s)r.t[r.p]=r.xs0+e+r.xs1+r.xn1+r.xs2;else if(3===s)r.t[r.p]=r.xs0+e+r.xs1+r.xn1+r.xs2+r.xn2+r.xs3;else if(4===s)r.t[r.p]=r.xs0+e+r.xs1+r.xn1+r.xs2+r.xn2+r.xs3+r.xn3+r.xs4;else if(5===s)r.t[r.p]=r.xs0+e+r.xs1+r.xn1+r.xs2+r.xn2+r.xs3+r.xn3+r.xs4+r.xn4+r.xs5;else{for(i=r.xs0+e+r.xs1,s=1;r.l>s;s++)i+=r["xn"+s]+r["xs"+(s+1)];r.t[r.p]=i}else-1===r.type?r.t[r.p]=r.xs0:r.setRatio&&r.setRatio(t);else r.t[r.p]=e+r.xs0;r=r._next}else for(;r;)2!==r.type?r.t[r.p]=r.b:r.setRatio(t),r=r._next;else for(;r;)2!==r.type?r.t[r.p]=r.e:r.setRatio(t),r=r._next},h._enableTransforms=function(t){this._transformType=t||3===this._transformType?3:2,this._transform=this._transform||Pe(this._target,r,!0)};var Me=function(){this.t[this.p]=this.e,this.data._linkCSSP(this,this._next,null,!0)};h._addLazySet=function(t,e,i){var s=this._firstPT=new pe(t,e,0,0,this._firstPT,2);s.e=i,s.setRatio=Me,s.data=this},h._linkCSSP=function(t,e,i,s){return t&&(e&&(e._prev=t),t._next&&(t._next._prev=t._prev),t._prev?t._prev._next=t._next:this._firstPT===t&&(this._firstPT=t._next,s=!0),i?i._next=t:s||null!==this._firstPT||(this._firstPT=t),t._next=e,t._prev=i),t},h._kill=function(e){var i,s,r,n=e;if(e.autoAlpha||e.alpha){n={};for(s in e)n[s]=e[s];n.opacity=1,n.autoAlpha&&(n.visibility=1)}return e.className&&(i=this._classNamePT)&&(r=i.xfirst,r&&r._prev?this._linkCSSP(r._prev,i._next,r._prev._prev):r===this._firstPT&&(this._firstPT=i._next),i._next&&this._linkCSSP(i._next,i._next._next,r._prev),this._classNamePT=null),t.prototype._kill.call(this,n)};var ze=function(t,e,i){var s,r,n,a;if(t.slice)for(r=t.length;--r>-1;)ze(t[r],e,i);else for(s=t.childNodes,r=s.length;--r>-1;)n=s[r],a=n.type,n.style&&(e.push($(n)),i&&i.push(n)),1!==a&&9!==a&&11!==a||!n.childNodes.length||ze(n,e,i)};return a.cascadeTo=function(t,i,s){var r,n,a,o=e.to(t,i,s),h=[o],l=[],_=[],u=[],p=e._internals.reservedProps;for(t=o._targets||o.target,ze(t,l,u),o.render(i,!0),ze(t,_),o.render(0,!0),o._enabled(!0),r=u.length;--r>-1;)if(n=H(u[r],l[r],_[r]),n.firstMPT){n=n.difs;for(a in s)p[a]&&(n[a]=s[a]);h.push(e.to(u[r],i,n))}return h},t.activate([a]),a},!0),function(){var t=_gsScope._gsDefine.plugin({propName:"roundProps",priority:-1,API:2,init:function(t,e,i){return this._tween=i,!0}}),e=t.prototype;e._onInitAllProps=function(){for(var t,e,i,s=this._tween,r=s.vars.roundProps instanceof Array?s.vars.roundProps:s.vars.roundProps.split(","),n=r.length,a={},o=s._propLookup.roundProps;--n>-1;)a[r[n]]=1;for(n=r.length;--n>-1;)for(t=r[n],e=s._firstPT;e;)i=e._next,e.pg?e.t._roundProps(a,!0):e.n===t&&(this._add(e.t,t,e.s,e.c),i&&(i._prev=e._prev),e._prev?e._prev._next=i:s._firstPT===e&&(s._firstPT=i),e._next=e._prev=null,s._propLookup[t]=o),e=i;return!1},e._add=function(t,e,i,s){this._addTween(t,e,i,i+s,e,!0),this._overwriteProps.push(e)}}(),_gsScope._gsDefine.plugin({propName:"attr",API:2,version:"0.3.3",init:function(t,e){var i,s,r;if("function"!=typeof t.setAttribute)return!1;this._target=t,this._proxy={},this._start={},this._end={};for(i in e)this._start[i]=this._proxy[i]=s=t.getAttribute(i),r=this._addTween(this._proxy,i,parseFloat(s),e[i],i),this._end[i]=r?r.s+r.c:e[i],this._overwriteProps.push(i);return!0},set:function(t){this._super.setRatio.call(this,t);for(var e,i=this._overwriteProps,s=i.length,r=1===t?this._end:t?this._proxy:this._start;--s>-1;)e=i[s],this._target.setAttribute(e,r[e]+"")}}),_gsScope._gsDefine.plugin({propName:"directionalRotation",version:"0.2.1",API:2,init:function(t,e){"object"!=typeof e&&(e={rotation:e}),this.finals={};var i,s,r,n,a,o,h=e.useRadians===!0?2*Math.PI:360,l=1e-6;for(i in e)"useRadians"!==i&&(o=(e[i]+"").split("_"),s=o[0],r=parseFloat("function"!=typeof t[i]?t[i]:t[i.indexOf("set")||"function"!=typeof t["get"+i.substr(3)]?i:"get"+i.substr(3)]()),n=this.finals[i]="string"==typeof s&&"="===s.charAt(1)?r+parseInt(s.charAt(0)+"1",10)*Number(s.substr(2)):Number(s)||0,a=n-r,o.length&&(s=o.join("_"),-1!==s.indexOf("short")&&(a%=h,a!==a%(h/2)&&(a=0>a?a+h:a-h)),-1!==s.indexOf("_cw")&&0>a?a=(a+9999999999*h)%h-(0|a/h)*h:-1!==s.indexOf("ccw")&&a>0&&(a=(a-9999999999*h)%h-(0|a/h)*h)),(a>l||-l>a)&&(this._addTween(t,i,r,r+a,i),this._overwriteProps.push(i)));return!0},set:function(t){var e;if(1!==t)this._super.setRatio.call(this,t);else for(e=this._firstPT;e;)e.f?e.t[e.p](this.finals[e.p]):e.t[e.p]=this.finals[e.p],e=e._next}})._autoCSS=!0,_gsScope._gsDefine("easing.Back",["easing.Ease"],function(t){var e,i,s,r=_gsScope.GreenSockGlobals||_gsScope,n=r.com.greensock,a=2*Math.PI,o=Math.PI/2,h=n._class,l=function(e,i){var s=h("easing."+e,function(){},!0),r=s.prototype=new t;return r.constructor=s,r.getRatio=i,s},_=t.register||function(){},u=function(t,e,i,s){var r=h("easing."+t,{easeOut:new e,easeIn:new i,easeInOut:new s},!0);return _(r,t),r},p=function(t,e,i){this.t=t,this.v=e,i&&(this.next=i,i.prev=this,this.c=i.v-e,this.gap=i.t-t)},c=function(e,i){var s=h("easing."+e,function(t){this._p1=t||0===t?t:1.70158,this._p2=1.525*this._p1},!0),r=s.prototype=new t;return r.constructor=s,r.getRatio=i,r.config=function(t){return new s(t)},s},f=u("Back",c("BackOut",function(t){return(t-=1)*t*((this._p1+1)*t+this._p1)+1}),c("BackIn",function(t){return t*t*((this._p1+1)*t-this._p1)}),c("BackInOut",function(t){return 1>(t*=2)?.5*t*t*((this._p2+1)*t-this._p2):.5*((t-=2)*t*((this._p2+1)*t+this._p2)+2)})),m=h("easing.SlowMo",function(t,e,i){e=e||0===e?e:.7,null==t?t=.7:t>1&&(t=1),this._p=1!==t?e:0,this._p1=(1-t)/2,this._p2=t,this._p3=this._p1+this._p2,this._calcEnd=i===!0},!0),d=m.prototype=new t;return d.constructor=m,d.getRatio=function(t){var e=t+(.5-t)*this._p;return this._p1>t?this._calcEnd?1-(t=1-t/this._p1)*t:e-(t=1-t/this._p1)*t*t*t*e:t>this._p3?this._calcEnd?1-(t=(t-this._p3)/this._p1)*t:e+(t-e)*(t=(t-this._p3)/this._p1)*t*t*t:this._calcEnd?1:e},m.ease=new m(.7,.7),d.config=m.config=function(t,e,i){return new m(t,e,i)},e=h("easing.SteppedEase",function(t){t=t||1,this._p1=1/t,this._p2=t+1},!0),d=e.prototype=new t,d.constructor=e,d.getRatio=function(t){return 0>t?t=0:t>=1&&(t=.999999999),(this._p2*t>>0)*this._p1},d.config=e.config=function(t){return new e(t)},i=h("easing.RoughEase",function(e){e=e||{};for(var i,s,r,n,a,o,h=e.taper||"none",l=[],_=0,u=0|(e.points||20),c=u,f=e.randomize!==!1,m=e.clamp===!0,d=e.template instanceof t?e.template:null,g="number"==typeof e.strength?.4*e.strength:.4;--c>-1;)i=f?Math.random():1/u*c,s=d?d.getRatio(i):i,"none"===h?r=g:"out"===h?(n=1-i,r=n*n*g):"in"===h?r=i*i*g:.5>i?(n=2*i,r=.5*n*n*g):(n=2*(1-i),r=.5*n*n*g),f?s+=Math.random()*r-.5*r:c%2?s+=.5*r:s-=.5*r,m&&(s>1?s=1:0>s&&(s=0)),l[_++]={x:i,y:s};for(l.sort(function(t,e){return t.x-e.x}),o=new p(1,1,null),c=u;--c>-1;)a=l[c],o=new p(a.x,a.y,o);this._prev=new p(0,0,0!==o.t?o:o.next)},!0),d=i.prototype=new t,d.constructor=i,d.getRatio=function(t){var e=this._prev;if(t>e.t){for(;e.next&&t>=e.t;)e=e.next;e=e.prev}else for(;e.prev&&e.t>=t;)e=e.prev;return this._prev=e,e.v+(t-e.t)/e.gap*e.c},d.config=function(t){return new i(t)},i.ease=new i,u("Bounce",l("BounceOut",function(t){return 1/2.75>t?7.5625*t*t:2/2.75>t?7.5625*(t-=1.5/2.75)*t+.75:2.5/2.75>t?7.5625*(t-=2.25/2.75)*t+.9375:7.5625*(t-=2.625/2.75)*t+.984375}),l("BounceIn",function(t){return 1/2.75>(t=1-t)?1-7.5625*t*t:2/2.75>t?1-(7.5625*(t-=1.5/2.75)*t+.75):2.5/2.75>t?1-(7.5625*(t-=2.25/2.75)*t+.9375):1-(7.5625*(t-=2.625/2.75)*t+.984375)}),l("BounceInOut",function(t){var e=.5>t;return t=e?1-2*t:2*t-1,t=1/2.75>t?7.5625*t*t:2/2.75>t?7.5625*(t-=1.5/2.75)*t+.75:2.5/2.75>t?7.5625*(t-=2.25/2.75)*t+.9375:7.5625*(t-=2.625/2.75)*t+.984375,e?.5*(1-t):.5*t+.5})),u("Circ",l("CircOut",function(t){return Math.sqrt(1-(t-=1)*t)}),l("CircIn",function(t){return-(Math.sqrt(1-t*t)-1)}),l("CircInOut",function(t){return 1>(t*=2)?-.5*(Math.sqrt(1-t*t)-1):.5*(Math.sqrt(1-(t-=2)*t)+1)})),s=function(e,i,s){var r=h("easing."+e,function(t,e){this._p1=t||1,this._p2=e||s,this._p3=this._p2/a*(Math.asin(1/this._p1)||0)},!0),n=r.prototype=new t;return n.constructor=r,n.getRatio=i,n.config=function(t,e){return new r(t,e)},r},u("Elastic",s("ElasticOut",function(t){return this._p1*Math.pow(2,-10*t)*Math.sin((t-this._p3)*a/this._p2)+1},.3),s("ElasticIn",function(t){return-(this._p1*Math.pow(2,10*(t-=1))*Math.sin((t-this._p3)*a/this._p2))},.3),s("ElasticInOut",function(t){return 1>(t*=2)?-.5*this._p1*Math.pow(2,10*(t-=1))*Math.sin((t-this._p3)*a/this._p2):.5*this._p1*Math.pow(2,-10*(t-=1))*Math.sin((t-this._p3)*a/this._p2)+1},.45)),u("Expo",l("ExpoOut",function(t){return 1-Math.pow(2,-10*t)}),l("ExpoIn",function(t){return Math.pow(2,10*(t-1))-.001}),l("ExpoInOut",function(t){return 1>(t*=2)?.5*Math.pow(2,10*(t-1)):.5*(2-Math.pow(2,-10*(t-1)))})),u("Sine",l("SineOut",function(t){return Math.sin(t*o)}),l("SineIn",function(t){return-Math.cos(t*o)+1}),l("SineInOut",function(t){return-.5*(Math.cos(Math.PI*t)-1)})),h("easing.EaseLookup",{find:function(e){return t.map[e]}},!0),_(r.SlowMo,"SlowMo","ease,"),_(i,"RoughEase","ease,"),_(e,"SteppedEase","ease,"),f},!0)}),_gsScope._gsDefine&&_gsScope._gsQueue.pop()(),function(t,e){"use strict";var i=t.GreenSockGlobals=t.GreenSockGlobals||t;if(!i.TweenLite){var s,r,n,a,o,h=function(t){var e,s=t.split("."),r=i;for(e=0;s.length>e;e++)r[s[e]]=r=r[s[e]]||{};return r},l=h("com.greensock"),_=1e-10,u=function(t){var e,i=[],s=t.length;for(e=0;e!==s;i.push(t[e++]));return i},p=function(){},c=function(){var t=Object.prototype.toString,e=t.call([]);return function(i){return null!=i&&(i instanceof Array||"object"==typeof i&&!!i.push&&t.call(i)===e)}}(),f={},m=function(s,r,n,a){this.sc=f[s]?f[s].sc:[],f[s]=this,this.gsClass=null,this.func=n;var o=[];this.check=function(l){for(var _,u,p,c,d=r.length,g=d;--d>-1;)(_=f[r[d]]||new m(r[d],[])).gsClass?(o[d]=_.gsClass,g--):l&&_.sc.push(this);if(0===g&&n)for(u=("com.greensock."+s).split("."),p=u.pop(),c=h(u.join("."))[p]=this.gsClass=n.apply(n,o),a&&(i[p]=c,"function"==typeof define&&define.amd?define((t.GreenSockAMDPath?t.GreenSockAMDPath+"/":"")+s.split(".").pop(),[],function(){return c}):s===e&&"undefined"!=typeof module&&module.exports&&(module.exports=c)),d=0;this.sc.length>d;d++)this.sc[d].check()},this.check(!0)},d=t._gsDefine=function(t,e,i,s){return new m(t,e,i,s)},g=l._class=function(t,e,i){return e=e||function(){},d(t,[],function(){return e},i),e};d.globals=i;var v=[0,0,1,1],y=[],T=g("easing.Ease",function(t,e,i,s){this._func=t,this._type=i||0,this._power=s||0,this._params=e?v.concat(e):v},!0),w=T.map={},x=T.register=function(t,e,i,s){for(var r,n,a,o,h=e.split(","),_=h.length,u=(i||"easeIn,easeOut,easeInOut").split(",");--_>-1;)for(n=h[_],r=s?g("easing."+n,null,!0):l.easing[n]||{},a=u.length;--a>-1;)o=u[a],w[n+"."+o]=w[o+n]=r[o]=t.getRatio?t:t[o]||new t};for(n=T.prototype,n._calcEnd=!1,n.getRatio=function(t){if(this._func)return this._params[0]=t,this._func.apply(null,this._params);var e=this._type,i=this._power,s=1===e?1-t:2===e?t:.5>t?2*t:2*(1-t);return 1===i?s*=s:2===i?s*=s*s:3===i?s*=s*s*s:4===i&&(s*=s*s*s*s),1===e?1-s:2===e?s:.5>t?s/2:1-s/2},s=["Linear","Quad","Cubic","Quart","Quint,Strong"],r=s.length;--r>-1;)n=s[r]+",Power"+r,x(new T(null,null,1,r),n,"easeOut",!0),x(new T(null,null,2,r),n,"easeIn"+(0===r?",easeNone":"")),x(new T(null,null,3,r),n,"easeInOut");w.linear=l.easing.Linear.easeIn,w.swing=l.easing.Quad.easeInOut;var b=g("events.EventDispatcher",function(t){this._listeners={},this._eventTarget=t||this});n=b.prototype,n.addEventListener=function(t,e,i,s,r){r=r||0;var n,h,l=this._listeners[t],_=0;for(null==l&&(this._listeners[t]=l=[]),h=l.length;--h>-1;)n=l[h],n.c===e&&n.s===i?l.splice(h,1):0===_&&r>n.pr&&(_=h+1);l.splice(_,0,{c:e,s:i,up:s,pr:r}),this!==a||o||a.wake()},n.removeEventListener=function(t,e){var i,s=this._listeners[t];if(s)for(i=s.length;--i>-1;)if(s[i].c===e)return s.splice(i,1),void 0},n.dispatchEvent=function(t){var e,i,s,r=this._listeners[t];if(r)for(e=r.length,i=this._eventTarget;--e>-1;)s=r[e],s.up?s.c.call(s.s||i,{type:t,target:i}):s.c.call(s.s||i)};var P=t.requestAnimationFrame,S=t.cancelAnimationFrame,k=Date.now||function(){return(new Date).getTime()},R=k();for(s=["ms","moz","webkit","o"],r=s.length;--r>-1&&!P;)P=t[s[r]+"RequestAnimationFrame"],S=t[s[r]+"CancelAnimationFrame"]||t[s[r]+"CancelRequestAnimationFrame"];g("Ticker",function(t,e){var i,s,r,n,h,l=this,u=k(),c=e!==!1&&P,f=500,m=33,d=function(t){var e,a,o=k()-R;o>f&&(u+=o-m),R+=o,l.time=(R-u)/1e3,e=l.time-h,(!i||e>0||t===!0)&&(l.frame++,h+=e+(e>=n?.004:n-e),a=!0),t!==!0&&(r=s(d)),a&&l.dispatchEvent("tick")};b.call(l),l.time=l.frame=0,l.tick=function(){d(!0)},l.lagSmoothing=function(t,e){f=t||1/_,m=Math.min(e,f,0)},l.sleep=function(){null!=r&&(c&&S?S(r):clearTimeout(r),s=p,r=null,l===a&&(o=!1))},l.wake=function(){null!==r?l.sleep():l.frame>10&&(R=k()-f+5),s=0===i?p:c&&P?P:function(t){return setTimeout(t,0|1e3*(h-l.time)+1)},l===a&&(o=!0),d(2)},l.fps=function(t){return arguments.length?(i=t,n=1/(i||60),h=this.time+n,l.wake(),void 0):i},l.useRAF=function(t){return arguments.length?(l.sleep(),c=t,l.fps(i),void 0):c},l.fps(t),setTimeout(function(){c&&(!r||5>l.frame)&&l.useRAF(!1)},1500)}),n=l.Ticker.prototype=new l.events.EventDispatcher,n.constructor=l.Ticker;var A=g("core.Animation",function(t,e){if(this.vars=e=e||{},this._duration=this._totalDuration=t||0,this._delay=Number(e.delay)||0,this._timeScale=1,this._active=e.immediateRender===!0,this.data=e.data,this._reversed=e.reversed===!0,B){o||a.wake();var i=this.vars.useFrames?j:B;i.add(this,i._time),this.vars.paused&&this.paused(!0)}});a=A.ticker=new l.Ticker,n=A.prototype,n._dirty=n._gc=n._initted=n._paused=!1,n._totalTime=n._time=0,n._rawPrevTime=-1,n._next=n._last=n._onUpdate=n._timeline=n.timeline=null,n._paused=!1;var C=function(){o&&k()-R>2e3&&a.wake(),setTimeout(C,2e3)};C(),n.play=function(t,e){return null!=t&&this.seek(t,e),this.reversed(!1).paused(!1)},n.pause=function(t,e){return null!=t&&this.seek(t,e),this.paused(!0)},n.resume=function(t,e){return null!=t&&this.seek(t,e),this.paused(!1)},n.seek=function(t,e){return this.totalTime(Number(t),e!==!1)},n.restart=function(t,e){return this.reversed(!1).paused(!1).totalTime(t?-this._delay:0,e!==!1,!0)},n.reverse=function(t,e){return null!=t&&this.seek(t||this.totalDuration(),e),this.reversed(!0).paused(!1)},n.render=function(){},n.invalidate=function(){return this},n.isActive=function(){var t,e=this._timeline,i=this._startTime;return!e||!this._gc&&!this._paused&&e.isActive()&&(t=e.rawTime())>=i&&i+this.totalDuration()/this._timeScale>t},n._enabled=function(t,e){return o||a.wake(),this._gc=!t,this._active=this.isActive(),e!==!0&&(t&&!this.timeline?this._timeline.add(this,this._startTime-this._delay):!t&&this.timeline&&this._timeline._remove(this,!0)),!1},n._kill=function(){return this._enabled(!1,!1)},n.kill=function(t,e){return this._kill(t,e),this},n._uncache=function(t){for(var e=t?this:this.timeline;e;)e._dirty=!0,e=e.timeline;return this},n._swapSelfInParams=function(t){for(var e=t.length,i=t.concat();--e>-1;)"{self}"===t[e]&&(i[e]=this);return i},n.eventCallback=function(t,e,i,s){if("on"===(t||"").substr(0,2)){var r=this.vars;if(1===arguments.length)return r[t];null==e?delete r[t]:(r[t]=e,r[t+"Params"]=c(i)&&-1!==i.join("").indexOf("{self}")?this._swapSelfInParams(i):i,r[t+"Scope"]=s),"onUpdate"===t&&(this._onUpdate=e)}return this},n.delay=function(t){return arguments.length?(this._timeline.smoothChildTiming&&this.startTime(this._startTime+t-this._delay),this._delay=t,this):this._delay},n.duration=function(t){return arguments.length?(this._duration=this._totalDuration=t,this._uncache(!0),this._timeline.smoothChildTiming&&this._time>0&&this._time<this._duration&&0!==t&&this.totalTime(this._totalTime*(t/this._duration),!0),this):(this._dirty=!1,this._duration)},n.totalDuration=function(t){return this._dirty=!1,arguments.length?this.duration(t):this._totalDuration},n.time=function(t,e){return arguments.length?(this._dirty&&this.totalDuration(),this.totalTime(t>this._duration?this._duration:t,e)):this._time},n.totalTime=function(t,e,i){if(o||a.wake(),!arguments.length)return this._totalTime;if(this._timeline){if(0>t&&!i&&(t+=this.totalDuration()),this._timeline.smoothChildTiming){this._dirty&&this.totalDuration();var s=this._totalDuration,r=this._timeline;if(t>s&&!i&&(t=s),this._startTime=(this._paused?this._pauseTime:r._time)-(this._reversed?s-t:t)/this._timeScale,r._dirty||this._uncache(!1),r._timeline)for(;r._timeline;)r._timeline._time!==(r._startTime+r._totalTime)/r._timeScale&&r.totalTime(r._totalTime,!0),r=r._timeline}this._gc&&this._enabled(!0,!1),(this._totalTime!==t||0===this._duration)&&(this.render(t,e,!1),I.length&&q())}return this},n.progress=n.totalProgress=function(t,e){return arguments.length?this.totalTime(this.duration()*t,e):this._time/this.duration()},n.startTime=function(t){return arguments.length?(t!==this._startTime&&(this._startTime=t,this.timeline&&this.timeline._sortChildren&&this.timeline.add(this,t-this._delay)),this):this._startTime},n.timeScale=function(t){if(!arguments.length)return this._timeScale;if(t=t||_,this._timeline&&this._timeline.smoothChildTiming){var e=this._pauseTime,i=e||0===e?e:this._timeline.totalTime();this._startTime=i-(i-this._startTime)*this._timeScale/t}return this._timeScale=t,this._uncache(!1)},n.reversed=function(t){return arguments.length?(t!=this._reversed&&(this._reversed=t,this.totalTime(this._timeline&&!this._timeline.smoothChildTiming?this.totalDuration()-this._totalTime:this._totalTime,!0)),this):this._reversed},n.paused=function(t){if(!arguments.length)return this._paused;if(t!=this._paused&&this._timeline){o||t||a.wake();var e=this._timeline,i=e.rawTime(),s=i-this._pauseTime;!t&&e.smoothChildTiming&&(this._startTime+=s,this._uncache(!1)),this._pauseTime=t?i:null,this._paused=t,this._active=this.isActive(),!t&&0!==s&&this._initted&&this.duration()&&this.render(e.smoothChildTiming?this._totalTime:(i-this._startTime)/this._timeScale,!0,!0)}return this._gc&&!t&&this._enabled(!0,!1),this};var O=g("core.SimpleTimeline",function(t){A.call(this,0,t),this.autoRemoveChildren=this.smoothChildTiming=!0});n=O.prototype=new A,n.constructor=O,n.kill()._gc=!1,n._first=n._last=null,n._sortChildren=!1,n.add=n.insert=function(t,e){var i,s;if(t._startTime=Number(e||0)+t._delay,t._paused&&this!==t._timeline&&(t._pauseTime=t._startTime+(this.rawTime()-t._startTime)/t._timeScale),t.timeline&&t.timeline._remove(t,!0),t.timeline=t._timeline=this,t._gc&&t._enabled(!0,!0),i=this._last,this._sortChildren)for(s=t._startTime;i&&i._startTime>s;)i=i._prev;return i?(t._next=i._next,i._next=t):(t._next=this._first,this._first=t),t._next?t._next._prev=t:this._last=t,t._prev=i,this._timeline&&this._uncache(!0),this},n._remove=function(t,e){return t.timeline===this&&(e||t._enabled(!1,!0),t._prev?t._prev._next=t._next:this._first===t&&(this._first=t._next),t._next?t._next._prev=t._prev:this._last===t&&(this._last=t._prev),t._next=t._prev=t.timeline=null,this._timeline&&this._uncache(!0)),this},n.render=function(t,e,i){var s,r=this._first;for(this._totalTime=this._time=this._rawPrevTime=t;r;)s=r._next,(r._active||t>=r._startTime&&!r._paused)&&(r._reversed?r.render((r._dirty?r.totalDuration():r._totalDuration)-(t-r._startTime)*r._timeScale,e,i):r.render((t-r._startTime)*r._timeScale,e,i)),r=s},n.rawTime=function(){return o||a.wake(),this._totalTime};var D=g("TweenLite",function(e,i,s){if(A.call(this,i,s),this.render=D.prototype.render,null==e)throw"Cannot tween a null target.";this.target=e="string"!=typeof e?e:D.selector(e)||e;var r,n,a,o=e.jquery||e.length&&e!==t&&e[0]&&(e[0]===t||e[0].nodeType&&e[0].style&&!e.nodeType),h=this.vars.overwrite;if(this._overwrite=h=null==h?Y[D.defaultOverwrite]:"number"==typeof h?h>>0:Y[h],(o||e instanceof Array||e.push&&c(e))&&"number"!=typeof e[0])for(this._targets=a=u(e),this._propLookup=[],this._siblings=[],r=0;a.length>r;r++)n=a[r],n?"string"!=typeof n?n.length&&n!==t&&n[0]&&(n[0]===t||n[0].nodeType&&n[0].style&&!n.nodeType)?(a.splice(r--,1),this._targets=a=a.concat(u(n))):(this._siblings[r]=V(n,this,!1),1===h&&this._siblings[r].length>1&&G(n,this,null,1,this._siblings[r])):(n=a[r--]=D.selector(n),"string"==typeof n&&a.splice(r+1,1)):a.splice(r--,1);else this._propLookup={},this._siblings=V(e,this,!1),1===h&&this._siblings.length>1&&G(e,this,null,1,this._siblings);(this.vars.immediateRender||0===i&&0===this._delay&&this.vars.immediateRender!==!1)&&(this._time=-_,this.render(-this._delay))},!0),M=function(e){return e.length&&e!==t&&e[0]&&(e[0]===t||e[0].nodeType&&e[0].style&&!e.nodeType)},z=function(t,e){var i,s={};for(i in t)U[i]||i in e&&"transform"!==i&&"x"!==i&&"y"!==i&&"width"!==i&&"height"!==i&&"className"!==i&&"border"!==i||!(!F[i]||F[i]&&F[i]._autoCSS)||(s[i]=t[i],delete t[i]);t.css=s};n=D.prototype=new A,n.constructor=D,n.kill()._gc=!1,n.ratio=0,n._firstPT=n._targets=n._overwrittenProps=n._startAt=null,n._notifyPluginsOfEnabled=n._lazy=!1,D.version="1.13.1",D.defaultEase=n._ease=new T(null,null,1,1),D.defaultOverwrite="auto",D.ticker=a,D.autoSleep=!0,D.lagSmoothing=function(t,e){a.lagSmoothing(t,e)},D.selector=t.$||t.jQuery||function(e){var i=t.$||t.jQuery;return i?(D.selector=i,i(e)):"undefined"==typeof document?e:document.querySelectorAll?document.querySelectorAll(e):document.getElementById("#"===e.charAt(0)?e.substr(1):e)};var I=[],E={},L=D._internals={isArray:c,isSelector:M,lazyTweens:I},F=D._plugins={},N=L.tweenLookup={},X=0,U=L.reservedProps={ease:1,delay:1,overwrite:1,onComplete:1,onCompleteParams:1,onCompleteScope:1,useFrames:1,runBackwards:1,startAt:1,onUpdate:1,onUpdateParams:1,onUpdateScope:1,onStart:1,onStartParams:1,onStartScope:1,onReverseComplete:1,onReverseCompleteParams:1,onReverseCompleteScope:1,onRepeat:1,onRepeatParams:1,onRepeatScope:1,easeParams:1,yoyo:1,immediateRender:1,repeat:1,repeatDelay:1,data:1,paused:1,reversed:1,autoCSS:1,lazy:1},Y={none:0,all:1,auto:2,concurrent:3,allOnStart:4,preexisting:5,"true":1,"false":0},j=A._rootFramesTimeline=new O,B=A._rootTimeline=new O,q=L.lazyRender=function(){var t=I.length;for(E={};--t>-1;)s=I[t],s&&s._lazy!==!1&&(s.render(s._lazy,!1,!0),s._lazy=!1);I.length=0};B._startTime=a.time,j._startTime=a.frame,B._active=j._active=!0,setTimeout(q,1),A._updateRoot=D.render=function(){var t,e,i;if(I.length&&q(),B.render((a.time-B._startTime)*B._timeScale,!1,!1),j.render((a.frame-j._startTime)*j._timeScale,!1,!1),I.length&&q(),!(a.frame%120)){for(i in N){for(e=N[i].tweens,t=e.length;--t>-1;)e[t]._gc&&e.splice(t,1);0===e.length&&delete N[i]}if(i=B._first,(!i||i._paused)&&D.autoSleep&&!j._first&&1===a._listeners.tick.length){for(;i&&i._paused;)i=i._next;i||a.sleep()}}},a.addEventListener("tick",A._updateRoot);var V=function(t,e,i){var s,r,n=t._gsTweenID;if(N[n||(t._gsTweenID=n="t"+X++)]||(N[n]={target:t,tweens:[]}),e&&(s=N[n].tweens,s[r=s.length]=e,i))for(;--r>-1;)s[r]===e&&s.splice(r,1);return N[n].tweens},G=function(t,e,i,s,r){var n,a,o,h;if(1===s||s>=4){for(h=r.length,n=0;h>n;n++)if((o=r[n])!==e)o._gc||o._enabled(!1,!1)&&(a=!0);else if(5===s)break;return a}var l,u=e._startTime+_,p=[],c=0,f=0===e._duration;for(n=r.length;--n>-1;)(o=r[n])===e||o._gc||o._paused||(o._timeline!==e._timeline?(l=l||W(e,0,f),0===W(o,l,f)&&(p[c++]=o)):u>=o._startTime&&o._startTime+o.totalDuration()/o._timeScale>u&&((f||!o._initted)&&2e-10>=u-o._startTime||(p[c++]=o)));for(n=c;--n>-1;)o=p[n],2===s&&o._kill(i,t)&&(a=!0),(2!==s||!o._firstPT&&o._initted)&&o._enabled(!1,!1)&&(a=!0);return a},W=function(t,e,i){for(var s=t._timeline,r=s._timeScale,n=t._startTime;s._timeline;){if(n+=s._startTime,r*=s._timeScale,s._paused)return-100;s=s._timeline}return n/=r,n>e?n-e:i&&n===e||!t._initted&&2*_>n-e?_:(n+=t.totalDuration()/t._timeScale/r)>e+_?0:n-e-_};n._init=function(){var t,e,i,s,r,n=this.vars,a=this._overwrittenProps,o=this._duration,h=!!n.immediateRender,l=n.ease;if(n.startAt){this._startAt&&(this._startAt.render(-1,!0),this._startAt.kill()),r={};for(s in n.startAt)r[s]=n.startAt[s];if(r.overwrite=!1,r.immediateRender=!0,r.lazy=h&&n.lazy!==!1,r.startAt=r.delay=null,this._startAt=D.to(this.target,0,r),h)if(this._time>0)this._startAt=null;else if(0!==o)return}else if(n.runBackwards&&0!==o)if(this._startAt)this._startAt.render(-1,!0),this._startAt.kill(),this._startAt=null;else{i={};for(s in n)U[s]&&"autoCSS"!==s||(i[s]=n[s]);if(i.overwrite=0,i.data="isFromStart",i.lazy=h&&n.lazy!==!1,i.immediateRender=h,this._startAt=D.to(this.target,0,i),h){if(0===this._time)return}else this._startAt._init(),this._startAt._enabled(!1)}if(this._ease=l=l?l instanceof T?l:"function"==typeof l?new T(l,n.easeParams):w[l]||D.defaultEase:D.defaultEase,n.easeParams instanceof Array&&l.config&&(this._ease=l.config.apply(l,n.easeParams)),this._easeType=this._ease._type,this._easePower=this._ease._power,this._firstPT=null,this._targets)for(t=this._targets.length;--t>-1;)this._initProps(this._targets[t],this._propLookup[t]={},this._siblings[t],a?a[t]:null)&&(e=!0);else e=this._initProps(this.target,this._propLookup,this._siblings,a);if(e&&D._onPluginEvent("_onInitAllProps",this),a&&(this._firstPT||"function"!=typeof this.target&&this._enabled(!1,!1)),n.runBackwards)for(i=this._firstPT;i;)i.s+=i.c,i.c=-i.c,i=i._next;this._onUpdate=n.onUpdate,this._initted=!0},n._initProps=function(e,i,s,r){var n,a,o,h,l,_;if(null==e)return!1;E[e._gsTweenID]&&q(),this.vars.css||e.style&&e!==t&&e.nodeType&&F.css&&this.vars.autoCSS!==!1&&z(this.vars,e);for(n in this.vars){if(_=this.vars[n],U[n])_&&(_ instanceof Array||_.push&&c(_))&&-1!==_.join("").indexOf("{self}")&&(this.vars[n]=_=this._swapSelfInParams(_,this));else if(F[n]&&(h=new F[n])._onInitTween(e,this.vars[n],this)){for(this._firstPT=l={_next:this._firstPT,t:h,p:"setRatio",s:0,c:1,f:!0,n:n,pg:!0,pr:h._priority},a=h._overwriteProps.length;--a>-1;)i[h._overwriteProps[a]]=this._firstPT;(h._priority||h._onInitAllProps)&&(o=!0),(h._onDisable||h._onEnable)&&(this._notifyPluginsOfEnabled=!0)}else this._firstPT=i[n]=l={_next:this._firstPT,t:e,p:n,f:"function"==typeof e[n],n:n,pg:!1,pr:0},l.s=l.f?e[n.indexOf("set")||"function"!=typeof e["get"+n.substr(3)]?n:"get"+n.substr(3)]():parseFloat(e[n]),l.c="string"==typeof _&&"="===_.charAt(1)?parseInt(_.charAt(0)+"1",10)*Number(_.substr(2)):Number(_)-l.s||0;l&&l._next&&(l._next._prev=l)}return r&&this._kill(r,e)?this._initProps(e,i,s,r):this._overwrite>1&&this._firstPT&&s.length>1&&G(e,this,i,this._overwrite,s)?(this._kill(i,e),this._initProps(e,i,s,r)):(this._firstPT&&(this.vars.lazy!==!1&&this._duration||this.vars.lazy&&!this._duration)&&(E[e._gsTweenID]=!0),o)},n.render=function(t,e,i){var s,r,n,a,o=this._time,h=this._duration,l=this._rawPrevTime;if(t>=h)this._totalTime=this._time=h,this.ratio=this._ease._calcEnd?this._ease.getRatio(1):1,this._reversed||(s=!0,r="onComplete"),0===h&&(this._initted||!this.vars.lazy||i)&&(this._startTime===this._timeline._duration&&(t=0),(0===t||0>l||l===_)&&l!==t&&(i=!0,l>_&&(r="onReverseComplete")),this._rawPrevTime=a=!e||t||l===t?t:_);else if(1e-7>t)this._totalTime=this._time=0,this.ratio=this._ease._calcEnd?this._ease.getRatio(0):0,(0!==o||0===h&&l>0&&l!==_)&&(r="onReverseComplete",s=this._reversed),0>t?(this._active=!1,0===h&&(this._initted||!this.vars.lazy||i)&&(l>=0&&(i=!0),this._rawPrevTime=a=!e||t||l===t?t:_)):this._initted||(i=!0);else if(this._totalTime=this._time=t,this._easeType){var u=t/h,p=this._easeType,c=this._easePower;(1===p||3===p&&u>=.5)&&(u=1-u),3===p&&(u*=2),1===c?u*=u:2===c?u*=u*u:3===c?u*=u*u*u:4===c&&(u*=u*u*u*u),this.ratio=1===p?1-u:2===p?u:.5>t/h?u/2:1-u/2}else this.ratio=this._ease.getRatio(t/h);if(this._time!==o||i){if(!this._initted){if(this._init(),!this._initted||this._gc)return;if(!i&&this._firstPT&&(this.vars.lazy!==!1&&this._duration||this.vars.lazy&&!this._duration))return this._time=this._totalTime=o,this._rawPrevTime=l,I.push(this),this._lazy=t,void 0;this._time&&!s?this.ratio=this._ease.getRatio(this._time/h):s&&this._ease._calcEnd&&(this.ratio=this._ease.getRatio(0===this._time?0:1))}for(this._lazy!==!1&&(this._lazy=!1),this._active||!this._paused&&this._time!==o&&t>=0&&(this._active=!0),0===o&&(this._startAt&&(t>=0?this._startAt.render(t,e,i):r||(r="_dummyGS")),this.vars.onStart&&(0!==this._time||0===h)&&(e||this.vars.onStart.apply(this.vars.onStartScope||this,this.vars.onStartParams||y))),n=this._firstPT;n;)n.f?n.t[n.p](n.c*this.ratio+n.s):n.t[n.p]=n.c*this.ratio+n.s,n=n._next;this._onUpdate&&(0>t&&this._startAt&&this._startTime&&this._startAt.render(t,e,i),e||(this._time!==o||s)&&this._onUpdate.apply(this.vars.onUpdateScope||this,this.vars.onUpdateParams||y)),r&&(!this._gc||i)&&(0>t&&this._startAt&&!this._onUpdate&&this._startTime&&this._startAt.render(t,e,i),s&&(this._timeline.autoRemoveChildren&&this._enabled(!1,!1),this._active=!1),!e&&this.vars[r]&&this.vars[r].apply(this.vars[r+"Scope"]||this,this.vars[r+"Params"]||y),0===h&&this._rawPrevTime===_&&a!==_&&(this._rawPrevTime=0))}},n._kill=function(t,e){if("all"===t&&(t=null),null==t&&(null==e||e===this.target))return this._lazy=!1,this._enabled(!1,!1);e="string"!=typeof e?e||this._targets||this.target:D.selector(e)||e;var i,s,r,n,a,o,h,l;if((c(e)||M(e))&&"number"!=typeof e[0])for(i=e.length;--i>-1;)this._kill(t,e[i])&&(o=!0);else{if(this._targets){for(i=this._targets.length;--i>-1;)if(e===this._targets[i]){a=this._propLookup[i]||{},this._overwrittenProps=this._overwrittenProps||[],s=this._overwrittenProps[i]=t?this._overwrittenProps[i]||{}:"all";break}}else{if(e!==this.target)return!1;a=this._propLookup,s=this._overwrittenProps=t?this._overwrittenProps||{}:"all"}if(a){h=t||a,l=t!==s&&"all"!==s&&t!==a&&("object"!=typeof t||!t._tempKill);for(r in h)(n=a[r])&&(n.pg&&n.t._kill(h)&&(o=!0),n.pg&&0!==n.t._overwriteProps.length||(n._prev?n._prev._next=n._next:n===this._firstPT&&(this._firstPT=n._next),n._next&&(n._next._prev=n._prev),n._next=n._prev=null),delete a[r]),l&&(s[r]=1);!this._firstPT&&this._initted&&this._enabled(!1,!1)}}return o},n.invalidate=function(){return this._notifyPluginsOfEnabled&&D._onPluginEvent("_onDisable",this),this._firstPT=null,this._overwrittenProps=null,this._onUpdate=null,this._startAt=null,this._initted=this._active=this._notifyPluginsOfEnabled=this._lazy=!1,this._propLookup=this._targets?{}:[],this},n._enabled=function(t,e){if(o||a.wake(),t&&this._gc){var i,s=this._targets;if(s)for(i=s.length;--i>-1;)this._siblings[i]=V(s[i],this,!0);else this._siblings=V(this.target,this,!0)}return A.prototype._enabled.call(this,t,e),this._notifyPluginsOfEnabled&&this._firstPT?D._onPluginEvent(t?"_onEnable":"_onDisable",this):!1},D.to=function(t,e,i){return new D(t,e,i)},D.from=function(t,e,i){return i.runBackwards=!0,i.immediateRender=0!=i.immediateRender,new D(t,e,i)},D.fromTo=function(t,e,i,s){return s.startAt=i,s.immediateRender=0!=s.immediateRender&&0!=i.immediateRender,new D(t,e,s)},D.delayedCall=function(t,e,i,s,r){return new D(e,0,{delay:t,onComplete:e,onCompleteParams:i,onCompleteScope:s,onReverseComplete:e,onReverseCompleteParams:i,onReverseCompleteScope:s,immediateRender:!1,useFrames:r,overwrite:0})},D.set=function(t,e){return new D(t,0,e)},D.getTweensOf=function(t,e){if(null==t)return[];t="string"!=typeof t?t:D.selector(t)||t;var i,s,r,n;if((c(t)||M(t))&&"number"!=typeof t[0]){for(i=t.length,s=[];--i>-1;)s=s.concat(D.getTweensOf(t[i],e));for(i=s.length;--i>-1;)for(n=s[i],r=i;--r>-1;)n===s[r]&&s.splice(i,1)}else for(s=V(t).concat(),i=s.length;--i>-1;)(s[i]._gc||e&&!s[i].isActive())&&s.splice(i,1);return s},D.killTweensOf=D.killDelayedCallsTo=function(t,e,i){"object"==typeof e&&(i=e,e=!1);for(var s=D.getTweensOf(t,e),r=s.length;--r>-1;)s[r]._kill(i,t)};var Q=g("plugins.TweenPlugin",function(t,e){this._overwriteProps=(t||"").split(","),this._propName=this._overwriteProps[0],this._priority=e||0,this._super=Q.prototype},!0);if(n=Q.prototype,Q.version="1.10.1",Q.API=2,n._firstPT=null,n._addTween=function(t,e,i,s,r,n){var a,o;
return null!=s&&(a="number"==typeof s||"="!==s.charAt(1)?Number(s)-i:parseInt(s.charAt(0)+"1",10)*Number(s.substr(2)))?(this._firstPT=o={_next:this._firstPT,t:t,p:e,s:i,c:a,f:"function"==typeof t[e],n:r||e,r:n},o._next&&(o._next._prev=o),o):void 0},n.setRatio=function(t){for(var e,i=this._firstPT,s=1e-6;i;)e=i.c*t+i.s,i.r?e=Math.round(e):s>e&&e>-s&&(e=0),i.f?i.t[i.p](e):i.t[i.p]=e,i=i._next},n._kill=function(t){var e,i=this._overwriteProps,s=this._firstPT;if(null!=t[this._propName])this._overwriteProps=[];else for(e=i.length;--e>-1;)null!=t[i[e]]&&i.splice(e,1);for(;s;)null!=t[s.n]&&(s._next&&(s._next._prev=s._prev),s._prev?(s._prev._next=s._next,s._prev=null):this._firstPT===s&&(this._firstPT=s._next)),s=s._next;return!1},n._roundProps=function(t,e){for(var i=this._firstPT;i;)(t[this._propName]||null!=i.n&&t[i.n.split(this._propName+"_").join("")])&&(i.r=e),i=i._next},D._onPluginEvent=function(t,e){var i,s,r,n,a,o=e._firstPT;if("_onInitAllProps"===t){for(;o;){for(a=o._next,s=r;s&&s.pr>o.pr;)s=s._next;(o._prev=s?s._prev:n)?o._prev._next=o:r=o,(o._next=s)?s._prev=o:n=o,o=a}o=e._firstPT=r}for(;o;)o.pg&&"function"==typeof o.t[t]&&o.t[t]()&&(i=!0),o=o._next;return i},Q.activate=function(t){for(var e=t.length;--e>-1;)t[e].API===Q.API&&(F[(new t[e])._propName]=t[e]);return!0},d.plugin=function(t){if(!(t&&t.propName&&t.init&&t.API))throw"illegal plugin definition.";var e,i=t.propName,s=t.priority||0,r=t.overwriteProps,n={init:"_onInitTween",set:"setRatio",kill:"_kill",round:"_roundProps",initAll:"_onInitAllProps"},a=g("plugins."+i.charAt(0).toUpperCase()+i.substr(1)+"Plugin",function(){Q.call(this,i,s),this._overwriteProps=r||[]},t.global===!0),o=a.prototype=new Q(i);o.constructor=a,a.API=t.API;for(e in n)"function"==typeof t[e]&&(o[n[e]]=t[e]);return a.version=t.version,Q.activate([a]),a},s=t._gsQueue){for(r=0;s.length>r;r++)s[r]();for(n in f)f[n].func||t.console.log("GSAP encountered missing dependency: com.greensock."+n)}o=!1}}("undefined"!=typeof module&&module.exports&&"undefined"!=typeof global?global:this||window,"TweenMax");
/* TAROT_UTILS.JS */
function compute_tarot(d){
	var r = {};
	r.cardw = d.size[0]; r.cardh = d.size[1];
	r.last_grid_data = { 'matrice': d.matrice };
	r.nb_cards = d.nb;
	r.nb_tirage = d.max;
	r.card_path = d.path;
	r.card_extension = d.extension;
	return r;
}

function extend(target, obj){
	var i, keys, ii;
  for (i = 0, keys = Object.keys(obj), ii = keys.length; i < ii; i++) {
		var key = keys[i];
		if (Object.prototype.hasOwnProperty.call(target, key) && obj[key] && typeof obj[key] === 'object') {
			if(Array.isArray(obj[key])) {
				target[key] = target[key] || [];
			} else {
				target[key] = target[key] || {};
			}
			target[key] = extend(target[key], obj[key]);
		} else {
			target[key] = obj[key];
		}
	}
	return target;
}

function getGrid(options, version){
	options = options || {};
	var def = { 'col': 1, 'row':1, 'height':1, 'width':1, 'origine':{'x':0, 'y':0}, 'matrice':null, 'halfzero': false };
	options = extend(def,options);
	
	options.row = Object.keys(options.matrice).length;
	options.col = options.matrice[0].length;
	
	var r = {}, 
      r2 = [], 
      c = 1, 
      i, j, jindex;
  
	for(i = 0; i < options.row; i++){
		r2.push([]);
		if(options.matrice!==null && parseInt(options.matrice[i])>0){
			var _matrice = options.matrice[i].split('');
      jindex = 0;
			for(j = 0; j < options.col; j++){
				if(options.matrice!==null && (parseInt(_matrice[j])>0)){
					if(r[parseInt(_matrice[j])] === undefined){
            var index = parseInt(_matrice[j]);
					} else {
            var index = parseInt(c);
          }
          r[index] = {'left':jindex*options.width + options.origine.x, 'top':i*options.height + options.origine.y};
					c++;
					r2[i].push(r[index]);
          jindex += 1;
				} else if(options.halfzero === true) {
          jindex += 0.5;
        } else {
          jindex += 1;
        }
			}
		}
	}
  
	// sorting
	var _s = []; for(i in r) { _s.push(parseInt(i)); _s.sort(function(a,b){ return a > b; });	}
	var _r = []; for(i in _s)	{ _r.push(r[_s[i]]); }

	if(version !== undefined && version === 1)
		return _r;
	else 
		return r2;
}

function getEcW(w,_w,nb){
	var _d = (w-(nb*_w)-_w)/nb;
	if(_d<0)
		return _w + _d;
	else 
		return _d;
}

function getPoX(i, card_width, width, nb_cards){
	return i* parseInt(getEcW(width, card_width, nb_cards), 10);
}

function getPoY(a, x, width, e){
	x = (x - (width/2)) + e;
	return (a*x*x);
}

function get_destination(matrice, grid, nb_sel_cards){
	return grid[nb_sel_cards];
}

function rand(min, max, doublon){
	var r = min -1;
	while(r<min || r>max){
		var _r = Math.random();
		r = Math.ceil(_r*10000)%max;
	}
	if(doublon){
		if(rand.prototype.doublons[r] !== undefined)
			return rand(min,max,doublon);
		else 
			rand.prototype.doublons[r] = r;
	} 
	return r;
}
rand.prototype.doublons = {};

function randbool(){
	return Math.random()>0.5;
}

function shuffleArray(array) {
  for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
  }
  return array;
}

function str_replace(search, replace, subject, count) {
  var i = 0,
    j = 0,
    temp = '',
    repl = '',
    sl = 0,
    fl = 0,
    f = [].concat(search),
    r = [].concat(replace),
    s = subject,
    ra = Object.prototype.toString.call(r) === '[object Array]',
    sa = Object.prototype.toString.call(s) === '[object Array]';
  s = [].concat(s);
  if (count) {
    this.window[count] = 0;
  }

  for (i = 0, sl = s.length; i < sl; i++) {
    if (s[i] === '') {
      continue;
    }
    for (j = 0, fl = f.length; j < fl; j++) {
      temp = s[i] + '';
      repl = ra ? (r[j] !== undefined ? r[j] : '') : r[0];
      s[i] = (temp)
        .split(f[j])
        .join(repl);
      if (count && s[i] !== temp) {
        this.window[count] += (temp.length - s[i].length) / f[j].length;
      }
    }
  }
  return sa ? s : s[0];
}

function applyLightSource(cont, el){
  var box_shadow = getLightSource(cont, el);
  $(el).css('box-shadow', box_shadow);
}

var _lightOrigin = {
  x : null,
  y: null
};

function getLightSource(cont, el){
  // compute the center of the page and the distance between the center and the mouse
  // coordinates
  var cx = Math.ceil(cont.width()  / 2),
      cy = Math.ceil(cont.height() / 2);
  
  if(_lightOrigin.x === null)
    _lightOrigin.x = cx;
    
  if(_lightOrigin.y === null)
    _lightOrigin.y = cy;
    
  var dx = _lightOrigin.x - $(el).position().left,
      dy = _lightOrigin.y - $(el).position().top; 
  
  // another parallax for the text shadow
  var sx = -dx * 0.05;
  var sy = -dy * 0.05;  
  
  // blur the shadow depending upon its distance
  var b = (Math.abs(sx) + Math.abs(sy)) * 0.8; 
  
  return 'rgba(0,0,0,0.25) '+ sx +'px '+ sy + 'px ' + b + 'px';
}

function getCircleCoordinate(d){
  var x0 = d.x0 || 0,
      y0 = d.y0 || 0,
      radius = d.radius || 0,
      angle = Math.PI * d.angle / 180;
      
  return { 'x' : parseInt(x0 + radius * Math.cos(angle)), 'y' : parseInt(y0 + ( radius * Math.sin(angle) )) };
}

function getCircleGrid(length, radius, center, start, cardWidth, cardHeight){
  var angle = 360 / length;
  var data = [];
  for(var i = 0; i < length; i++){
    var _angle = (i * angle) + start;
    var coordinates = getCircleCoordinate({'x0': center.x, 'y0': center.y, 'radius': radius, 'angle': _angle}); 
    var _top = (i*angle) > 90 && (i*angle) < 270 ? coordinates.y + parseInt(cardHeight)/3 : coordinates.y;
    _top = (i*angle) == 90 || (i*angle) == 270 ? coordinates.y + (parseInt(cardHeight)/3)/2 : _top;
    
    data.push({'left': coordinates.x /* - parseInt(cardWidth)/2 */, 'top': _top, 'rotate': (i * angle)});
  }
  return data;
}
/* TAROT.JS */
'use strict';

//Copyright (c) 2010 Nicholas C. Zakas. All rights reserved.
//MIT License
var EventTarget = function(){
    this._listeners = {};
};

EventTarget.prototype = {

  addListener: function(type, listener){
    if (this._listeners[type] === undefined){
      this._listeners[type] = [];
    }

    this._listeners[type].push(listener);
    return this;
  },

  fire: function(event, args){
    var i, len, listeners;
    if (typeof event === "string"){
      event = { type: event };
    }
    if (!event.target){
      event.target = this;
    }

    if (!event.type){  //falsy
      throw new Error("Event object missing 'type' property.");
    }

    if (this._listeners[event.type] instanceof Array){
      listeners = this._listeners[event.type];
      for ( i = 0, len = listeners.length; i < len; i++){
        listeners[i].call(this, event, args);
      }
    }
  },

  removeListener: function(type, listener){
    var i, len, listeners;
    if (this._listeners[type] instanceof Array){
      listeners = this._listeners[type];
      if(listeners.length === 1){
        delete this._listeners[type];
      } else {
        for (i = 0, len = listeners.length; i < len; i++){
          if (listeners[i] === listener){
            listeners.splice(i, 1);
            break;
          }
        }
      }
    } else if(typeof this._listeners[type] === 'function') {
      this._listeners[type] = null;
    }
    return this;
  }
};

var Deck = function Deck(d){

  this.Tarot = null;
  this.container = null;
  this.timeLines = [];
  this.nbCards = 0;
  this.width = 19;
  this.matrice = ['010','234','050'];
  this.matriceCircle = false;
  this.halfzeroMatrix = false;
  this.grid = null;
  this.dbData = {};
  this.cardPath = '';
  this.cardBack = '';
  this.scale = 1;
  this.state = false;
  this.shuffled = false;
  this.shuffledDeck = {};
  this.params = {
    'times': {
      'staggerInterval': 0.07,
      'center': 0.2,
      'regroup': 0.5,
      'longRegroup': 0.5,
      'spreadRegroup': 0.4,
      'spread': 0.1,
      'spreado': 0.01,
      'reverseSpreado': 0.01,
      'lightSpreado': 0.01,
      'roll': 0.1,
      'unfan': 0.5,
      'fanRegroup': 0.5,
      'fan': 0.02,
      'disperse': 0.1,
      'cut': 0.5,
      'moveContainer': 0.75,
      'highlight': 0.5,
      'flip': 1,
      'sendAway': 0.5,
      'delaySendAway': 0.5,
      'uniQ': 0.5,
      'niceSlide': 0.5,
      'niceFlip': 0.5,
      'sendToGrid': 0.5,
      'delaySendToGrid': 0.7,
      'shuffleOne': 0.5,
      'bigBang': 1
    },
    'position': {
      'display': {
        'top': 15,
        'y': 12,
        'cut': { 'left': 20, 'left2': 61, 'x': 20, 'x2': 400 },
        'left': { 'left': 20, 'x': 368 },
        'right': { 'left': 68, 'x': 368 },
        'middle': { 'left': 41, 'y': 130 },
        'light': { 'left': 68, 'x': 368 }
      },
      'center' : {
        'top': 50,
        'left': 40,
        'y': 130,
        'x': 213
      },
      'regroup' : {
        'left': 40,
        'rotation': '-=300'
      },
      'spread' : {
        'left': 10,
        'x': 20
      },
      'spreado' : {
        'left': 8,
        'x': 20
      },
      'reverseSpreado' : {
        'left': 92,
        'x': 20
      },
      'lightSpreado' : {
        'left': 8,
        'top': 5,
        'x': 20,
        'y': 100
      },
      'uniQ' : {
        'top1': 8,
        'top2': 21,
        'width': 35,
        'left': 41
      },
      'roll' : {
        'top': -15,
        'left': 90,
        'y': -30,
        'x': 465
      },
      'fan' : {
        'top': 10,
        'y': 10
      },
      'niceSlide' : {
        'top': 17,
        'y': 17,
        'x': 112
      },
      'bigBang' : {
        'y_small': -130,
        'y_big': -196
      }
    },
    'delay': {
      'center': 1,
      'regroup': 1
    },
    'spreadLength': 380,
    'fanStart': null,
    'fanAngle': 50,
    'fanOrigin': 200,
    'reCenterTop': 50,
    'fanHoverTop': 1,
    'fanHoverOrigin': 10,
    'hoverTop': 2,
    'shuffleZ': 100,
    'easing': Power2.easeIn,
    'getDisplayLightRotation': function(i){ return i; },
    'height': 499
  };
  
  this.cardHtml = '<img src="[SRC]" class="card [CLASS]" id="[ID]" width="[WIDTH]" >';
  
  this.load(d)
      ._init();
  
  this.card.parent = this;
 
  return this;
};

Deck.prototype = {

  constructor: Deck,
  
  load: function(d){
    var i;
    for(i in d){
      if(this[i] !== undefined){
        this[i] = d[i];
      }
    }
    
    this.Tarot.Event.fire('Deck:load');
    return this;
  },
  
  _init: function(){
    this.timeLines.push(new TimelineMax());
    this.timeLines.push(new TimelineMax());
    
    var parent = this.Tarot.container;
    parent.append($('<div id="drawing"></div>'));
    this.container = $('#drawing', parent);
    var cssData = { 'position':'absolute', 
                    'display':'block', 
                    'z-index':0, 
                    'top':0, 
                    'left':0 };
    this.container.css($.extend(true, this.Tarot.sizes.container, cssData));
    
    this.Tarot.Event.fire('Deck:_init');
    
    if(Object.keys(this.dbData).length == 0 && tarotData){
      this.dbData = tarotData;
    }

    return this;
  },
  
  setParams: function(params){
    this.params = $.extend(true, this.params, params);
    return this;
  },
  
  buildCards: function(){
    var cardWidth = this.width + '%';
    var src = this.cardPath+this.cardBack;
    var i;
    
    for(i = 0; i < this.nbCards; i++){
      var _class = 'cardmod' + (i%2 === 0 ? '0' : '1');//+' drop-shadow raised';
      var _id = 'card_' + (i+1);
      var _h = str_replace( ['[SRC]', '[CLASS]', '[ID]', '[WIDTH]'],
                            [src, _class, _id, cardWidth],
                            this.cardHtml );
      this.container.append($(_h));
    }
    
    this.Tarot.Event.fire('Deck:buildCards');
    return this;
  },
  
  getNotDraughtCards: function(mod, reverse){
    var c;
    if(mod !== undefined && mod !== true){
      c = $('.card.cardmod'+mod, this.container).not('.draught').toArray();
      if(reverse !== undefined && reverse === true){
        c = c.reverse();
      }
    } else {
      c = $('.card', this.container).not('.draught').toArray();
      if(mod !== undefined && mod === true){
        c = c.reverse();
      }
    }
    return c;
  },
  
  getCards: function(mod, reverse){
    var c,
        key;
    
    if(mod !== undefined && mod !== true){
      key = mod  + ':' + (reverse ? 'true' : 'false');
      c = $('.card.cardmod'+mod, this.container).toArray();
      if(reverse !== undefined && reverse === true){
        c = c.reverse();
      }
    } else {
      key = (mod ? 'trutte' : 'fattlse');
      c = $('.card', this.container).toArray();
      if(mod !== undefined && mod === true){
        c = c.reverse();
      }
    }
    
    if(this.shuffled === true && this.shuffledDeck[key] === undefined){
      // shuffle(c);
      c = shuffleArray(c);
      this.shuffledDeck[key] = c;
      return this.shuffledDeck[key].slice(0);
    } else if(this.shuffled === true && this.shuffledDeck[key].length > 0){
      return this.shuffledDeck[key].slice(0);
    }
    return c;
  },
  
  moveContainerToStep: function(force){
    var that = this;
  
    force = force || false;
    var step = this.Tarot.step.current;

    if (!step || ($(step).hasClass('deck-no-follow') && force === false)){
      return;
    }

      //noinspection UnterminatedStatementJS
      var style = $(step)[0].style[this.Tarot.transformProp],
        translate = style.match(/translate3d\(([0-9\.%a-z\,\s\-]*)\)/)[1].split(', '),
        x = parseFloat(translate[0].replace(/[%px]+/, '')),
        y = parseFloat(translate[1].replace(/[%px]+/, '')),
        z = parseFloat(translate[2].replace(/[%px]+/, '')),
        width = $(step).outerWidth(),
        fullWidth = that.container.parent().outerWidth(),
        diffWidthPx = width * (1 - this.scale),
        diffWidthPur = parseFloat(( diffWidthPx * 100 ) / fullWidth),
        height = this.container.parents('#layout_full_page').length > 0 ? $(step).height() : this.params.height,
        fullHeight = that.container.parent().outerHeight(),
        diffHeightPx = height * (1 - this.scale),
        diffHeightPur = parseFloat(( diffHeightPx * 100 ) / fullHeight) * -1,
        css = {
          position: "absolute",
          transformStyle: "preserve-3d",
          width: $(step).width()+'px',
          height: height+'px',
          transition: that.params.times.moveContainer > 0 ? 'all '+that.params.times.moveContainer+'s ease-in-out' : 'none'
        }
      
      
    if(this.scale == 1){
        css.transform = $(step)[0].style[this.Tarot.transformProp].replace(/scale\([0-9\.]*\)/, '');
    } else if(that.container.parents('#layout_full_page').length > 0){
      css.top = 0;
      css.transform = 'scale('+this.scale+') '+ $(step)[0].style[this.Tarot.transformProp].replace(/scale\([0-9\.]*\)/, '')
                                                          .replace(/translate3d\(([0-9\.%a-z\,\s\-]*)\)/, 'translate3d('+(x+diffWidthPur)+'%, '+(y+diffHeightPur)+'%, '+ z+')');
      if(x === 0){
        css.left = (diffWidthPur/2) * -1 + '%';
        css.transform = 'scale('+this.scale+') '+ $(step)[0].style[this.Tarot.transformProp].replace(/scale\([0-9\.]*\)/, '')
                                                          .replace(/translate3d\(([0-9\.%a-z\,\s\-]*)\)/, 'translate3d('+(x)+'%, '+(y+diffHeightPur)+'%, '+ z+')');
      }
    } else {
      css.top = (diffHeightPur/2) + '%';
      css.transform = 'scale('+this.scale+') '+$(step)[0].style[this.Tarot.transformProp].replace(/scale\([0-9\.]*\)/, '')
                                                         .replace(/translate3d\(([0-9\.%a-z\,\s\-]*)\)/, 'translate3d('+(x+diffWidthPur)+'%, '+(y)+'%, '+ z+')');
      if(x === 0){
        css.left = (diffWidthPur/2) * -1 + '%';
        css.transform = 'scale('+this.scale+') '+ $(step)[0].style[this.Tarot.transformProp].replace(/scale\([0-9\.]*\)/, '')
                                                          .replace(/translate3d\(([0-9\.%a-z\,\s\-]*)\)/, 'translate3d('+(x)+'%, '+(y)+'%, '+ z+')');
      }
    }
    
    helpers.css(that.container[0], css);
    
    return this;
  },
  
  resizeContainer: function(){
    var tween,
        that = this,
        height = this.container.parents('#layout_full_page').length > 0 ? $(step).height() : 499,
        step = this.Tarot.step.current;

    if (!step || ($(step).hasClass('deck-no-follow'))){
      return;
    }
    
    tween = {
      ease: Power4.easeInOut,
      width: $(step).width(),
      height: height,
      onComplete: function(){
        that.Tarot.Event.fire('Deck:resizeContainer');
      }
    };
    
    TweenMax.to(this.container, this.params.times.moveContainer, tween);
    
    return this;
  },
  
  zoomByWidth: function(ratio){
    var tween,
        that = this,
        step = this.Tarot.step.current,
        match = $(this.container)[0].style[this.Tarot.transformProp].match(/translate3d\(([0-9\.]*)%/),
        translateX = match && match.length == 2 ? match[1] : 0;
        
    tween = {
      // ease: Power4.easeInOut,
      width: $(step).width() * ratio,
      x: '-=' + ((($(step).width() * (translateX / 100) ) * 100 ) / $(step).width() * ratio),
      height: $(step).height(),
      onComplete: function(){
        that.Tarot.Event.fire('Deck:resizeContainer');
      }
    };
    
    TweenMax.to(this.container, this.params.times.moveContainer, tween);
    
    return this;
  },
  
  zoom: function(scale){
    var that = this,
        step = this.Tarot.step.current,
        style = that.container[0].style[this.Tarot.transformProp],
        translate = style.match(/translate3d\(([0-9\.%a-z\,\s]*)\)/)[1].split(', '),
        x = parseFloat(translate[0].replace(/[%px]+/, '')),
        y = parseFloat(translate[1].replace(/[%px]+/, '')),
        z = parseFloat(translate[2].replace(/[%px]+/, '')),
        width = $(that.container[0]).outerWidth(),
        fullWidth = $(that.container[0]).parent().outerWidth(),
        diffWidthPx = width * (1 - scale),
        diffWidthPur = parseFloat(( diffWidthPx * 100 ) / fullWidth),
        height = $(that.container[0]).outerHeight(),
        fullHeight = $(that.container[0]).parent().outerHeight(),
        diffHeightPx = height * (1 - scale),
        diffHeightPur = parseFloat(( diffHeightPx * 100 ) / fullHeight) * -1;


    helpers.css(that.container[0], {
            transform: 'scale('+scale+') '+that.container[0].style[this.Tarot.transformProp].replace(/translate3d\(([0-9\.%a-z\,\s]*)\)/, 'translate3d('+(x+diffWidthPur)+'%, '+(y+diffHeightPur)+'%, '+ z+')')
        });
    
    return this;
  },
  
  centerGrid: function(origin, timeline){
    var i;
    this.grid = null;
    origin = origin || { x : 0, y : 0};
    timeline = timeline || false;
    for(i = 0; i < this.Tarot.draughtCards.length; i++){
      this.card.sendToGrid(this.Tarot.draughtCards[i], i, origin.x, origin.y, timeline);
      this.Tarot.Event.fire('Card:recenterGrid', [$(this.Tarot.draughtCards[i]).attr('id'), i]);
    }
    
    return this;
  },
  
  bringContainerToFront: function(zindex){
    zindex = zindex === undefined ? 100 : zindex;
    this.container.css('z-index', zindex);
    return this;
  },
  
  bringContainerBack: function(){
    this.container.css('z-index', 0);
    return this;
  },
  
  display: function(type){
    type = type || 'cut';
    var left, i, _index, tween, rand, x, 
        y = this.params.position.display.y + '%',
        top = this.params.position.display.top + '%',
        cards = this.getNotDraughtCards();
    
    if(type === 'cut'){
      var left2 = this.params.position.display.cut.left2 + '%' || '61%';
      left = this.params.position.display.cut.left + '%' || '20%';
      
      for(i = 0; i < cards.length; i++){
        var timeLineIndex = (i%2 === 0) ? 0 : 1;
        tween = { 
          'zIndex': i, 
          'top': top, 
          'left': (i%2 === 0) ? left : left2, 
          'rotation': (i%2 === 0) ? (-1 * i + 10) : (i - 10), 
          'transformOrigin': ((i%2 === 0) ? 'right' : 'left') + ' bottom'
        };
        this.timeLines[timeLineIndex].set(cards[i], tween);
      } 
    } else if(type === 'left'){
      x = this.params.position.display.left.x + '%' || '20%';
      
      for(i = 0; i < cards.length; i++){
        tween = {
          'zIndex': i,
          'y': y,
          'x': x,
          'rotation': (-1 * (i/2) + 10),
          'transformOrigin': 'right bottom'
        };
        this.timeLines[0].set(cards[i], tween);
      }
    } else if(type === 'right'){
      x = this.params.position.display.right.x + '%' || '68%';
      
      for(i = 0; i < cards.length; i++){
        tween = {
          'zIndex': i,
          'y': y,
          'x': x,
          'rotation': i / 2 + 10,
          'transformOrigin': 'left bottom'
        };
        this.timeLines[0].set(cards[i], tween);
      }  
    } else if(type === 'middle'){
      var cardWidth = this.container.width() * (this.width / 100);     
      x = (((this.container.width()/2) - cardWidth/2) /  cardWidth) * 100;
      y = this.params.position.display.middle.y;
      
      for(i = 0; i < cards.length; i++){
        rand = (Math.floor(Math.random() * 10) / 10) * -1;
        tween = {
          'zIndex': i,
          'x': x+'%',
          'y': y+'%'
        };
        this.timeLines[0].set(cards[i], tween);
      }  
    } else if(type === 'light'){
      x = this.params.position.display.light.x + '%' || '40%';
      for(i = 0; i < cards.length; i++){
        // rand = (Math.floor(Math.random() * 10) / 10) * -1;
        tween = {
          'zIndex': i,
          'y': y,
          'x': x,
          'rotation': this.params.getDisplayLightRotation(i),
          'transformOrigin': 'right bottom'
        };
        this.timeLines[0].set(cards[i], tween);
      }  
    }
    
    this.state = 'display:'+type;
    
    return this;
  },
  
  center: function(rotate){
    var that = this,
        cards = this.getNotDraughtCards(),
        index = 0,
        _centerComplete = function _centerComplete(){
          index++;
          if(index < cards.length){
            return;
          }
          that.state = 'center';
          that.Tarot.Event.fire('Deck:center');
        },
        tween = { 
          x: this.params.position.center.x + '%', 
          y: this.params.position.center.y + '%', 
          delay: this.params.delay.center, 
          z: 2,
          onComplete: _centerComplete,
          onUpdate: this.applyLightSourceOnUpdate
        };
        
    rotate = rotate === undefined ? true : rotate;
    if(rotate === true){
      tween.rotation = '0_short';
    }
    
    var _times = this.params.times;
    this.timeLines[0].staggerTo( cards, _times.center, tween, _times.staggerInterval);
    
    return this;
  },
  
  regroup: function(){
    var that = this,
        tween,
        _times = this.params.time,
        cards1 = this.getCards(0, true),
        cards2 = this.getCards(1, true);
    
    tween = {
      left: this.params.position.regroup.left + '%', 
      delay: this.params.delay.regroup,
      onUpdate: this.applyLightSourceOnUpdate    
    };
    this.timeLines[0].staggerTo(cards1, _times.regroup, tween, _times.staggerInterval);
                                
    tween = {
      left: this.params.position.regroup.left + '%', 
      delay: this.params.delay.regroup,
      onUpdate: this.applyLightSourceOnUpdate 
    };
    this.timeLines[1].staggerTo(cards2, _times.regroup, tween, _times.staggerInterval);

    tween = {
      rotation:'0_short',
      onUpdate: this.applyLightSourceOnUpdate
    };
    this.timeLines[0].staggerTo(cards1, _times.regroup, tween, _times.staggerInterval);
                                
    var index = 0;
    tween.onComplete = function _regroupComplete(){
      index++;
      if(index < cards2.length){
        return;
      }
      that.state = 'regroup';
      that.Tarot.Event.fire('Deck:regroup');
    };
    this.timeLines[1].staggerTo(cards2, _times.regroup, tween, _times.staggerInterval);
    
    return this;
  },
  
  regroupRotate: function(){
    var that = this,
        tween,
        _times = this.params.times,
        cards1 = this.getCards(0, true),
        cards2 = this.getCards(1, true);
    
    tween = {
      rotation: this.params.position.regroup.rotation, 
      delay: this.params.delay.regroup
    };
    this.timeLines[0].staggerTo(cards1, _times.regroup, tween, _times.staggerInterval);
    this.timeLines[1].staggerTo(cards2, _times.regroup, tween, _times.staggerInterval);
                                

    tween = {
      rotation:'0_short',
      left: this.params.position.regroup.left + '%'
    };
    this.timeLines[0].staggerTo(cards1, _times.regroup, tween, _times.staggerInterval);
                                
    var index = 0;
    tween.onComplete = function _regroupComplete(){
      index++;
      if(index < cards2.length){
        return;
      }
      that.state = 'regroup';
      that.Tarot.Event.fire('Deck:regroup');
    };
    this.timeLines[1].staggerTo(cards2, _times.regroup, tween, _times.staggerInterval);
    
    return this;
  },
  
  spread: function(){
    var that = this,
        i,
        tween,
        _times = this.params.times,
        cards = this.getCards(true),
        baseX = this.params.position.spread.x;
        
    tween = {
      rotation:'0_short', 
      x: baseX + '%',
      zIndex: this.nbCards
    };
    this.timeLines[0].to( cards, _times.spreadRegroup, tween);
    
    var _spreadComplete = function _spreadComplete(){
      that.state = 'spread';
      that.Tarot.Event.fire('Deck:spread');
    };                
    for(i = 0; i < this.nbCards; i++){
      // baseX = baseX + (this.params.spreadLength/(this.nbCards/2));
      x = baseX + ((this.nbCards - i) * (this.params.spreadLength/this.nbCards));
      tween = { 
        // left: '+=' + ((this.nbCards - i) * (this.params.spreadLength/this.nbCards)) + '%', 
        x: x + '%', 
        zIndex: i,
        onUpdate: this.applyLightSourceOnUpdate
      };
      
      if(i === this.nbCards - 1){
        tween.onComplete = _spreadComplete;
      }
      this.timeLines[0].to($(cards[i]), _times.spread, tween);
    }
    
    return this;
  },
  
  spreado: function(c){
    var that = this,
        i,
        tween,
        _times = this.params.times,
        cards = this.getCards(true),
        baseX = this.params.position.spreado.x;
        
    c = c != undefined ? ':'+c : '';
    
    tween = {
      rotation:'0_short', 
      x: baseX + '%'
    };
    this.timeLines[0].to( cards, _times.spreadRegroup, tween);
    
    var _spreadComplete = function _spreadComplete(){
      that.state = 'spreado';
      that.Tarot.Event.fire('Deck:spreado'+c);
    };                
    for(i = 0; i < this.nbCards; i++){
      baseX = baseX + (this.params.spreadLength/this.nbCards);
      tween = { 
        x: baseX + '%',
        zIndex: i
      };
      
      if(i === this.nbCards - 1){
        tween.onComplete = _spreadComplete;
      }
      this.timeLines[0].to(cards, _times.spreado, tween);
      cards.shift();
    }
    
    return this;
  },
  
  reverseSpreado: function(){
    var that = this,
        i,
        tween,
        _times = this.params.times,
        cards = this.getCards(true),
        baseX = this.params.position.reverseSpreado.x;
        
    tween = {
      rotation:'0_short', 
      x: baseX + '%'
    };
    this.timeLines[0].to( cards, _times.spreadRegroup, tween);
    
    var _spreadComplete = function _spreadComplete(){
      that.state = 'spreado';
      that.Tarot.Event.fire('Deck:reverseSpreado');
    };                
    for(i = 0; i < this.nbCards; i++){
      baseX = baseX + (this.params.spreadLength/this.nbCards);
      tween = { 
        x: baseX + '%',
        zIndex: i+200
      };

      if(i === this.nbCards - 1){
        tween.onComplete = _spreadComplete;
      }
      this.timeLines[0].to(cards, _times.reverseSpreado, tween);
      cards.shift();
    }
    
    return this;
  },
  
  lightSpreado: function(isRand){
    var that = this,
        i,
        tween,
        _times = this.params.times,
        cards = this.getCards(true),
        baseX = this.params.position.lightSpreado.x;
        
    isRand = isRand === undefined ? true : isRand;
    tween = {
      rotation:'0_short', 
      // left:this.params.position.lightSpreado.left + '%',
      // top:this.params.position.lightSpreado.top + '%'
      y: this.params.position.lightSpreado.y + '%',
      x: baseX + '%'
    };
    this.timeLines[0].to( cards, _times.spreadRegroup, tween);
    
    var _spreadComplete = function _spreadComplete(){
      that.state = 'lightSpreado';
      that.Tarot.Event.fire('Deck:lightSpreado');
    };                
    for(i = 0; i < this.nbCards; i++){
      baseX = baseX + (this.params.spreadLength/(this.nbCards/2));
      tween = { 
        x: baseX + '%',
        zIndex: i
      };
      
      if(isRand === true){
        var rand = Math.floor(Math.random() * 10);
        tween.rotation = rand%2 == 0 ? '-' + rand : rand;
      }
      
      if(i === this.nbCards - 1){
        tween.onComplete = _spreadComplete;
      }
      this.timeLines[0].to(cards, _times.lightSpreado, tween);
      cards.shift();
      cards.shift();
    }
    
    return this;
  },
  
  roll: function(way, angle){
    var left, i, _index, tween,
        that = this,
        way = way || -1,
        angle = angle || 180,
        y = this.params.position.roll.y + '%',
        _times = this.params.times,
        cards = this.getNotDraughtCards();
        
    x = this.params.position.roll.x + '%' || '75%';
    
    var _rollComplete = function _rollComplete(){
      that.state = 'roll';
      that.Tarot.Event.fire('Deck:roll');
    };                
    for(i = 0; i < cards.length; i++){
      tween = {
        'zIndex': i,
        'y': y,
        'x': x,
        'rotation': way * i * (angle / (cards.length - 1)),
        'transformOrigin': 'center center'
      };
      if(i === cards.length - 1){
        tween.onComplete = _rollComplete;
      }
      this.timeLines[0].to(cards[i], _times.roll, tween);
    }  
    
    return this;
  },
  
  bigBang: function(radius, rotation){
      //noinspection UnterminatedStatementJS
      var tween, i, alpha, beta = Math.PI * -90 / 180, _y
        that = this,
        _times = this.params.times,
        _positions = this.params.position,
        radius = radius || 200,
        rotation = rotation || 10800,
        cards = this.getNotDraughtCards();
    
    alpha = 360 / cards.length;
    alpha = Math.PI * alpha / 180;
    
    var _bigBangComplete = function _bigBangComplete(){
    
      // Wrap
      that.container.append($('<div id="er" style="position: relative; top: 0px; left: 0px; width: 100%; height: 100%;"></div>'));
      for(i = 0; i < cards.length; i++){
        $(cards[i]).detach().appendTo($('#er'));
      }
      
      // Rotate
      tween = {
        rotation: rotation, 
        ease: Power3.easeInOut,
        onComplete: function(){
          that.state = 'bigbanged';
          that.Tarot.Event.fire('Deck:bigBang'); 
        }
      };
      TweenMax.to( $('#er'), 3, tween);
    };                


    if(this.container.parents('#layout_full_page').length > 0){
      _y = _positions.bigBang.y_big;
    } else {
      _y = _positions.bigBang.y_small;
    }
    
    // Center
    tween = {
      y: _y,
      onComplete: function(){
        // Explode
        for(i = 0; i < cards.length; i++){
          
          x = radius * Math.cos(beta);
          y = _y + ( radius * Math.sin(beta) );
          tween = {
            'y': y,
            'x': x,
            'ease': Expo.easeIn
          };

          if(i === cards.length - 1){
            tween.onComplete = _bigBangComplete;
          }
          TweenMax.to(cards[i], _times.bigBang, tween);
          beta += alpha;
        }  
      }
    };
    TweenMax.to( cards, 0.5, tween);
    
    return this;
  },
  
  applyLightSourceOnUpdate: function(){
    return;
  },
  
  getFanRotation: function(length){
    var _fanStart = this.params.fanStart === null ? this.params.fanAngle : this.params.fanStart;
    return _fanStart - ( (this.nbCards - length) * ((this.params.fanAngle * 2)/(this.nbCards - 1)) );
  },
  
  snail: function(){
    var that = this,
        i,
        tween,
        _times = this.params.times,
        _fanStart = this.params.fanStart === null ? this.params.fanAngle : this.params.fanStart,
        cards = this.getCards(true);
        
    tween = {
      rotation: '0_short'
    };
    TweenMax.set(cards, tween);
    
    tween = {
      rotation: _fanStart, 
      top: this.params.position.fan.top + '%', 
      transformOrigin: 'center '+this.params.fanOrigin + '%'
    };
    this.timeLines[0].staggerTo(cards, _times.fanRegroup, tween, _times.staggerInterval);
                                  
    var _fanComplete = function _fanComplete(){
      that.state = 'snail';
      that.Tarot.Event.fire('Deck:snail');
    };    
    
    for(i = 0; i < this.nbCards; i++){
      tween = { 
        rotation: this.getFanRotation(cards.length),
        transformOrigin: 'center '+(this.params.fanOrigin + i*3) + '%',
        zIndex: i,
        onUpdate: this.applyLightSourceOnUpdate
      };

      if(i === this.nbCards - 1){
        tween.onComplete = _fanComplete;
      }
        
      this.timeLines[0].to(cards, _times.fan, tween);
      if(this.params.fanOrigin < 0){
        cards.pop();
      } else {
        cards.shift();
      }
    }
    
    return this;
  },
  
  fan: function(){
    var that = this,
        i,
        tween,
        _times = this.params.times,
        _fanStart = this.params.fanStart === null ? this.params.fanAngle : this.params.fanStart,
        cards = this.getCards(true);
        
    tween = {
      rotation: '0_short'
    };
    TweenMax.set(cards, tween);
    
    tween = {
      rotation: _fanStart, 
      // top: this.params.position.fan.top + '%', 
      y: this.params.position.fan.y + '%', 
      transformOrigin: 'center '+this.params.fanOrigin + '%'
    };
    this.timeLines[0].staggerTo(cards, _times.fanRegroup, tween, _times.staggerInterval);
                                  
    var _fanComplete = function _fanComplete(){
      that.state = 'fan';
      that.Tarot.Event.fire('Deck:fan');
    };    
    
    for(i = 0; i < this.nbCards; i++){
      tween = { 
        rotation: this.getFanRotation(cards.length),
        onUpdate: this.applyLightSourceOnUpdate
      };

      if(i === this.nbCards - 1){
        tween.onComplete = _fanComplete;
      }
        
      this.timeLines[0].to(cards, _times.fan, tween);
      if(this.params.fanOrigin < 0){
        cards.shift();
      } else {
        cards.pop();
      }
    }
    
    return this;
  },
  
  unfan: function(direction){
    var that = this,
        i,
        tween = {
          rotation: '0_short',
          onComplete: function(){
            that.state = 'unfan';
            that.Tarot.Event.fire('Deck:unfan');
          }
        },
        _times = this.params.times,
        cards = this.getNotDraughtCards();
        
    this.timeLines[0].staggerTo(cards, _times.unfan, tween, _times.staggerInterval);
    
    return this;
  },
  
  disperse: function(){
    var that = this,
        i,
        tween,
        _times = this.params.times,
        cards = this.getCards(),
        _height = ($(cards[0]).height() * this.width) / $(cards[0]).width();
    
    var _disperseComplete = function _disperseComplete(){
      that.state = 'disperse';
      that.Tarot.Event.fire('Deck:disperse');
    };
    
    for(i = 0; i < this.nbCards; i++){
      tween = { 
        top: rand(1, this.Tarot.sizes.container.height - _height, true),
        left: rand(1, this.Tarot.sizes.container.width - this.width, true),
        onUpdate: this.applyLightSourceOnUpdate
      };
      if(i === this.nbCards - 1){
        tween.onComplete = _disperseComplete;
      }
      
      this.timeLines[0].to(cards[i], _times.disperse, tween);
    }
    
    return this;
  },
  
  shuffleOne: function(){
    this.shuffled = true;
    var that = this,
        i,
        z = this.params.shuffleZ,
        y = this.params.position.display.y,
        x = this.params.position.display.cut.x || '20',
        x2 = this.params.position.display.cut.x2 || '400',
        cards = this.getCards(),
        tween,
        _times = this.params.times,
        cards1 = this.getCards(0, true),
        cards2 = this.getCards(1, true);
        
    tween = { 
      'x': x+'%',
      'y': y+'%',
      'rotation': '0_short'
    };
    this.timeLines[0].staggerTo(cards1, 0.5, tween, _times.staggerInterval);

    tween = { 
      'x': x2+'%',
      'y': y+'%',
      'rotation': '0_short'
    };
    this.timeLines[1].staggerTo(cards2, 0.5, tween, _times.staggerInterval);
    
    tween = { 
      'z': '+='+z,
      'scale': 2,
      'transformOrigin': 'center center'
    };
    this.timeLines[0].staggerTo(cards1, 0.5, tween, _times.staggerInterval);

    tween = { 
      'z': '+='+z,
      'scale': 2,
      'transformOrigin': 'center center'
    };
    this.timeLines[1].staggerTo(cards2, 0.5, tween, _times.staggerInterval);

    tween = { 
      'z': '-='+z,
      'scale': 1,
      'x': this.params.position.center.x +'%',
      'y': this.params.position.center.y +'%'
    };
    this.timeLines[0].staggerTo(cards1, _times.shuffleOne, tween, 0.1);
    tween = { 
      'z': '-='+z,
      'scale': 1,
      'x': this.params.position.center.x +'%',
      'y': this.params.position.center.y +'%'
    };
    var index = 0;
    tween.onComplete = function _shuffleOneComplete(){
      index++;
      if(index < cards2.length){
        return;
      }
      that.state = 'regroup';
      that.Tarot.Event.fire('Deck:shuffleOne');
    };
    this.timeLines[1].staggerTo(cards2, _times.shuffleOne, tween, 0.1);
  },
  
  cut: function(jqCard){
    var that = this,
        index,
        d,
        tween,
        _times = this.params.times,
        cards = this.getCards(true),
        cardId = cards.indexOf(jqCard[0]),
        farX = $(cards[cards.length-1]).attr('style').match(/translate\(([0-9]*\.?[0-9]*?)\%\,\s?[0-9]*\.?[0-9]*?\%/)[1],
        closeX = $(cards[0]).attr('style').match(/translate\(([0-9]*\.?[0-9]*?)\%\,\s?[0-9]*\.?[0-9]*?\%/)[1],
        cards1 = cards.slice(0, cardId+1),
        cards2 = cards.slice(cardId + 1, cards.length);
    
    if(cards1.length > 0){
      tween = {
        x: closeX + '%', 
        onUpdate: this.applyLightSourceOnUpdate
      };
      this.timeLines[0].staggerTo(cards1, _times.cut, tween, _times.staggerInterval);
      
      tween = {
        x: this.params.position.center.x + '%', 
        // y: (this.params.position.center.y - 1) + '%', 
        onUpdate: this.applyLightSourceOnUpdate
      };
      if(cards2.length === 0){
        index = 0;
        tween.onComplete = function(){
          index++;
          if(index === cards1.length){
            that.Tarot.Event.fire('Deck:cut');
          }
        };
      } else {
        tween.z = '+=' + this.nbCards/100;
        tween.zIndex = '+=' + this.nbCards;
      } 
      this.timeLines[0].staggerTo(cards1, _times.cut, tween, _times.staggerInterval);
      
      tween = {
        // y: (this.params.position.center.y + 1) + '%', 
        onUpdate: this.applyLightSourceOnUpdate
      };
      if(cards2.length > 0){
        tween.z = '-=' + this.nbCards/100;
        tween.zIndex = '-=' + this.nbCards;
      }
      this.timeLines[0].staggerTo(cards1, _times.cut, tween, _times.staggerInterval);
    }
    
    if(cards2.length > 0){
      tween = {
        x: farX + '%', 
        
        onUpdate: this.applyLightSourceOnUpdate
      };
      this.timeLines[1].staggerTo(cards2, _times.cut, tween, _times.staggerInterval);
      
      tween = {
        x: this.params.position.center.x + '%', 
        scale: 0.99,
        onUpdate: this.applyLightSourceOnUpdate
      };
      if(cards1.length > 0){
        tween.z = '-=' + this.nbCards/100;
        tween.zIndex = '-=' + this.nbCards;
      }
      this.timeLines[1].staggerTo(cards2, _times.cut, tween, _times.staggerInterval);
      
      index = 0;
      tween = { 
        scale: 1,
        onComplete: function(){
          index++;
          if(index === cards2.length){
            that.Tarot.Event.fire('Deck:cut');
          }
        }, 
        onUpdate: this.applyLightSourceOnUpdate
      };
      if(cards1.length > 0){
        tween.z = '+=' + this.nbCards/100;
        tween.zIndex = '+=' + this.nbCards;
      }
      this.timeLines[1].staggerTo(cards2, _times.cut, tween, _times.staggerInterval);
    }
    
    return this;
  },
  
  applyHoverAndClick: function(eventClass, cards){
    var that = this,
        i,
        tween,
        cards = cards || this.getCards(true),
        
        _hover = function(type, card){
          var tween, 
              y = card.data('y');
              
          if(type === 'enter'){
            y -= that.params.fanHoverTop;
          }
          
          tween = { 
            y: y + '%'
          };

          if(that.state === 'fan'){
            if(type === 'enter'){
              tween.transformOrigin = 'center '+(that.params.fanOrigin + that.params.fanHoverTop) + '%';
            } else {
              tween.transformOrigin = 'center ' + that.params.fanOrigin + '%';
            }
          }
          // console.log(card, tween);
          TweenMax.set(card,tween);
        },
        
        _enter = function(){
          _hover('enter', $(this));
        },
        
        _leave = function(){
          _hover('leave', $(this));
        },
        
        _click = function(e){
          e.preventDefault();
          $(this).trigger('mouseleave');
          that.card.onClick(e, eventClass);
        };
    
    for(i = 0; i < cards.length; i++){
      var el = cards[i];
      
      tween = { 
        z: i/100 
      };
      TweenMax.set($(el), tween);
      
      var y = $(el).attr('style').match(/translate\([0-9]*\.?[0-9]*?\%\,\s?([0-9]*\.?[0-9]*?)\%/)[1];
      $(el).data('y', y);
      
      $(el).unbind('mouseleave.deck').unbind('mouseenter.deck').unbind('click.deck')
           .bind('mouseenter.deck', _enter).bind('mouseleave.deck', _leave).bind('click.deck', _click);
    }
    
    return this;
  },
  
  removeCardsEvents: function(cards){
    var cards = cards || this.getCards();
    $(cards).each(function(){
      $(this).trigger('mouseleave.deck').unbind('mouseleave.deck').unbind('mouseenter.deck').unbind('click.deck');
    });
    return this;
  },
    
  handleLastCard: function(){
    var that = this,
        _cards = $('.card:not(.draught)', this.container).toArray(),
        cardId = rand(0, _cards.length - 1, true);
    this.Tarot.draughtCards.push(_cards[cardId]);
    $(_cards[cardId]).css('z-index',10);
    this.card.sendToGrid(_cards[cardId]);
    this.Tarot.on('Card:sendToGrid', function(){
      that.Tarot.unbind('Card:sendToGrid');
      that.Tarot.Event.fire('Deck:handleLastCard', [cardId]);
    });
  },
  
  resetCards: function(){
    var that = this,
        i,
        cards = this.getCards();
    for(i = 0; i < cards.length; i++){
      $(cards[i]).removeClass('draught');
      if($(cards[i]).hasClass('flipped')){
        $(cards[i]).attr('src', this.cardPath + this.cardBack).removeClass('flipped');
      }
    }
    return this;
  },
  
  card: {
    parent: null,
    
    onClick: function(event, eventClass){
      eventClass = eventClass || '';
      this.parent.Tarot.Event.fire('Card:click' + eventClass, event);
    },
    
    highlight: function(el){  
      var that = this,
          _expandLeft = 50 - ((this.parent.width + 3)/2),
          _times = this.parent.params.times,
          tween = { 
            left: _expandLeft + '%', 
            z: 1, 
            rotation: '0_short', 
            width: '+=3%',
            onComplete: function(){
              that.parent.Tarot.Event.fire('Card:highlight', [$(el).attr('id')]);
            }
          };
      this.parent.timeLines[0].to($(el),_times.highlight, tween);
    },
    
    flip: function(el){
      var that = this,
          tween,
          _times = this.parent.params.times,
          width = $(el).attr('style').match(/width: ([0-9]*\.?[0-9]*?)\%\;/)[1],
          left = $(el).attr('style').match(/left: ([0-9]*\.?[0-9]*?)\%\;/)[1];
      
      $(el).css('height', $(el).height());

      tween = {
        left: '50%', 
        width: '0%', 
        onComplete: function(){
          var cardId = $(el).attr('id').match(/card_(.*)/)[1],
              src = this.parent.dbData.card_path + cardId + '.' + this.parent.dbData.extension;
          $(el).attr('src', src);     
        }
      };
      this.parent.timeLines[0].to($(el), _times.flip/2, tween);
      
      tween = {
        left: left + '%', 
        width: width + '%',
        onComplete: function(){
          that.parent.Tarot.Event.fire('Card:flip', [$(el).attr('id')]);
        }
      };
      this.parent.timeLines[0].to($(el), _times.flip/2, tween);
    },      

    sendAway: function(el){
      var that = this,
          _times = this.parent.params.times,
          tween = {
            left: '-=150%', 
            delay: _times.delaySendAway,
            onComplete: function(){
              that.parent.Tarot.Event.fire('Card:sendAway', [$(el).attr('id')]);
            }
          };
      this.parent.timeLines[0].to($(el), _times.sendAway, tween);           
    },
    
    niceSlide: function(el, way){
      var that = this,
          left = way === 1 ? (50 - (this.parent.width * 1.5))+'%' : (50 + (this.parent.width * 0.5))+'%',
          x = this.parent.params.position.niceSlide.x; //this.parent.params.position.center.x - 50; //way === 1 ? (50 - (this.parent.width * 1.5))+'%' : (50 + (this.parent.width * 0.5))+'%',
          h = ($(el).height() * this.parent.width) / $(el).width(),
          _times = this.parent.params.times,
          tween = { 
            x: x+'%', 
            y: this.parent.params.position.niceSlide.y + '%', 
            z: 1,
            rotation: '0_short',
            ease: Linear.easeNone,
            onUpdate: this.parent.applyLightSourceOnUpdate,
            onComplete: function(){

               that.parent.Tarot.Event.fire('Card:niceSlide', [$(el).attr('id')]);
            }
          };

      this.parent.timeLines[0].to($(el), _times.niceSlide, tween);
    },
    
    niceFlip: function(el, way){
      var that = this,
          operator, 
          origin,
          tween,
          _times = this.parent.params.times;
      
      if(way === 1){
        origin = { start: 'right', end: 'left' };
        operator = '+';
      } else {
        origin = { start: 'left', end: 'right' };
        operator = '-';
      }
      var img = new Image(),
          cardId = $(el).attr('id').match(/card_(.*)/)[1],
          src = that.parent.dbData.card_path + cardId + '.' + that.parent.dbData.extension;
      img.src = src;

      tween = { 
        transformOrigin: origin.start + ' center',
        rotationY: operator + '92.9deg',
        z: 1,
        zIndex: 101,
        ease: Power2.easeIn,
        onUpdate: this.parent.applyLightSourceOnUpdate,
        onComplete: function(){
          var _tween = {
                transformOrigin: origin.end + ' center', 
                scaleX: -1 , 
                // left: operator + '=' + that.parent.width + '%'
                x: (that.parent.params.position.niceSlide.x + 100) + '%'
              };
          $(el).attr('src', src).addClass('flipped');
          TweenMax.set($(el), _tween);
          
          var _tween2 = {
            rotationY: operator + '180deg',
            ease: Power2.easeOut,
            onComplete: function(){
              that.parent.Tarot.Event.fire('Card:niceFlip', [$(el).attr('id')]);
            }
          };
          that.parent.timeLines[0].to($(el), _times.niceFlip/2, _tween2);
        }
      };
      this.parent.timeLines[0].to($(el), _times.niceFlip/2, tween);
    },

    sendToGrid: function(el, index, Ox, Oy, timeline){
      var that = this,
          tween,
          _times = this.parent.params.times;

      if(this.parent.grid === null){
        var cards = this.parent.getCards(),
            i;
            
        if(this.parent.matriceCircle === true){
          var cardWidth = this.parent.width;
          var cardHeight = (parseInt($(cards[0]).height()) * 100) / parseInt(this.parent.container.height());
          var center = {'x': this.parent.matrice.center.x + Ox, 'y': this.parent.matrice.center.y + Oy };
          this.parent.grid = getCircleGrid(this.parent.Tarot.maxDraught, this.parent.matrice.radius, center, this.parent.matrice.start, cardWidth, cardHeight);
        } else {            
          var h = ($(cards[0]).height() * 100) / $(this.parent.Tarot.step.current).height(),
              _length = this.parent.halfzeroMatrix === false ? this.parent.matrice[0].length : 
              (function(row){var c=0;for(var j=0;j<row.length;j++){c+=row[j]>0?1:0.5;}return c;})(this.parent.matrice[0]),
              options = { 
                'height': h + 1, 
                'width': this.parent.width + 1, 
                'origine': { 
                  'x': (100 - ((this.parent.width + 1) * _length)) / 2,
                  'y': (100 - ((h + 3) * this.parent.matrice.length)) / 2
                }, 
                'matrice': this.parent.matrice,
                'halfzero': this.parent.halfzeroMatrix
              };
              
          Ox = Ox || 0;      
          Oy = Oy || 0;      
          options.origine.x += Ox;
          options.origine.y += Oy + 4;
          this.parent.grid = getGrid(options, 1);
        }
      }
      
      index = index === undefined ? this.parent.Tarot.draughtCards.length - 1 : index;
      tween = {
        // css: {
              'x':'0%',
              'y':'0%',
          left: this.parent.grid[index].left + '%', 
          top: this.parent.grid[index].top + '%',
        // },
        ease: this.parent.params.easing,
        onComplete: function(){
          var _tween = {
            scaleX: 1
          };

          if (!that.parent.grid[index].rotate) {
            _tween.rotation = '0';
            _tween.rotationY = '0deg';
          }

          TweenMax.set($(el), _tween);

          if (that.parent.grid[index].rotate)
            $(el).css({'transform-origin': 'center bottom 0', 'transform': 'rotate('+ that.parent.grid[index].rotate+'deg)'});

          that.parent.Tarot.Event.fire('Card:sendToGrid', [$(el).attr('id')]);
        },
        delay: index === 0 && _times.delaySendToGrid < 0 ? 0 : _times.delaySendToGrid
      };

      if (this.parent.grid[index].rotate) {
        //tween.css = {transform: 'rotate('+ this.parent.grid[index].rotate+'deg)'};
        $(el).attr('rotation', this.parent.grid[index].rotate);
      }

      timeline = timeline === undefined ? true : timeline;

      if(timeline){
        this.parent.timeLines[0].to($(el), _times.sendToGrid, tween);
      } else {
        TweenMax.to($(el), _times.sendToGrid, tween);
      }
    },
    
    flipOnItself: function(el, way){
      var that = this,
          operator, 
          topOperator, 
          origin,
          tween,
          _height = ($(el).height() * 100) / $(this.parent.Tarot.step.current).height(),
          _times = this.parent.params.times;
      
      if(way === 1){
        origin = { start: 'top', end: 'bottom' };
        operator = '+';
        topOperator = '-';
      } else {
        origin = { start: 'bottom', end: 'top' };
        operator = '-';
        topOperator = '+';
      }
      var _onComplete = function(){
          var cardId = $(el).attr('id').match(/card_(.*)/)[1],
              src = that.parent.dbData.card_path + cardId + '.' + that.parent.dbData.extension,
              _m = el.style[that.parent.Tarot.transformProp].match(/matrix3d\(([0-9\.]*),/),
              scaleX = _m ? _m[1] : 1,
              _tween = {
                transformOrigin: 'center ' + origin.end, 
                top: topOperator + '=' + _height + '%',
                scaleY: '-' + scaleX
              };
              
          $(el).attr('src', src);
          TweenMax.set($(el), _tween);
          
          _tween = {
            rotationX: operator + '180deg',
            ease: Power2.easeOut,
            top: operator + '=' + _height + '%',
            onComplete: function(){
              that.parent.Tarot.Event.fire('Card:flipOnItself', [$(el).attr('id')]);
            }
          };
          that.parent.timeLines[0].to($(el), 0.5, _tween);      
      };
      
      tween = { 
        transformOrigin: 'center ' + origin.start,
        rotationX: operator + '92.9deg',
        z: 1,
        ease: Power2.easeIn,
        onComplete: _onComplete
      };
      this.parent.timeLines[0].to($(el), 0.5, tween);
    },
    
    uniQ: function(el){
      var that = this,
          left = this.parent.params.position.uniQ.left + '%',
          h = ($(el).height() * this.parent.width) / $(el).width(),
          _times = this.parent.params.times,
          tween = { 
            left: left, 
            x : '0%',
            y : '0%',
            top: this.parent.params.position.uniQ.top1 + '%', 
            rotation: '0_short',
            ease: Linear.easeNone,
            onComplete: function(){
               that.parent.Tarot.Event.fire('Card:uniQ:1', [$(el).attr('id')]);
            }
          };
          
      this.parent.timeLines[0].to($(el), _times.uniQ, tween);
      tween = { 
        width: this.parent.params.position.uniQ.width+'%',
        left: '-='+ ((this.parent.params.position.uniQ.width - this.parent.width) / 2) +'%',
        top: this.parent.params.position.uniQ.top2 + '%', 
        ease: Linear.easeNone,
        onComplete: function(){
           that.parent.Tarot.Event.fire('Card:uniQ', [$(el).attr('id')]);
        }
      };
      this.parent.timeLines[0].to($(el), _times.uniQ, tween);     
    }
  },
  
  htmlMatrix: {
    container: null,
    size: { width: null, height: null},
    build: function(matrix, halfzeroMatrix){
      var i,
          grid,
          options = { 
            'height': this.size.height, 
            'width': this.size.width, 
            'origine': { 
              'x': 0,
              'y': 0
            }, 
            'matrice': matrix,
            'halfzero': halfzeroMatrix
          };

      if (matrix.radius > 0) {
        var center = {'x': this.container.width()/2, 'y': this.container.height()/2 };
        
        grid = getCircleGrid(game.deck.Tarot.maxDraught, matrix.radius, center, matrix.start, options.width-2, options.height-2);
        for(i = 0; i < grid.length; i++){
          var _transform = 'transform-origin: center bottom 0; transform: rotate('+ grid[i].rotate+'deg);';
          this.container.append($('<div style="'+_transform+'width:'+(options.width-2)+'%; height:'+(options.height-2)+'%; top:'+grid[i].top+'%; left:'+grid[i].left+'%" class="mark'+(i === 0 ? ' next' : '')+'"></div>'));
        }
      } else {
        grid = getGrid(options, 1);
        for(i = 0; i < grid.length; i++){
          this.container.append($('<div style="width:'+(options.width-2)+'%; height:'+(options.height-2)+'%; top:'+grid[i].top+'%; left:'+grid[i].left+'%" class="mark'+(i === 0 ? ' next' : '')+'"></div>'));
        }
      }
    },
    update: function(i){
      this.container.find('.mark:eq('+i+')').addClass('draught').removeClass('next');
      this.container.find('.mark:eq('+(i+1)+')').addClass('next');
    },
    reset: function(){
      this.container.find('.draught').removeClass('draught');
      this.container.find('.next').removeClass('next');
    }
  },

  removeCards: function(ids, exclude){
    var that = this,
        i,
        cards = this.getCards(true);
        
    for(i = 0; i < this.nbCards; i++){
      var id = parseInt($(cards[i]).attr('id').replace('card_', ''));
      if(id != exclude && ids.indexOf(id) != -1){
        $(cards[i]).hide();
      }
    }
  },
  
  moveCardsAway: function(cards){
    var that = this,
        index = 0,
        i = 0,
        _moveCardsAwayComplete = function _moveCardsAwayComplete(){
          index++;
          if(index < cards.length){
            return;
          }
          that.Tarot.Event.fire('Deck:moveCardsAway');
        },
        tween = { 
          y: '300%',
          z: 2,
          onComplete: _moveCardsAwayComplete
        };
        
    
    this.timeLines[0].staggerTo( cards, 0.8, tween, 0);
    
    return this;
  }
  
};

var viewPort = {
  'getWidth': function() {
    return $(window).outerWidth(true);
  },
  'getHeight': function() {
    return $(window).outerHeight(true);
  },
  'getSize': function() {
    return { width: viewPort.getWidth(), height: viewPort.getHeight()};
  }
};

var Tarot = function Tarot(d){
  this.Event = new EventTarget();

  this.enableImpress = false;
  this.apiImpress = null;
  
  this.container = null;
  this.drawing = null;
  this.background = null;
  this.handleSize = false;
  this.deckData = {};
  this.deck = null;
  this.lastStep = null;
  this.steps = [];
  this.sizes = {
    'container': {},
    'view': {}
  };
  this.draughtCards = [];
  this.draughtCardsResult = [];
  this.draughtPositions = [];
  this.maxDraught = 0;
  this.backgroundRatio = 4;
  this.browser = $.browser;
  this.transformProp = this.browser.safari == true ? '-webkit-transform' : 'transform';
  this.mobile = navigator.userAgent.toLowerCase().search(/(iphone)|(ipod)|(android)/) === -1;
  this.sliderTpl = '<div class="item clearfix[ACTIVE]"><div class="row"><div class="col-md-3"><img src="[SRC]" width="100%" /></div><div class="col-md-9"><span class="card_title">[CARDNAME]</span><span class="card_text">[CARDDESC]</span><span class="position_title">InterprÃ©tation</span><span class="position_text">[POSITIONDESC]</span><span class="position_text">[RESULT]</span></div></div></div>';
  this.sliderIndex = 0;
  this.isIE = $.browser && ( $.browser.version.msie || $.browser.version == '11.0' || $.browser.version == '10.0' );
  
  this.load(d);
  
  return this;
};

Tarot.prototype = {

  constructor: Tarot,
  
  load: function(d){
    var i;
    for(i in d){
      if(this[i] !== undefined){
        this[i] = d[i];
      }
    }
    return this;
  },
  
  init: function(){
    this.containerId = this.container.attr('id');
    
    this.setResizeEvent();
    this.initDeck();
    
    if(this.enableImpress === true){
      this.apiImpress = impress(this.containerId);
      this._initImpressEvents();
      this.apiImpress.init();
    } else {
      this.step.init();
    }
    return this;
  },
  
  _initImpressEvents: function(){
    var that = this;
    var __handleImpressEvent = function __handleImpressEvent(event){
      var args = event.detail === undefined ? [] : $.map(event.detail, function(el) { return el; });
      that.Event.fire(event.type, args);
    };
    document.addEventListener('impress:init', __handleImpressEvent);
    document.addEventListener('impress:startgoto', __handleImpressEvent);
    document.addEventListener('impress:stepenter', __handleImpressEvent);
    document.addEventListener('impress:stepreenter', __handleImpressEvent);
    document.addEventListener('impress:stepleave', __handleImpressEvent);
    
    this.on('impress:startgoto', function(e, args){
      that.step.init(); 
      that.apiImpress.initStep($(that.step.current)[0], that.step.currentId);
      args.push(that.lastStep === that.step.current);
      that.Event.fire('Step:startgoto', args);
      that.lastStep = that.step.current;
    });
    this.on('impress:stepenter', function(){
      if($('.step.active')[0] === $('.step:last')[0]){
        $('#wrapper #play_again').show().click(function(){ document.location.reload(); });
      } else {
        $('#wrapper #play_again').hide().unbind('click');
      }
      that.Event.fire('Step:init');
    });
    
    this.on('impress:stepreenter', function(){
      that.Event.fire('Step:init', [true]);
    });
    
    return this;
  },
  
  initDeck: function(){
    var _data = $.extend(true, this.deckData, { Tarot: this });
    this.deck = new Deck(_data);
    this.drawing = this.deck.container;
    this.Event.fire('Tarot:initDeck');
    return this;
  },
  
  resetContainerSize: function(){
    this.sizes.container.width = $(this.step.current).width();
    this.sizes.container.height = $(this.step.current).height();
    return this;
  },
  
  setResizeEvent: function(){
    var that = this;

    if(this.background !== null){
      this.resizeBackground();
      window.addEventListener('resize', helpers.throttle(function () {
        that.resetContainerSize().resizeBackground();
        that.apiImpress.goto(that.step.current);
      }, 250), false);
    }
    return this;
  },

  resizeBackground: function(notBackground){
    var i,
        sizes = {
      width: this.sizes.container.width * this.backgroundRatio,
      height: ( (this.sizes.container.width * this.backgroundRatio) * this.sizes.view.height ) / this.sizes.view.width
    };
    notBackground = notBackground || false;

    if(notBackground === false) this.background.css(sizes);
    // sizes.top = sizes.height * -1;
    var clones = this.container.find('.bg.no-step:not(#all)');
    for(i = 0; i < clones.length; i++){
      if($(clones[i]).data('ratio')){
        sizes = {
          width: this.sizes.container.width * $(clones[i]).data('ratio'),
          height: ( (this.sizes.container.width * $(clones[i]).data('ratio')) * $(clones[i]).data('view-height') ) / $(clones[i]).data('view-width')
        };
      }
      $(clones[i]).css(sizes);
    }
    return this;
  },
  
  resizeScreen: function(){
    if(this.container.parents('#layout_full_page').length > 0 && $(window).width() > 1663){
      $('head').append($('<meta id="viewport" name="viewport" content="width=1663, initial-scale=1">'));
    } else {
      $('#viewport').remove();
    }
    return this;
  },
  
  backgroundTranslateZ: function(z){
    this.background.css('transform', 'translate(-50%, -50%) translate3d(0px, 0px, '+z+'px)');
    return this;
  },
  
  on: function(event, fn){
    this.Event.addListener(event, fn);
    return this;
  },
  
  unbind: function(event){
    this.Event.removeListener(event);
    return this;
  },
  
  step: {
    currentId: 0,
    current: null,
    
    init: function(){
      this.currentId = $('.step.active').data('step');
      this.setCurrent();
    },
    
    setCurrent: function(){
      this.current = $('.step[data-step="' + this.currentId + '"]')[0];
    }  
  },
  
  findResult: function(filters){
    for(var i in this.deck.dbData.results){
      var b = true;
      for(var key in filters){
        if(!this.deck.dbData.results[i][key] || this.deck.dbData.results[i][key] != filters[key])
          b = false;
      }
      if(b === true)
        return this.deck.dbData.results[i].content;
    }
    return false;
  },
  
  buildInterpretation: function(slider){
    var i,
        that = this,
        slides = [],
        __html = '',
        _html = '',
        _cards = game.draughtCardsResult.length ? game.draughtCardsResult : game.draughtCards,
        _positions = game.draughtPositions.length ? game.draughtPositions : null;
    for(i = 0; i < _cards.length; i++){
      var cardId = $(_cards[i]).attr('id').match(/card_(.*)/)[1],
          index = _positions !== null ? $(_positions[i]).attr('position-id') : i + 1;
          index = this.deck.dbData.positions[index] !== undefined ? index : 1;
          var slide = {
            cardId: cardId,
            src: this.deck.dbData.card_path + cardId + '.' + this.deck.dbData.extension,
            cardText: this.deck.dbData.stack[cardId],
            positionText: this.deck.dbData.positions[index],
            result: this.findResult({'position_id': index, 'card_id': parseInt(cardId)})
          };


      __html = this.sliderTpl.replace(/\[ACTIVE\]/, (i===0 ? ' active' : ''));
      if (_positions) { __html = __html.replace(/\[POSITIONID\]/g, index); }
      __html = __html.replace(/\[SRC\]/, slide.src);
      __html = __html.replace(/\[CARDNAME\]/, slide.cardText.name);
      __html = __html.replace(/\[CARDDESC\]/, slide.cardText.description);
      __html = __html.replace(/\[POSITIONNAME\]/, slide.positionText.name.replace(/\//, ':'));
      __html = __html.replace(/\[POSITIONDESC\]/, slide.positionText.content);
      __html = __html.replace(/\[RESULT\]/, slide.result);

      _html += __html;

    }

    slider.find('.carousel-inner').html(_html);
    slider.on('slide.bs.carousel', function (e) {
      if(that.sliderIndex === _cards.length - 1 && $(e.relatedTarget).index() === 0)
        Transfo.launch();
       
      that.sliderIndex = $(e.relatedTarget).index();
    });
    return this;
  },
  
  buildLuneInterpretation: function(slider){
    var i,
        that = this,
        slides = [],
        __html = '',
        _html = '',
        _cards = game.draughtCards,
        positions = {};
        
    if(slider.hasClass('builded')){
      return true;
    } 
    slider.addClass('builded');
    for(i = 0; i < _cards.length; i++){
      var cardId = $(_cards[i]).attr('id').match(/card_(.*)/)[1],
          index = i,
          positionId = getRandomId(this.deck.dbData.positions, positions) + 1,
          slide = {
            cardId: cardId,
            src: this.deck.dbData.card_path + cardId + '.' + this.deck.dbData.extension,
            cardText: this.deck.dbData.stack[cardId],
            positionText: this.deck.dbData.positions[positionId],
            result: this.findResult({'card_id': cardId})
          };
      positions[positionId] = true;
          
      __html = this.sliderTpl.replace(/\[ACTIVE\]/, (i===0 ? ' active' : ''));
      __html = __html.replace(/\[SRC\]/, slide.src);
      __html = __html.replace(/\[CARDNAME\]/, slide.cardText.name);
      __html = __html.replace(/\[CARDDESC\]/, slide.cardText.description);
      __html = __html.replace(/\[POSITIONNAME\]/, slide.positionText.name.replace(/\//, ':'));
      __html = __html.replace(/\[POSITIONDESC\]/, slide.positionText.content);
      __html = __html.replace(/\[RESULT\]/, slide.result);
      
      _html += __html;
     
    }
    
    slider.find('.carousel-inner').html(_html);
    slider.on('slide.bs.carousel', function (e) {
      if(that.sliderIndex === that.draughtCards.length - 1 && $(e.relatedTarget).index() === 0)
        Transfo.launch();
       
      that.sliderIndex = $(e.relatedTarget).index();
    });
    return this;
  },
  
  buildQuotidienInterpretation: function(slider){
    var i,
        that = this,
        slides = [],
        __html = '',
        _html = '',
        _cards = game.draughtCards;
    for(i = 0; i < _cards.length/2; i++){
    
      var index = i == 0 ? i : i+1;
          cardIdOne = $(_cards[index]).attr('id').match(/card_(.*)/)[1],
          cardIdTwo = $(_cards[index+1]).attr('id').match(/card_(.*)/)[1];
         
      if(parseInt(cardIdOne) > parseInt(cardIdTwo)){
          //noinspection UnterminatedStatementJS
          cardIdOne = cardIdTwo
        cardIdTwo = $(_cards[index]).attr('id').match(/card_(.*)/)[1];
      };

      var slide = {
        cardIdOne: cardIdOne,
        cardIdTwo: cardIdTwo,
        cardTextOne: this.deck.dbData.stack[cardIdOne],
        cardTextTwo: this.deck.dbData.stack[cardIdTwo],
        srcOne: this.deck.dbData.card_path + cardIdOne + '.' + this.deck.dbData.extension,
        srcTwo: this.deck.dbData.card_path + cardIdTwo + '.' + this.deck.dbData.extension,
        result: this.findResult({'card2_id': cardIdTwo, 'card_id': cardIdOne})
        // result: this.deck.dbData.tirages.result[cardIdOne][cardIdTwo - cardIdOne]
      };
          
      __html = this.sliderTpl.replace(/\[ACTIVE\]/, (i===0 ? ' active' : ''));
      __html = __html.replace(/\[SRCONE\]/, slide.srcOne);
      __html = __html.replace(/\[SRCTWO\]/, slide.srcTwo);
      __html = __html.replace(/\[CARDNAMEONE\]/, slide.cardTextOne.name);
      __html = __html.replace(/\[CARDNAMETWO\]/, slide.cardTextTwo.name);
      __html = __html.replace(/\[RESULT\]/, slide.result);
      
      _html += __html;
     
    }
    
    slider.find('.carousel-inner').html(_html);
    slider.on('slide.bs.carousel', function (e) {
      if(that.sliderIndex === (that.draughtCards.length/2) - 1 && $(e.relatedTarget).index() === 0)
        Transfo.launch();
       
      that.sliderIndex = $(e.relatedTarget).index();
    });
    return this;
  },
  
  buildRapidoInterpretation: function(slider){
    var i,
        that = this,
        slides = [],
        __html = '',
        _html = '',
        _cards = game.draughtCards;
    
      var index = 0;
          cardIdOne = $(_cards[index]).attr('id').match(/card_(.*)/)[1],
          cardIdTwo = $(_cards[index+1]).attr('id').match(/card_(.*)/)[1];
         
      if(parseInt(cardIdOne) > parseInt(cardIdTwo)){
          //noinspection UnterminatedStatementJS
          cardIdOne = cardIdTwo
        cardIdTwo = $(_cards[index]).attr('id').match(/card_(.*)/)[1];
      };

      var slide = {
        cardIdOne: cardIdOne,
        cardIdTwo: cardIdTwo,
        cardTextOne: this.deck.dbData.stack[cardIdOne],
        cardTextTwo: this.deck.dbData.stack[cardIdTwo],
        srcOne: this.deck.dbData.card_path + cardIdOne + '.' + this.deck.dbData.extension,
        srcTwo: this.deck.dbData.card_path + cardIdTwo + '.' + this.deck.dbData.extension,
        result: this.findResult({'card2_id': cardIdTwo, 'card_id': cardIdOne})
        // result: this.deck.dbData.tirages.result[cardIdOne][cardIdTwo - cardIdOne]
      };
          
      __html = this.sliderTpl.replace(/\[ACTIVE\]/, (i===0 ? ' active' : ''));
      __html = __html.replace(/\[SRCONE\]/, slide.srcOne);
      __html = __html.replace(/\[SRCTWO\]/, slide.srcTwo);
      __html = __html.replace(/\[CARDNAMEONE\]/, slide.cardTextOne.name);
      __html = __html.replace(/\[CARDNAMETWO\]/, slide.cardTextTwo.name);
      __html = __html.replace(/\[RESULT\]/, slide.result);
      
      _html += __html;
    
    slider.find('.carousel-inner').html(_html);
    slider.on('slide.bs.carousel', function (e) {
      if(that.sliderIndex === (that.draughtCards.length/2) - 1 && $(e.relatedTarget).index() === 0)
        Transfo.launch();
       
      that.sliderIndex = $(e.relatedTarget).index();
    });
    return this;
  },
  
  buildJulietteInterpretation: function(slider){
    var i,
        that = this,
        slides = [],
        __html = '',
        _html = '',
        _cards = game.draughtCards;
    for(i = 0; i < _cards.length; i++){
    
      var index = i,
          cardIdOne = $(_cards[index]).attr('id').match(/card_(.*)/)[1],
          cardIdTwo = index+1 >= _cards.length ? $(_cards[0]).attr('id').match(/card_(.*)/)[1] : $(_cards[index+1]).attr('id').match(/card_(.*)/)[1];

      var slide = {
        cardIdOne: cardIdOne,
        cardIdTwo: cardIdTwo,
        srcOne: this.deck.dbData.card_path + cardIdOne + '.' + this.deck.dbData.extension,
        srcTwo: this.deck.dbData.card_path + cardIdTwo + '.' + this.deck.dbData.extension,
        result: this.findResult({'card2_id': cardIdTwo, 'card_id': cardIdOne})
      };
          
      __html = this.sliderTpl.replace(/\[ACTIVE\]/, (i===0 ? ' active' : ''));
      __html = __html.replace(/\[SRCONE\]/, slide.srcOne);
      __html = __html.replace(/\[SRCTWO\]/, slide.srcTwo);
      __html = __html.replace(/\[RESULT\]/, slide.result);
      
      _html += __html;
     
    }
    
    slider.find('.carousel-inner').html(_html);
    slider.on('slide.bs.carousel', function (e) {
      if(that.sliderIndex === that.draughtCards.length - 1 && $(e.relatedTarget).index() === 0)
        Transfo.launch();
       
      that.sliderIndex = $(e.relatedTarget).index();
    });
    return this;
  },
  
  buildInterpretationMatrix: function(key){
    var w = $(key + ':eq(0)', $(game.step.current)).width() / 3;
    var h = ((w*1.5) * 100) / $(key + ':eq(0)', $(game.step.current)).height();
    for(var __i = 0; __i < $(key, $(game.step.current)).length; __i++){
      game.deck.htmlMatrix.container = $(key + ':eq('+__i+')', $(game.step.current));
      game.deck.htmlMatrix.size = { width:(1/3)*100, height:h  };
      game.deck.htmlMatrix.build(game.deck.matrice, this.deck.halfzeroMatrix);
      game.deck.htmlMatrix.update(__i);
    }
  }
};

var Transfo = {
  launch: function(){
    $('#product #wrapper #transfoBoxOverlay, #product #wrapper #transfoBox').removeClass('hidden');
    $('#product #wrapper #transfoBox #closeTransfo').unbind('click').click(Transfo.close);
  },
  close: function(){
    $('#product #wrapper #transfoBoxOverlay, #product #wrapper #transfoBox').addClass('hidden');
  }
};

var fsapi = (function (undefined) {
    //noinspection UnterminatedStatementJS
    var dom,
 enter,
 exit,
 fullscreen
 // support for entering fullscreen
    //noinspection UnterminatedStatementJS
    dom = document.createElement('img')
    //noinspection UnterminatedStatementJS
    if ('requestFullscreen' in dom) {
     enter = 'requestFullscreen' // W3C proposal
    } else { //noinspection UnterminatedStatementJS
        if ('requestFullScreen' in dom) {
            enter = 'requestFullScreen' // mozilla proposal
        } else { //noinspection UnterminatedStatementJS
            if ('webkitRequestFullScreen' in dom) {
                enter = 'webkitRequestFullScreen' // webkit
            } else if ('mozRequestFullScreen' in dom) {
                enter = 'mozRequestFullScreen' // firefox
            } else {
                enter = undefined // not supported in this browser
            }
        }
    }
   // support for exiting fullscreen
    //noinspection UnterminatedStatementJS
    if ('exitFullscreen' in document) {
     exit = 'exitFullscreen' // W3C proposal
    } else { //noinspection UnterminatedStatementJS
        if ('msExitFullscreen' in document) {
            exit = 'msExitFullscreen' // mozilla proposal
        } else if ('cancelFullScreen' in document) {
            exit = 'cancelFullScreen' // mozilla proposal
        } else if ('webkitCancelFullScreen' in document) {
            exit = 'webkitCancelFullScreen' // webkit
        } else if ('mozCancelFullScreen' in document) {
            exit = 'mozCancelFullScreen' // firefox
        } else {
            exit = undefined // not supported in this browser
        }
   }
   // support for detecting when in fullscreen
    //noinspection UnterminatedStatementJS
    if ('fullscreen' in document) {
     fullscreen = 'fullscreen' // W3C proposal
    } else { //noinspection UnterminatedStatementJS
        if ('msFullscreenElement' in document) {
            fullscreen = 'msFullscreenElement' // mozilla proposal
        } else if ('webkitIsFullScreen' in document) {
            fullscreen = 'webkitIsFullScreen' // webkit
        } else if ('mozFullScreen' in document) {
            fullscreen = 'mozFullScreen' // firefox
        } else {
            fullscreen = undefined // not supported in this browser
        }
   }
   
   if(fullscreen == 'msFullscreenElement')
     enter = 'msRequestFullscreen';
   return {
   enter : enter,
   exit : exit,
   fullscreen : fullscreen
 }
}());

var handleFullscreen = function(type){
  if (fsapi.enter && fsapi.exit && fsapi.fullscreen) {
    if (document[fsapi.fullscreen]) {
      if(type == 'exit')
        document[fsapi.exit]()
    } else {
      if(type == 'enter'){
        document.getElementById('layout_full_page').onclick = function(evt){ evt.preventDefault(); evt.target[fsapi.enter](); };
        $('#layout_full_page').trigger('click');
        document.getElementById('layout_full_page').onclick = undefined;
        // $(window).keyup(function(e) {
          // console.log(e);
          // if (e.keyCode == 27) { $(document).unbind('keyup'); $('#cross_wrapper').trigger('click');  }   // escape key maps to keycode `27`
        // });
      }
    }
  } 
};

var getRandomId = function(array, exclude){
  var x = Math.floor((Math.random() * Object.keys(array).length));
  while(exclude[x] != undefined){
    x = Math.floor((Math.random() * Object.keys(array).length));
  }
  return x;
};
/* 686.JS */
'use strict';

var tarotData,
    game,
    drawSeen = false;

$(document).ready(function() {
    tarotData = JSON.parse(unescape($('#game').attr('data-tarot')).replace(/\+/g, ' '));
    
    game = new Tarot({
      'enableImpress': true,
      'container': $('#game'),
      'background': $('#all'),
      'backgroundRatio': 1.7,
      'sizes': { 'container': {'width': 652,  'height': 640  }, 
                 'view':      {'width': 1600, 'height': 1200 } },
      'deckData': {
        'nbCards': tarotData.nb_cards,
        'cardPath': '/images/1/v6/product/tarot/686/',
        'cardBack': 'back.png',
        'matrice': ['123']
      },
      'maxDraught': 3,
      'sliderTpl': '<div class="item clearfix[ACTIVE]"><div class="row"><div class="col-md-3"><img src="[SRC]" width="100%" /></div><div class="col-md-9"><span class="card_title">[CARDNAME]</span><span class="card_text">[CARDDESC]</span><span class="position_title">Position : [POSITIONNAME].</span><span class="position_text">[POSITIONDESC]</span><span class="position_text">[RESULT]</span></div></div></div>'
    });
    
    game.on('Step:startgoto', function(evt, data){
      var same = data[1];
      if(game.step.currentId === 1){
        if(same === false){
          $('#drawing').hide();
        }
      } else 
      if(game.step.currentId === 2){
        if(same === false){
          game.deck.setParams({ 'times': { 'moveContainer' : 0, 'center': 0 , 'staggerInterval': 0 }, 'position': {'display': { 'top': 50 }}})
                   .display('middle').moveContainerToStep();
        }
      } else 
      if(game.step.currentId === 3){
        if(same === false){
          // TweenMax.set($('#shuffle'), { z: game.deck.nbCards });
          $('#drawing').show();
          game.deck.setParams({ 'times': { 'moveContainer' : 0.75, 'shuffleOne': 0.5, 'spreado': 0.01 , 'staggerInterval': 0 }, 
                                'position': {'display': { 'top': 15 }, 'reverseSpreado': { 'left': 81 }, 'spreado': { 'left': 0 }}, 
                                'spreadLength':400, 'fanHoverTop': 5, 'shuffleZ': 50})
        }
        game.deck.moveContainerToStep();
      } else 
      if(game.step.currentId === 4){
        game.deck.moveContainerToStep();
      } else 
      if(game.step.currentId === 5){
        if(same === false){
          $('.draught.card').css('width', '23%');
          game.deck.setParams({ 'times': {'moveContainer' : 0, 'centerGrid' : 0, 'sendToGrid': 0 }})
                   .centerGrid()
                   .moveContainerToStep();
                   // .zoomByWidth(1.5);
        } else {
          game.deck.centerGrid().moveContainerToStep();
        }
      } else 
      if(game.step.currentId === 6){
        // game.deck.moveContainerToStep();
      }
    });
    game.on('Step:init', function(evt, data){
      var same = data !== undefined && data[0] !== undefined ? data[0] : false;
      if(same === false && game.step.currentId === 1){
        $('#discover', game.step.current).unbind('click').click(function(){
          $(this).unbind('click');
          TweenMax.to($(this).parent('.step'), 0.5, { 'opacity':0, 'onComplete': function(){ $(game.step.current).prev().hide(); } });
          game.apiImpress.next();
          TweenMax.to($(this).parent('.step').next(), 0.5, { 'opacity':1, delay:1 });
        });
      } else 
      if(same === false && game.step.currentId === 2){
        $('#start', game.step.current).unbind('click').click(function(){
          $(this).unbind('click');
          TweenMax.to($(this).parent('.step'), 0.5, { 'opacity':0, 'onComplete': function(){ $(game.step.current).prev().hide(); } });
          game.apiImpress.next();
          TweenMax.to($(this).parent('.step').next(), 0.5, { 'opacity':1, delay:1 });
        });
      } else 
      if(same === false && game.step.currentId === 3){
        $('#all_clone').css({'opacity':1, 'top':-1 * $(game.background).height()});
        TweenMax.to($('#all'), 0.5, { delay:0.9,  opacity: 0, onComplete: function(){
          $('#all').hide();
          $('#all_clone, #all_clone2').css('top',0);
          $('#shuffle', game.step.current).unbind('click').click(function(){
            $(this).unbind('click');
            TweenMax.to($(this), 0.1, { opacity:0 });
            game.deck.bringContainerToFront();
            game.on('Deck:shuffleOne', function(){
              game.deck.setParams({'time': { 'staggerInterval': 0}}).reverseSpreado();
            }).deck.shuffleOne();
            
            game.on('Deck:reverseSpreado', function(){
              game.unbind('Deck:reverseSpreado');
              $('#shuffle', game.step.current).addClass('cut').html('Cliquez sur une carte pour couper le jeu');
              TweenMax.to($('#shuffle', game.step.current), 0.1, { opacity:1 });              
              game.deck.applyHoverAndClick('.cut');
            });
          });
          
          game.on('Card:click.cut', function(evt, data){
            game.unbind('Card:click.cut');
            game.deck.removeCardsEvents();
            $('#shuffle', game.step.current).hide();
            game.deck.setParams({ 'times': { 'staggerInterval': 0}});
            game.deck.cut($(data.target));
          });
          
          game.on('Deck:cut', function(){
            TweenMax.to($('#cloud'), 2.5, { 'x' : '300%' });
            TweenMax.to($('#cloud2'), 2, { 'x' : '300%' });
            TweenMax.to(game.step.current, 0.5, { 'opacity':0, 'onComplete': function(){ $(game.step.current).prev().hide(); }  });
            game.apiImpress.next();
            $('#all_clone2').css({'opacity':1});
            TweenMax.to($(game.step.current), 0.5, { 'opacity':1, delay:1, 'onComplete': function(){ $('#all_clone').css({'opacity':0}); } });
          });
        }});
      } else 
      if(same === false && game.step.currentId === 4){ 
        game.deck.setParams({ 'position': { 'fan' : { 'y': 180 } }, 
                              'fanOrigin': -150,
                              'fanHoverTop': 5});
        game.deck.center();
        game.on('Deck:fan', function(){
          $('#draw_text', game.step.current).addClass('text-center').html('Concentrez-vous sur votre question, puis,<br />de la main gauche, sÃ©lectionnez ' + game.maxDraught + ' cartes<br />dans le jeu ci-dessous.');
          game.deck.htmlMatrix.container = $('#matrix');
          var w = $('#matrix').width() / 3;
          var h = ((w*1.5) * 100) / $('#matrix').height();
          game.deck.htmlMatrix.size = { width:(1/3)*100, height:h  };
          game.deck.htmlMatrix.build(game.deck.matrice);
          game.deck.applyHoverAndClick('.spreado');
          game.deck.applyHoverAndClick('.fan');
        }).deck.fan();
          
        var clickAuth = true;
        game.on('Card:click.fan', function(evt, data){
          if(game.draughtCards.length < game.maxDraught && clickAuth ===  true){
            $(data.target).addClass('draught').unbind('mouseleave.deck').unbind('mouseenter.deck').unbind('click.deck');
            clickAuth = false;
            game.draughtCards.push(data.target);
            var way = 1;
            if($(data.target).position().left > game.sizes.container.width/2){
              way = 2;
            }
            game.deck.card.niceSlide(data.target, way);
            // game.deck.card.highlight(data.target);
          }
        });
        
        game.on('Card:niceSlide', function(evt, data){
          var draughtLeft = game.maxDraught - game.draughtCards.length;
          if(draughtLeft !== 0){
            $('#draw_text', game.step.current).html('Concentrez-vous sur votre question, puis,<br />de la main gauche, sÃ©lectionnez ' + draughtLeft + ' carte' + (draughtLeft > 1 ? 's' : '') +'<br />dans le jeu ci-dessous.');
            // $('#draw_text').html('Tirer ' + draughtLeft + ' carte' + (draughtLeft > 1 ? 's' : ''));
          } else {
            $('#draw_text', game.step.current).hide();
          }
          var cardId = data[0];
          var way = 1;
          if($('#'+cardId).position().left > game.sizes.container.width/2){
            way = 2;
          }
          game.deck.card.niceFlip(document.getElementById(cardId), way);
        });
        
        game.on('Card:niceFlip', function(evt, data){
          var cardId = data[0],
              step = $(game.step.current),
              Ox, Oy;
          // Ox = (((step.next().data('x')+'').replace(/%/, '') - (step.data('x')+'').replace(/%/, '')) / 100 ) * $(step).width();
          // Oy = (((step.next().data('y')+'').replace(/%/, '') - (step.data('y')+'').replace(/%/, '')) / 100 ) * $(step).height();
          Ox = 0;
          Oy = -1*$(step).height();
          game.deck.width = 23;
          game.deck.card.sendToGrid(document.getElementById(cardId),(game.draughtCards.length - 1) , Ox, Oy);
        });
                
        game.on('Card:sendToGrid', function(){
          game.deck.htmlMatrix.update(game.draughtCards.length-1);
          if(game.draughtCards.length === game.maxDraught){
            game.unbind('Card:sendToGrid').unbind('Card:niceSlide').unbind('Card:niceFlip')
                .unbind('Deck:spreado').unbind('Card:click.spreado').unbind('Deck:cut')
                .unbind('Card:click.cut').unbind('Deck:shuffleOne').unbind('Deck:spread');
            game.deck.removeCardsEvents();
            $(game.deck.getNotDraughtCards()).hide();
            TweenMax.to($(game.step.current), 0.5, { 'opacity':0 });
            game.apiImpress.initStep($(game.step.current).next()[0], 5);
            game.apiImpress.next();
            TweenMax.to($(game.step.current), 0.5, { 'opacity':1, delay:0.1 });         
          } else {
            clickAuth = true;
          }
        });
      } else 
      if(same === true && game.step.currentId === 5){
      } else 
      if(same === false && game.step.currentId === 5 && drawSeen === true){
          TweenMax.to([$(game.step.current), $(game.deck.container)] , 0.5, { 'opacity':1 });
      } else
      if(same === false && game.step.currentId === 5 && drawSeen === false){
        game.deck.bringContainerBack();
        $('#read', game.step.current).click(function(){
            drawSeen = true;
            TweenMax.to([$(game.step.current), $(game.deck.container)] , 0.5, { 'opacity':0, onComplete: function(){
              $(game.deck.container).hide();
              game.deck.zoomByWidth(1);
            }});
            game.apiImpress.initStep($(game.step.current).next()[0], 6);
            game.apiImpress.next();
            TweenMax.to($(game.step.current), 0.5, { 'opacity':1, delay:0.1 });
            game.buildInterpretation($('#carousel_interpretation'));
        });
      } else 
      if(same === false && game.step.currentId === 6){
        $('#back_to_draw').unbind('click').click(function(){
            $(game.deck.container).show();
            TweenMax.to([$(game.step.current), game.deck.container], 0.5, { 'opacity':0});
            game.apiImpress.initStep($(game.step.current).prev()[0], 5);
            game.apiImpress.prev();
            TweenMax.to([$(game.step.current), game.deck.container], 0.5, { 'opacity':1, delay: 0.5});
        });
      }
    });
    game.on('Tarot:initDeck', function(){
      game.deck.buildCards();
    });

    fullLayout.beforeScale = function(next){ 
      game.resetContainerSize()
          .resizeBackground();
      game.apiImpress.initStep($(game.step.current)[0], game.step.currentId);
      game.apiImpress.goto(game.step.current); 
      next();
      handleFullscreen('enter');
    };
    fullLayout.onClose = function(next){ 
      game.resetContainerSize()
          .resizeBackground();
      game.apiImpress.initStep($(game.step.current)[0], game.step.currentId);
      game.apiImpress.goto(game.step.current); 
      next();
      handleFullscreen('exit');
    };
    
    game.init();
}); 
/* HOME_APFI.JS */
$(document).ready(function() {
  $('.container-apfi .front .control').click(function() {
    var parent = $(this).parent();
    parent.animate({ top: '-100%' }, 400);
  });

  $('.container-apfi .back .control').click(function() {
    var front = $(this).parent().parent().find('.front');
    front.animate({ top: 0 }, 400);
  });
});
/* PRODUCT.JS */
//noinspection UnterminatedStatementJS
var updateGoogleAdAppearance = function()
{
    $('.google_ad').css({
        'top': $('#interpretation').height() - 70,
        'margin-left': ($('#body').width() - 728 ) / 2
    });
    $('.google_ad').removeClass('hide');
}

var fullLayout = {
    init: function(){
        var full_layout = '<div id="layout_full_page">';
        full_layout += "<div id='div-gpt-ad-1411572243628-0' class='hide google_ad' style='width:728px; height:90px;'>\
                        <script type='text/javascript'>\
                            googletag.cmd.push(function() { googletag.display('div-gpt-ad-1411572243628-0'); });\
                        </script>\
                   </div>";

        full_layout += '<div id="full_page_logo_wrapper"><!--</div><div id="back_site" rel="tooltip" data-placement="left" data-original-title="Retourner sur horoscope.fr"></div>--><div id="close" class="action_full_page"><div id="cross_wrapper" class="action_full_page_wrapper"></div></div></div>';
        $('body').prepend(full_layout);
        googletag.cmd.push(function() { googletag.display('div-gpt-ad-1411572243628-0'); });

        $('#full').unbind('click').click(fullLayout.fullClick);

    },
    fullClick: function() {
        var product = $('#product').detach();
        product.addClass('clone').appendTo('#layout_full_page');

        fullLayout.onClick();

        fullLayout.beforeScale(function(){
            $('#layout_full_page').addClass('scale').css('z-index', '9000');
            $('html').attr('style', 'overflow: hidden');

            $(document).css('height', parseInt($('#layout_full_page').outerHeight()));
            $('#product #interpretation_part').css({'width': '100%', 'max-width': '500px'});

            fullLayout.onOpen();
            window.setTimeout(fullLayout.onAfterOpen, 505);

            $('#close').unbind('click').click(function() {
                if (isAstroApplication()) {
                  window.location.reload();
                  return;
                }
                var product = $('#product.clone').detach();
                $('html').removeAttr('style');
                $('#product_block').prepend(product.removeClass('clone'));
                $('#layout_full_page').removeClass('scale').css('z-index', '0');
                fullLayout.onClose(function(){
                    setTimeout(fullLayout.afterClose, 1000);
                });
            });
            updateGoogleAdAppearance();
        });
    },
    beforeScale: function(next){ next(); },
    onAfterOpen: function(){},
    onOpen: function(){},
    afterClose: function(){},
    onClose: function(next){ next();},
    onClick: function(){}
};

var pdfProductsIds = [729, 755, 763, 764, 766, 770, 774, 778, 780, 784, 787, 788, 789, 790, 791];

// Update form with saved data
//noinspection UnterminatedStatementJS
var checkFormDatas = function() {
    $.each(form_infos, function(field, value) {
        $('#'+field).val(value);
    });
}

var checkSettedFieldsValues = function(){
    // Fields to check on load
    var fields = new Array('birth_city', 'email', 'firstname', 'mobile_number', 'unknown_birthtime');

    for (var i = 0; i < fields.length; i++) {
        if (!(fields[i] == 'mobile_number' && $('#country_code').length > 0 && $('#'+fields[i]).val() == ('+' + $('#country_code').val() + ' '))) {
            if (($('#'+fields[i]).val() != '' && $('#'+fields[i]).val() != 0) || $('#'+fields[i]).is(':checked')) {
                $('#'+fields[i]).trigger('change');
            }
        }
    }
};

//noinspection UnterminatedStatementJS
var isAstroApplication = function(){
  if (typeof($('#product').data('game_type_id')) != 'undefined') {
    return true;
  }
  return false;
}

var loadMoreComments = function() {
  $('#point_of_view_carousel').unbind('slide.bs.carousel').bind('slide.bs.carousel', function (obj) {
    var that = $(this);
    if ((that.find('.item.active').index() + 2) == that.find('.item').size() && parseInt($('#point_of_view_list_block #nb_comments').html()) > that.find('.item').size()*3 ) {
      $.post('/load_more_comments/', {
        product_id: $('#point_of_view_list_block').data('product_id'),
        offset: (that.find('.item').size()) * 3
      }, function(data) {
        $('#point_of_view_carousel .carousel-inner').append(data.html);
      }, 'json');
    }
  });
};

$(document).ready(function() {

    // Hold app's handling
    $(body).on('click', '#game_wrapper, #enter_bt', function() {
        if($('#game_module:visible').length > 0 ) {
            $('#enter_bt').hide();
        }
    });

    window.onresize = function() {
        updateGoogleAdAppearance();
    };

    // INIT Layout Full Page
    fullLayout.init();

    /* COMMENT */
    $('#give_point_of_view_block a.switch_block').click(function() {
        $('#give_point_of_view_block').slideUp(500);
        $('#point_of_view_list_block').slideDown(500);
    });

    $('#point_of_view_list_block a.switch_block').click(function() {
        $('#point_of_view_list_block').slideUp(500);
        $('#give_point_of_view_block').slideDown(500);
    });

    $('.rating-form').applyRating();

    $('#form_product_comment').teleForm({
        'validation': {
            'notify': {
                'class': 'error-alert'
            },
            'position': {'of': 'andSelf'},
            'request': {
              'comment': true,
              'rate': true
            }
        },
        'wrapper': {'class': 'input-prepend'},
        'events': {
            'onSuccess': function(response) {
                $('#result_comment.error-alert').removeClass('error-alert');
                $('#form_product_comment .error-alert').remove();
                $('#result_comment').html(response.content).show();
                $('#form_product_comment .success').removeClass('success');
                $('#form_product_comment #comment').val('');
                $('#form_product_comment input[name=rate]').attr('checked', false);
            },
            'onError': function(response) {
                $('#result_comment').hide();
                if(response.extra && response.extra.error)
                    $('#result_comment').addClass('error-alert').html(response.extra.error).show();
            }
        }
    });
    /* END COMMENT */

    //GESTION DU HASH
    if(document.location.hash && document.location.hash.match(/comment/)){
      $('#product_comment_link a').trigger('click');
      $.scrollToCustom('#product_comment_link');
      $('#give_point_of_view_block #comment').focus();
    }

    if (typeof(form_infos) !== 'undefined'){
        checkFormDatas();
    }

    // Check if autoComplete values are correct
    checkSettedFieldsValues();

    if ($('#unknown_birthtime').length > 0  && $('#unknown_birthtime').is(':checked')) {
        $('#birthtime').data('required', false);
    }

    loadMoreComments();
});

/* JQUERY.RATING.JS */
/*
### jQuery Star Rating Plugin v3.13 - 2009-03-26 ###
 * Home: http://www.fyneworks.com/jquery/star-rating/
 * Code: http://code.google.com/p/jquery-star-rating-plugin/
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
###
 */

/*# AVOID COLLISIONS #*/
;
if (window.jQuery)
  (function ($) {
    /*# AVOID COLLISIONS #*/

    // IE6 Background Image Fix
    // if ($.browser.msie) try { document.execCommand("BackgroundImageCache", false, true)} catch(e) { };
    // Thanks to http://www.visualjquery.com/rating/rating_redux.html

    // plugin initialization
    $.fn.rating = function (options) {
      if (this.length == 0)
        return this; // quick fail

      // Handle API methods
      if (typeof arguments[0] == 'string') {
        // Perform API methods on individual elements
        if (this.length > 1) {
          var args = arguments;
          return this.each(function () {
            $.fn.rating.apply($(this), args);
          });
        };
        // Invoke API method handler
        $.fn.rating[arguments[0]].apply(this, $.makeArray(arguments).slice(1) || []);
        // Quick exit...
        return this;
      };

      // Initialize options for this call
      var options = $.extend({}

          /* new object */
        ,
          $.fn.rating.options /* default options */
        ,
          options || {}

          /* just-in-time options */
        );

      // Allow multiple controls with the same name by making each call unique
      $.fn.rating.calls++;

      // loop through each matched element
      this
      .not('.star-rating-applied')
      .addClass('star-rating-applied')
      .each(function () {

        // Load control parameters / find context / etc
        var control,
        input = $(this);
        var eid = (this.name || 'unnamed-rating').replace(/\[|\]/g, '_').replace(/^\_+|\_+$/g, '');
        var context = $(this.form || document.body);

        // FIX: http://code.google.com/p/jquery-star-rating-plugin/issues/detail?id=23
        var raters = context.data('rating');
        if (!raters || raters.call != $.fn.rating.calls)
          raters = {
            count : 0,
            call : $.fn.rating.calls
          };
        var rater = raters[eid];

        // if rater is available, verify that the control still exists
        if (rater)
          control = rater.data('rating');

        if (rater && control) //{// save a byte!
          // add star to control if rater is available and the same control still exists
          control.count++;

        //}// save a byte!
        else {
          // create new control if first star or control element was removed/replaced

          // Initialize options for this raters
          control = $.extend({}

              /* new object */
            ,
              options || {}

              /* current call options */
            ,
              ($.metadata ? input.metadata() : ($.meta ? input.data() : null)) || {}, /* metadata options */
            {
              count : 0,
              stars : [],
              inputs : []
            });

          // increment number of rating controls
          control.serial = raters.count++;

          // create rating element
          rater = $('<span class="star-rating-control"/>');
          input.before(rater);

          // Mark element for initialization (once all stars are ready)
          rater.addClass('rating-to-be-drawn');

          // Accept readOnly setting from 'disabled' property
          if (input.attr('disabled'))
            control.readOnly = true;

          // Create 'cancel' button
          rater.append(
            control.cancel = $('<div class="rating-cancel"><a title="' + control.cancel + '">' + control.cancelValue + '</a></div>')
              .mouseover(function () {
                $(this).rating('drain');
                $(this).addClass('star-rating-hover');
                //$(this).rating('focus');
              })
              .mouseout(function () {
                $(this).rating('draw');
                $(this).removeClass('star-rating-hover');
                //$(this).rating('blur');
              })
              .click(function () {
                $(this).rating('select');
              })
              .data('rating', control));

        }; // first element of group

        // insert rating star
        var star = $('<div class="star-rating rater-' + control.serial + '"><a title="' + (this.title || this.value) + '">' + this.value + '</a></div>');
        rater.append(star);

        // inherit attributes from input element
        if (this.id)
          star.attr('id', this.id);
        if (this.className)
          star.addClass(this.className);

        // Half-stars?
        if (control.half)
          control.split = 2;

        // Prepare division control
        if (typeof control.split == 'number' && control.split > 0) {
          var stw = ($.fn.width ? star.width() : 0) || control.starWidth;
          var spi = (control.count % control.split),
          spw = Math.floor(stw / control.split);
          star
          // restrict star's width and hide overflow (already in CSS)
          .width(spw)
          // move the star left by using a negative margin
          // this is work-around to IE's stupid box model (position:relative doesn't work)
          .find('a').css({
            'margin-left' : '-' + (spi * spw) + 'px'
          })
        };

        // readOnly?
        if (control.readOnly) //{ //save a byte!
          // Mark star as readOnly so user can customize display
          star.addClass('star-rating-readonly');
        //}  //save a byte!
        else //{ //save a byte!
          // Enable hover css effects
          star.addClass('star-rating-live')
          // Attach mouse events
          .mouseover(function () {
            $(this).rating('fill');
            $(this).rating('focus');
          })
          .mouseout(function () {
            $(this).rating('draw');
            $(this).rating('blur');
          })
          .click(function () {
            $(this).rating('select');
          });
        //}; //save a byte!

        // set current selection
        if (this.checked)
          control.current = star;

        // hide input element
        input.hide();

        // backward compatibility, form element to plugin
        input.change(function () {
          $(this).rating('select');
        });

        // attach reference to star to input element and vice-versa
        star.data('rating.input', input.data('rating.star', star));

        // store control information in form (or body when form not available)
        control.stars[control.stars.length] = star[0];
        control.inputs[control.inputs.length] = input[0];
        control.rater = raters[eid] = rater;
        control.context = context;

        input.data('rating', control);
        rater.data('rating', control);
        star.data('rating', control);
        context.data('rating', raters);
      }); // each element

      // Initialize ratings (first draw)
      $('.rating-to-be-drawn').rating('draw').removeClass('rating-to-be-drawn');

      return this; // don't break the chain...
    };

    /*--------------------------------------------------------*/

    /*
    ### Core functionality and API ###
     */
    $.extend($.fn.rating, {
      // Used to append a unique serial number to internal control ID
      // each time the plugin is invoked so same name controls can co-exist
      calls : 0,

      focus : function () {
        var control = this.data('rating');
        if (!control)
          return this;
        if (!control.focus)
          return this; // quick fail if not required
        // find data for event
        var input = $(this).data('rating.input') || $(this.tagName == 'INPUT' ? this : null);
        // focus handler, as requested by focusdigital.co.uk
        if (control.focus)
          control.focus.apply(input[0], [input.val(), $('a', input.data('rating.star'))[0]]);
      }, // $.fn.rating.focus

      blur : function () {
        var control = this.data('rating');
        if (!control)
          return this;
        if (!control.blur)
          return this; // quick fail if not required
        // find data for event
        var input = $(this).data('rating.input') || $(this.tagName == 'INPUT' ? this : null);
        // blur handler, as requested by focusdigital.co.uk
        if (control.blur)
          control.blur.apply(input[0], [input.val(), $('a', input.data('rating.star'))[0]]);
      }, // $.fn.rating.blur

      fill : function () { // fill to the current mouse position.
        var control = this.data('rating');
        if (!control)
          return this;
        // do not execute when control is in read-only mode
        if (control.readOnly)
          return;
        // Reset all stars and highlight them up to this element
        this.rating('drain');
        this.prevAll().andSelf().filter('.rater-' + control.serial).addClass('star-rating-hover');
      }, // $.fn.rating.fill

      drain : function () { // drain all the stars.
        var control = this.data('rating');
        if (!control)
          return this;
        // do not execute when control is in read-only mode
        if (control.readOnly)
          return;
        // Reset all stars
        control.rater.children().filter('.rater-' + control.serial).not(':eq(0)').removeClass('star-rating-on').removeClass('star-rating-hover').each(function (i, v) {
          $(v).data('rating.input').attr('checked', false);
        });
      }, // $.fn.rating.drain

      drainToOne : function () { // drain all the stars.
        var control = this.data('rating');
        if (!control)
          return this;
        // Clear all stars
        this.rating('drain');
        // Set control value
        control.current = $('.star-rating:eq(0)', control.context);
        control.current.data('rating.input').attr('checked', 'checked');
        control.current.prevAll().andSelf().filter('.rater-' + control.serial).addClass('star-rating-on');
        // Show/hide 'cancel' button
        control.cancel[control.readOnly || control.required ? 'hide' : 'show']();
        // Add/remove read-only classes to remove hand pointer
        this.siblings()[control.readOnly ? 'addClass' : 'removeClass']('star-rating-readonly');
      }, // $.fn.rating.drain

      draw : function () { // set value and stars to reflect current selection
        var control = this.data('rating');
        if (!control)
          return this;
        // Clear all stars
        this.rating('drain');
        // Set control value
        if (control.current === null) {
          control.current = $('.star-rating:eq(0)');
        }
        if (control.current) {
          control.current.data('rating.input').attr('checked', 'checked');
          control.current.prevAll().andSelf().filter('.rater-' + control.serial).addClass('star-rating-on');
        } else
          $(control.inputs).removeAttr('checked');
        // Show/hide 'cancel' button
        control.cancel[control.readOnly || control.required ? 'hide' : 'show']();
        // Add/remove read-only classes to remove hand pointer
        this.siblings()[control.readOnly ? 'addClass' : 'removeClass']('star-rating-readonly');
      }, // $.fn.rating.draw


      select : function (value, wantCallBack) { // select a value

        // ***** MODIFICATION *****
        // Thanks to faivre.thomas - http://code.google.com/p/jquery-star-rating-plugin/issues/detail?id=27
        //
        // ***** LIST OF MODIFICATION *****
        // ***** added Parameter wantCallBack : false if you don't want a callback. true or undefined if you want postback to be performed at the end of this method'
        // ***** recursive calls to this method were like : ... .rating('select') it's now like .rating('select',undefined,wantCallBack); (parameters are set.)
        // ***** line which is calling callback
        // ***** /LIST OF MODIFICATION *****

        var control = this.data('rating');
        if (!control)
          return this;
        // do not execute when control is in read-only mode
        if (control.readOnly)
          return;
        // clear selection
        control.current = null;
        // programmatically (based on user input)
        if (typeof value != 'undefined') {
          // select by index (0 based)
          if (typeof value == 'number')
            return $(control.stars[value]).rating('select', undefined, wantCallBack);
          // select by literal value (must be passed as a string
          if (typeof value == 'string')
            //return
            $.each(control.stars, function () {
              if ($(this).data('rating.input').val() == value)
                $(this).rating('select', undefined, wantCallBack);
            });
        } else
          control.current = this[0].tagName == 'INPUT' ?
            this.data('rating.star') :
            (this.is('.rater-' + control.serial) ? this : null);

        // Update rating control state
        this.data('rating', control);
        // Update display
        this.rating('draw');
        // find data for event
        var input = $(control.current ? control.current.data('rating.input') : null);
        // click callback, as requested here: http://plugins.jquery.com/node/1655

        // **** MODIFICATION *****
        // Thanks to faivre.thomas - http://code.google.com/p/jquery-star-rating-plugin/issues/detail?id=27
        //
        //old line doing the callback :
        //if(control.callback) control.callback.apply(input[0], [input.val(), $('a', control.current)[0]]);// callback event
        //
        //new line doing the callback (if i want :)
        if ((wantCallBack || wantCallBack == undefined) && control.callback)
          control.callback.apply(input[0], [input.val(), $('a', control.current)[0]]); // callback event
        //to ensure retro-compatibility, wantCallBack must be considered as true by default
        // **** /MODIFICATION *****

      }, // $.fn.rating.select


      readOnly : function (toggle, disable) { // make the control read-only (still submits value)
        var control = this.data('rating');
        if (!control)
          return this;
        // setread-only status
        control.readOnly = toggle || toggle == undefined ? true : false;
        // enable/disable control value submission
        if (disable)
          $(control.inputs).attr("disabled", "disabled");
        else
          $(control.inputs).removeAttr("disabled");
        // Update rating control state
        this.data('rating', control);
        // Update display
        this.rating('draw');
      }, // $.fn.rating.readOnly

      disable : function () { // make read-only and never submit value
        this.rating('readOnly', true, true);
      }, // $.fn.rating.disable

      enable : function () { // make read/write and submit value
        this.rating('readOnly', false, false);
      } // $.fn.rating.select

    });

    /*--------------------------------------------------------*/

    /*
    ### Default Settings ###
    eg.: You can override default control like this:
    $.fn.rating.options.cancel = 'Clear';
     */
    $.fn.rating.options = { //$.extend($.fn.rating, { options: {
      cancel : 'Annuler ma note', // advisory title for the 'cancel' link
      cancelValue : '', // value to submit when user click the 'cancel' link
      split : 0, // split the star into how many parts?

      // Width of star image in case the plugin can't work it out. This can happen if
      // the jQuery.dimensions plugin is not available OR the image is hidden at installation
      starWidth : 16 //,

      //NB.: These don't need to be pre-defined (can be undefined/null) so let's save some code!
      //half:     false,         // just a shortcut to control.split = 2
      //required: false,         // disables the 'cancel' button so user can only select one of the specified values
      //readOnly: false,         // disable rating plugin interaction/ values cannot be changed
      //focus:    function(){},  // executed when stars are focused
      //blur:     function(){},  // executed when stars are focused
      //callback: function(){},  // executed when a star is clicked
    }; //} });

    /*--------------------------------------------------------*/

    /*
    ### Default implementation ###
    The plugin will attach itself to file inputs
    with the class 'multi' when the page loads

    $(function(){
    $('input[type=radio].star').rating();
    });
     */

    $.fn.applyRating = function (options) {
      options = $.extend({}, options);

      this.each(function () {
        var form = $(this);

        rating = form.children('input[name="rating"]').val();
        if (form.attr('readonly') != undefined)
          form.children('input[name="rate"]').rating(options).rating('select', rating).rating('readOnly', true);
        else
          form.children('input[name="rate"]').rating('select', rating).rating(options);

        form.show();
      });

      return this;
    };

    /*# AVOID COLLISIONS #*/
  })(jQuery);
/*# AVOID COLLISIONS #*/

/* FORM.JS */
var get_glyphicon = function($this) {
  var glyphicon = $();
  if($this.prev().is('.glyphicon'))
    glyphicon = $this.prev();
  else
    glyphicon = $this.parent().parent().find('.glyphicon');

  return glyphicon;
};

$(document).ready(function() {
  // IE
  if(navigator.userAgent.indexOf("MSIE ") > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) {
    $('.form-select').addClass('ie');
  }

  if($('.rating-container').length > 0) {
    $('input.star').rating();
  }
  
  if($('#capcha').length > 0) {
    $('#capcha').s3Capcha();
    $('#capcha div .img').click(function() {
      $('#capcha div .img').removeClass('clicked');
      $(this).addClass('clicked');
    });
  }

  // Checkbox
  $('.checkbox-container').each(function() {
    if($(this).find('input[type="checkbox"]').is(':checked')) {
      $(this).addClass('checked');
    }
  });

  $('.checkbox-container input[type="checkbox"]').bind('change.form', function() {
    var parent = $(this).parent();
    parent = (!parent.is('.checkbox-container')) ? parent.parent() : parent;
    if($(this).is(':checked'))
      parent.addClass('checked');
    else
      parent.removeClass('checked');
  });

  // Radio
  $('.radio-container').each(function() {
    if($(this).find('input[type="radio"]').is(':checked')) {
      $(this).addClass('checked');
    }
  });

  $('.radio-container input[type="radio"]').bind('change.form', function() {
    var name = $(this).attr('name');
    $('.radio-container input[name="'+ name +'"]').parent().parent().removeClass('checked');
    
    if($(this).is(':checked')) {
      $(this).parent().parent().addClass('checked');
    }
  });

  // Birthtime
  $('#birth_hour, #birth_min').bind('change.form', function() {
    var birthtime = $('#birthtime', $(this).closest('form'));
    var birth_hour = $('#birth_hour', $(this).closest('form')).val();
    var birth_min = $('#birth_min', $(this).closest('form')).val();
    if(birth_hour != '' && birth_min != '') {
      birth_hour = parseInt(birth_hour);
      birth_min = parseInt(birth_min);
      birth_hour = (birth_hour < 10) ? '0'+ birth_hour : birth_hour;
      birth_min = (birth_min < 10) ? '0'+ birth_min : birth_min;
    }
    
    birthtime.val(birth_hour +':'+ birth_min);
  });

  // Birthdate
  $('#birth_day, #birth_month, #birth_year, #p_birth_day, #p_birth_month, #p_birth_year').bind('change.form', function() {
    var is_partner = $(this).hasClass('partner');
    
    var birthdate   = $('#' + (is_partner ? 'p_' : '') + 'birthdate', $(this).closest('form'));
    var birth_day   = $('#' + (is_partner ? 'p_' : '') + 'birth_day', $(this).closest('form')).val();
    var birth_month = $('#' + (is_partner ? 'p_' : '') + 'birth_month', $(this).closest('form')).val();
    var birth_year  = $('#' + (is_partner ? 'p_' : '') + 'birth_year', $(this).closest('form')).val();
    
    if(birth_day != '' && birth_month != '' && birth_year != '') {
      birth_day = parseInt(birth_day);
      birth_month = parseInt(birth_month);
      birth_year = parseInt(birth_year);
      birth_day = (birth_day < 10) ? '0'+ birth_day : birth_day;
      birth_month = (birth_month < 10) ? '0'+ birth_month : birth_month;
      birth_year = (birth_year < 10) ? '0'+ birth_year : birth_year;
    }
    
    birthdate.val(birth_year +'-'+ birth_month +'-'+ birth_day);
  });

  // Glyphicon
  $('.has-feedback .form-control').focus(function() {
    var $glyphicon = get_glyphicon($(this));
    $glyphicon.hide();

    if ($(this).is('[placeholder]'))
      $(this).css('padding-left', '12px');
  });

  $('.has-feedback .form-control').blur(function() {
    var value = $.trim($(this).val());
    var $glyphicon = get_glyphicon($(this));

    if(value == '') {
      $glyphicon.show();
      
      if ($(this).is('[placeholder]'))
        $(this).css('padding-left', '35px');
    }
  });

  $('.has-feedback .form-control').each(function() {
    var value = $.trim($(this).val());
    var $glyphicon = get_glyphicon($(this));
    
    if(value != '') {
      $glyphicon.hide();
      if ($(this).is('[placeholder]'))
        $(this).css('padding-left', '12px');
    }
  });
});
