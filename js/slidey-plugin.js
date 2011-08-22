/*
 * jQuery 'Slidey' plug-in
 * 
 * http://www.jcwd.com.au
 * @john0514
 *
 * Copyright 2011, John Cobb
 * Free to all to use, abuse and improve under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * August 2011
 */

(function($){
	$.fn.slidey = function(options) {
      
        var debug = 0;                  // Debug mode. chnage to 1 to enable.
        debug ? console.log('debug mode on') : '';
	
		var settings = {};	
		
		var defaults = {
			width: 700,					// Width of the slider container & slides
			height: 300,				// Height of the slider container & slides
			rotationSpeed: 	4000,		// The speed of the image rotation
            fadeDuration:   800,        // The duration of the fade transition
			child: 			'img',		// The type of element which we will be rotating
            autoRotate:     true,       // Does the slider rotate automatically?
            hoverPause: 	true,		// Does the slide pause on hover?
			showControls: 	false,		// Does the slider have controls?
			centerControls:	false,		// Vertically center the controls?
			nextText:		'',			// Text to use for next button
			prevText:		'',			// Text to use for previous button
			showMarkers:	false,		// Do we want positional indicators?
			centerMarkers:	true		// Horizontally center the markers?
		}
		
		// Overwrite the defaults with the provided options (if any)
		settings = $.extend({}, defaults, options);
		
		// non-jQuery vars
		var paused = false,				// Is the slider currently paused?
			fwd = 0,					// Value indicating next
			back = -1,					// Value indicating previous
			current_slide = 1,			// The currently active slide
			marker_pos = 0,				// The currently active marker
            animating = false           // Is the slider currently animating?
			
		// jQuery vars
		var	$slider = this,									// The slider parent
			$banners = $slider.children(settings.child), 	// The slides
			$position,										// Marker wrapper
			$markers,										// Markers
			$next,											// Next button
			$previous										// Previous button
		
		$($slider).height(settings.height).width(settings.width);
		$($banners).height(settings.height).width(settings.width);
		
		// Hook me with some positional indicators!	
		if(settings.showMarkers){
		
			// Create the parent element and append it to the slider
			$position = $('<ul class="markers"></ul>');	
			$position.appendTo($slider);
			
			$.each($banners,function(key,value){
				key++
				$('<li><a href="#">'+key+'</a></li>').appendTo($position);
			});

			// Gather all the markers
			$markers = $position.children('li');
		
			// Iterate over the markers and bind a click event to each one
			$.each($markers, function(key,value){
				$(value).click(function(e){
					e.preventDefault();
                    if(!$(this).hasClass('active-marker') && !animating)
                      slideyGo(key+1);
				});
			})

			// Horizontally center the markers
			if(settings.centerMarkers){
				offset = ($slider.innerWidth() - $position.innerWidth() )/ 2;
				$position.css('left', offset);
			}

			$($markers[0]).addClass('active-marker');
		}

		// Hook up the controls!
		if(settings.showControls){
			
			// Create the control elements and append them to the slider
			$next = $('<a href="#" id="next" class="controls">'+settings.nextText+'</a>');
			$previous = $('<a href="#" id="prev" class="controls">'+settings.prevText+'</a>');

			$next.appendTo($slider);
			$previous.appendTo($slider);
			
			// Bind click events to the controllers
			$next.click(function(e){
				e.preventDefault();
                if(!animating)
                  slideyGo(fwd);
			});
			
			$previous.click(function(e){
				e.preventDefault();
                if(!animating)
                  slideyGo(back);
			});
			
			// Vertically center the controllers
			if(settings.centerControls){
				offset = ($slider.innerHeight() - $next.innerHeight()) / 2;
				$next.css('top', offset).show();
				$previous.css('top', offset).show();
			}
	
		}
		
		//If pause on hover is enabled, we need to hook that shit up!
		if(settings.hoverPause && settings.autoRotate){
			
			$slider.hover(function(){
				
				if(!paused){
					clearInterval(slideyInterval);
					paused=true;
				}
				
			},function(){
				
				if(paused){
					slideyInterval = setInterval(function(){ slideyGo(fwd) }, settings.rotationSpeed);
					paused=false;
				}
				
			});
			
		}
		
        $($banners).addClass('slide');              // Give all banners the slide class
        $($banners[0]).addClass('active-slide');    // Set the first banner to active
        
		if(settings.autoRotate){
          var slideyInterval = setInterval(function(){ slideyGo(fwd) }, settings.rotationSpeed);
        }
		
		// Go Slidey, Go!
		var slideyGo = function(move){
          
            animating=true;
			
			var child = settings.child,
				position;
			
			$.each($banners,function(key,value){
				
				$element = $(value);
		
				if($element.hasClass('active-slide')) {
					$active = $element;
					position = key;
				}
				
			});

			$active.stop();
			
			if(move==fwd){
				
				// Forza Slidey!
				
				// Do we need to loop to the start?
				if(!$active.next(child).length){
					$next = $slider.children(child+':first');
					marker_pos = 0;
				}
				else{
					$next = $active.next(child)
					marker_pos = position+1;
				}
			}
			else if(move==back){
				
				// Back slidey! Go back!!
				
				// Do we need to loop to the end?
				if(!$active.prev(child).length){
					$next = $slider.children(child+':last');
					marker_pos = $markers.length-1;
				}
				else{
					$next = $active.prev(child)
					marker_pos = position-1;
				}
			}
			else{
				
				// Jump around slidey! Jump up, Jump up and get down!
				$next = $(($slider.children(child)[move-1]));
				marker_pos = move-1;
				
			}
			
			if(settings.showMarkers){
				$markers.removeClass('active-marker');
				$($markers[marker_pos]).addClass('active-marker');
			}
			
			//Give the active elements the last-active class to give them a lower z-index than the next elements to be displayed
			$active.addClass('last-active-slide');
		
			//Animate the opacity of the next image to be displayed and give it the '.active' class to bring it to the front
			$next.css({opacity: 0.0}).addClass('active-slide').animate({opacity: 1.0}, 500, function() {
				$active.removeClass('active-slide last-active-slide');
                animating =false;
			});
		
			
		}
		
		return this;
	
	}
})(jQuery);