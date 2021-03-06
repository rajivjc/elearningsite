(function ($) {

//get IE version if browser is IE
  var ie = (function detectIE() {
    var ua = window.navigator.userAgent;

    var msie = ua.indexOf('MSIE ');
    if (msie > 0) {
      return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
    }

    var trident = ua.indexOf('Trident/');
    if (trident > 0) {
      var rv = ua.indexOf('rv:');
      return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
    }

    var edge = ua.indexOf('Edge/');
    if (edge > 0) {
      return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
    }
    return false;
  })();

  $.fn.sliiide = function(options) {

    var settings = $.extend({
      toggle: "#sliiider-toggle",
      exit_selector: ".slider-exit",
      animation_duration: "0.5s",
      place: "right",
      animation_curve: "cubic-bezier(0.54, 0.01, 0.57, 1.03)",
      body_slide: true,
      no_scroll: true,
    }, options );

    var newSize;
    var clicked = false;
    var $sliiider = $(this);
    var $toggle = $(settings.toggle);
    var $exit = $(settings.exit_selector);
    var $body = $('body');
    var bodySlideDistance;

    var bodyResetProp = {
      transform: '',
      'overflow-x': '',
      'overflow-y': '',
      transition: '',
    };

    var sliiiderResetProp = {
      transform: '',
      transition: '',
      width: '',
      height: '',
      left: '',
      top:'',
      bottom:'',
      right:''
    };

    var prepareProperties = {
      visibility: 'hidden',
      transition: 'transform ' + settings.animation_duration + ' ' + settings.animation_curve,
      position: 'fixed'
    };

    var bodySlidePrepare = {
      transition: 'transform ' + settings.animation_duration + ' ' + settings.animation_curve,
      'overflow-x': 'hidden',
      'overflow-y': 'hidden'
    };


    var bodySlideProp = {

      setleft: function(distance) {
        this.left.activateAnimation.transform = 'translateX('+distance+'px)';
        this.left.deactivateAnimation.transform = 'translateX(0px)';
      },
      setright: function(distance) {
        this.right.activateAnimation.transform = 'translateX(-'+distance+'px)';
        this.right.deactivateAnimation.transform = 'translateX(0px)';
      },
      setbottom: function(distance) {
        this.bottom.activateAnimation.transform = 'translateY(-'+distance+'px)';
        this.bottom.deactivateAnimation.transform = 'translateY(0px)';
      },
      settop: function(distance) {
        this.top.activateAnimation.transform = 'translateY('+distance+'px)';
        this.top.deactivateAnimation.transform = 'translateY(0px)';
      },
      left: {
        activateAnimation: {transform:''},
        deactivateAnimation: {transform: ''}
      },
      right: {
        activateAnimation: {transform: ''},
        deactivateAnimation: {transform: ''}
      },
      top: {
        activateAnimation: {transform: ''},
        deactivateAnimation: {transform: ''}
      },
      bottom: {
        activateAnimation: {transform: ''},
        deactivateAnimation: {transform: ''}
      }
    };

    var Prop = {

      left: {
        properties: {top: '0', left: '0', transform: 'translateX(-100%)'},
        activateAnimation: {transform: 'translateX(0)'},
        deactivateAnimation: {transform: 'translateX(-100%)'},
        size: function (wHeight, wWidth) {
          return {height: wHeight};
        }
      },

      right: {
        properties: {top: '0', right: '0', transform: 'translateX(100%)'},
        activateAnimation: {transform: 'translateX(0)'},
        deactivateAnimation: {transform: 'translateX(100%)'},
        size: function (wHeight, wWidth) {
          return {height: wHeight};
        }

      },

      top: {
        properties: {top: '0', right: '0', left:'0', transform: 'translateY(-100%)'},
        activateAnimation: {transform: 'translateY(0)'},
        deactivateAnimation: {transform: 'translateY(-100%)'},
        size: function (wHeight, wWidth) {
          return {width: wWidth};
        }
      },

      bottom: {
        properties: {bottom: '0', right: '0', left:'0', transform: 'translateY(100%)'},
        activateAnimation: {transform: 'translateY(0)'},
        deactivateAnimation: {transform: 'translateY(100%)'},
        size: function (wHeight, wWidth) {
          return {width: wWidth};
        }
      }
    };

    var prefixCSS = function(cssProp) {
      $.each(cssProp, function(k, v) {
        if(k === 'transition')
        { var trnsCSS = {};
        var trnsProp = v.split(' ',1)[0];
        var trnsAttr = v.split(' '); trnsAttr.shift(); trnsAttr = trnsAttr.join(' ');
        trnsCSS['-webkit-'+k] = '-webkit-' + trnsProp + ' ' + trnsAttr;
        trnsCSS['-ms-'+k] = '-ms-' + trnsProp + ' ' + trnsAttr;
        $.extend(cssProp, trnsCSS);
      }
      else if (k === 'transform')
      {
        var trnsfCSS = {};
        trnsfCSS['-webkit-'+k] = v;
        trnsfCSS['-ms-'+k] = v;
      }
    });

    return cssProp;
  };

  var siiize = function() {
    var windowSize = {};
    windowSize.height = $(window).height();
    windowSize.width = $(window).width();
    newSize = Prop[settings.place].size(windowSize.height, windowSize.width);
    $sliiider.css(newSize);
    setSlideDistance();
  };

  var setSlideDistance = function() {
    if(settings.body_slide)
    {
      if(settings.place === 'right' || settings.place === 'left')
      {
        bodySlideDistance = $sliiider.width();
      }
      else
      {
        bodySlideDistance = $sliiider.height();
      }
      bodySlideProp['set'+settings.place](bodySlideDistance);
    }
  };

  var prepare = function() {
    $sliiider.css(prefixCSS(prepareProperties));
    $sliiider.css(prefixCSS(Prop[settings.place]["properties"]));
    setSlideDistance();
  };


  var activate = function() {
    siiize(); //sets the size of the slider menu and the distance the body will travel on sliding
    $sliiider.css('visibility','visible');
    if(settings.body_slide)
      {
      $body.css(prefixCSS(bodySlidePrepare));
      $body.css(prefixCSS(bodySlideProp[settings.place].activateAnimation));
      if((ie !== false) && (ie <= 11))
        {
          $sliiider.css(prefixCSS(Prop[settings.place].activateAnimation));
        }

      //dealing with the browser bug of inability to transform fixed elements

      var windowHeight = $(window).height();
      var scrollTop = $(window).scrollTop();
      var sliiiderHeight = $sliiider.height();
      var sliiiderOffsetTop = $sliiider.offset().top;

      if((sliiiderOffsetTop !== scrollTop) && settings.place !== "bottom" && !(ie && ie <= 11 && settings.place ==="top"))
        {
          $sliiider.css('top', scrollTop);
        }
      if(((sliiiderOffsetTop !== scrollTop + windowHeight) && (settings.place === "bottom")))
        {
        $sliiider.css('top', scrollTop + windowHeight - sliiiderHeight).css('bottom','');
        }
      }

    else {
      $sliiider.css(prefixCSS(Prop[settings.place].activateAnimation));
    }

    if(settings.no_scroll)  {
      disable_scroll();
    }

    clicked = true;
  };

  var hideSlider = function(e) {
    $sliiider.css('visibility','hidden');
    $body.css(bodyResetProp);
    $body.unbind('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', hideSlider);
    prepare();
  };

  function deactivate() {
    $body.one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', hideSlider);

    if(settings.body_slide) {
      $body.css(prefixCSS(bodySlideProp[settings.place].deactivateAnimation));
      if((ie !== false) && (ie <= 11))
        {$sliiider.css(prefixCSS(Prop[settings.place].deactivateAnimation));}
    }

    else {
      $sliiider.css(prefixCSS(Prop[settings.place].deactivateAnimation));
    }

    if(settings.no_scroll)  {
      enable_scroll();
    }

    clicked = false;
  }

  siiize();
  prepare();
  $(window).resize(siiize);

  var handleToggle = function() {
    if (!clicked)
    {activate();}
    else
    {deactivate();}
  };

  $toggle.click(handleToggle);
  //$sliiider.find('a').on('click', function() {deactivate();});
  $exit.on('click', function() {deactivate();});

  var deleteProp = function() {
    $body.css(bodyResetProp);
    $sliiider.css(sliiiderResetProp);
    $(window).off('resize', siiize);
    $toggle.off('click', handleToggle);
  };


  var menu = {
    reset: function(name) {
      $body.one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', deleteProp);
      deactivate();
      // $body.unbind('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', deleteProp);
    },
    deactivate: function() {deactivate();},
    activate: function() {activate();}
  };

  return menu;
};

//enable and disable scroll
// left: 37, up: 38, right: 39, down: 40,
// spacebar: 32, pageup: 33, pagedown: 34, end: 35, home: 36
var keys = {37: 1, 38: 1, 39: 1, 40: 1};

function preventDefault(e) {
  e = e || window.event;
  if (e.preventDefault)
  e.preventDefault();
  e.returnValue = false;
}

function preventDefaultForScrollKeys(e) {
  if (keys[e.keyCode]) {
    preventDefault(e);
    return false;
  }
}

function disable_scroll() {
  if (window.addEventListener) // older FF
  window.addEventListener('DOMMouseScroll', preventDefault, false);
  window.onwheel = preventDefault; // modern standard
  window.onmousewheel = document.onmousewheel = preventDefault; // older browsers, IE
  window.ontouchmove  = preventDefault; // mobile
  document.onkeydown  = preventDefaultForScrollKeys;
}

function enable_scroll() {
  if (window.removeEventListener)
  window.removeEventListener('DOMMouseScroll', preventDefault, false);
  window.onmousewheel = document.onmousewheel = null;
  window.onwheel = null;
  window.ontouchmove = null;
  document.onkeydown = null;
}

}(jQuery));

jQuery( document ).ready( function( $ ) {
	var settings = {
		animation_duration: false,
		place: "left",
		animation_curve: false,
		body_slide: false,
		no_scroll: false,
	};

	var menu = $('.slideout-navigation').sliiide(settings);

	$( '.slideout-mobile .main-navigation .menu-toggle, .slideout-both .main-navigation .menu-toggle, .slideout-both .slideout-toggle, .slideout-desktop .slideout-toggle' ).on( 'click', function( event ) {
		event.preventDefault();
		menu.activate();
		$( this ).addClass( 'opened' );
		$( 'body, html' ).addClass( 'slide-opened' );
		$( '.slideout-overlay' ).show();
		$( '.slideout-toggle' ).addClass( 'sfHover' );
		var selScrollable = '.slideout-navigation';
		// Uses document because document will be topmost level in bubbling
		$(document).on('touchmove',function(e){
			e.preventDefault();
		});
		// Uses body because jQuery on events are called off of the element they are
		// added to, so bubbling would not work if we used document instead.
		$('body').on('touchstart', selScrollable, function(e) {
			if (e.currentTarget.scrollTop === 0) {
				e.currentTarget.scrollTop = 1;
			} else if (e.currentTarget.scrollHeight === e.currentTarget.scrollTop + e.currentTarget.offsetHeight) {
				e.currentTarget.scrollTop -= 1;
			}
		});
		// Stops preventDefault from being called on document if it sees a scrollable div
		$('body').on('touchmove', selScrollable, function(e) {
			// Only block default if internal div contents are large enough to scroll
			// Warning: scrollHeight support is not universal. (http://stackoverflow.com/a/15033226/40352)
			if($(this)[0].scrollHeight > $(this).innerHeight()) {
				e.stopPropagation();
			}
		});
		return false;
	});
	$( '.slideout-overlay, .slider-exit a' ).on( 'click', function( event ) {
		event.preventDefault();
		menu.deactivate();
		$( '.menu-toggle.opened' ).removeClass( 'opened' );
		$( '.slideout-toggle.opened' ).removeClass( 'opened' );
		$( 'body, html' ).removeClass( 'slide-opened' );
		$( '.slideout-overlay' ).hide();
		$( '.slideout-toggle' ).removeClass( 'sfHover' );
		$( document ).off( 'touchmove' );
		$( 'body' ).off( 'touchmove touchstart', '.slideout-navigation' );
		return false;
	});
	
	$(document).on('keyup',function(evt) {
		if ( ! $( "body" ).hasClass( "slide-opened" ) )
			return;
		
		if (evt.keyCode == 27) {
			menu.deactivate();
			$( '.menu-toggle.opened' ).removeClass( 'opened' );
			$( '.slideout-toggle.opened' ).removeClass( 'opened' );
			$( 'body, html' ).removeClass( 'slide-opened' );
			$( '.slideout-overlay' ).hide();
			$( '.slideout-toggle' ).removeClass( 'sfHover' );
			$( document ).off( 'touchmove' );
			$( 'body' ).off( 'touchmove touchstart', '.slideout-navigation' );
		}
	});
});