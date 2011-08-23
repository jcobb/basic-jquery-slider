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



		/* ============================================================
		
		Plug-in initialisation. Define variables, settings, etc
		
		============================================================== */
	
		var settings = {};	
		
		var defaults = {
			width: 			700,		// Width of the slider container & slides
			height: 		300,		// Height of the slider container & slides
			animType:		'fade',		// Animation type, slide or fade
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
		
		// Variables
		var	$slider = this,	
			banners = $slider.children(settings.child),
			slideCount = banners.length,
			paused = false,
			animating = false,
			fwd = 0,
			back = -1,
			current_slide = 1,
			marker_pos = 0

		// Set the height and width of the slider wrapper and slider
		$($slider).height(settings.height).width(settings.width);
		$(banners).height(settings.height).width(settings.width);
		
		
		/* ============================================================
		
		Prepare the elements for a horizontal slider
		
		============================================================== */
		
		if(settings.animType == 'slide'){
			
			// Get the first and last slides
			$first = $(banners[0]);
			$last = $(banners[banners.length-1]);
			
			// Clone them, then add the first to the back
			// and the last to the front so we can do some voodoo
			$last.clone().prependTo($slider);
			$first.clone().appendTo($slider);
			
			// Update our array of slides
			banners = $slider.children(settings.child)
			
			// Make a canvas that will hold the slides
			$canvas = $('<div id="canvas"></div>');

			// Set the width of the canvas based on number of slides and settings
			$canvas.width(banners.length*settings.width).height(settings.height)
			
			$slider.css('overflow','hidden');
			
			$canvas.css({
				'position' : 'absolute',
				'left' : -settings.width + 'px'
			});
			
			banners.css({
				'float' : 'left',
				'position' : 'relative'
			})
			
			// Put it all back together
			$canvas.append(banners);
			$slider.append($canvas);
			
			current_slide =2;
			
		}
		
		// If it's a fade animation, we don't need to do much at all
		
		if(settings.animType == 'fade'){
			$(banners).addClass('slide');              // Give all banners the slide class
			$(banners[0]).addClass('active-slide');    // Set the first banner to active
		}
		
		
		
		
		/* ============================================================
		
		If markers are enabled, create them and add them
		
		============================================================== */
		
		if(settings.showMarkers){
		
			// Create the wrapper
			$marker_wrapper = $('<ul class="markers"></ul>');
			$marker_wrapper.appendTo($slider);
			
			//Create a marker for each banner and add append it to the wrapper
			$.each(banners,function(key,value){
				key++
				if(settings.animType == 'slide'){
					if(key != 1 && key != banners.length)
						$('<li><a href="#">'+key+'</a></li>').appendTo($marker_wrapper);
				}
				else{
					$('<li><a href="#">'+key+'</a></li>').appendTo($marker_wrapper);
				}
			});

			// Gather all the markers up in to an array
			markers = $marker_wrapper.children('li');
		
			// Iterate over the markers and bind a click event to each one
			$.each(markers, function(key,value){
				$(value).click(function(e){
					e.preventDefault();
                    if(!$(this).hasClass('active-marker') && !animating)
						slideyGo(key+1);
				});
			})

			// Horizontally center the markers
			if(settings.centerMarkers){
				offset = (settings.width - $marker_wrapper.width() )/ 2;
				$marker_wrapper.css('left', offset);
			}

			// Set the first one as active
			$(markers[0]).addClass('active-marker');
			
		}

		
		
		
		
		/* ============================================================
		
		If controls are enabled, create them and add them
		
		============================================================== */
		
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
		




		/* ============================================================
		
		Enable pause on hover only if autoRotate is also enabled
		
		============================================================== */
		
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
        
		
		
		
		/* ============================================================
		
		Kick off the rotation if autoRotate is enabled
		
		============================================================== */
		
		if(settings.autoRotate){
          var slideyInterval = setInterval(function(){ slideyGo(fwd) }, settings.rotationSpeed);
        }
		
		
		
		
		/* ============================================================
		
		The function that makes the magic happen
		
		============================================================== */
		
		var slideyGo = function(move){
          
			// We're animating!
            animating=true;
			
			// If we're doing a fade animation...
			if(settings.animType == 'fade'){
				
				var child = settings.child,
					current_slide;
				
				$.each(banners,function(key,value){
					
					$element = $(value);
			
					if($element.hasClass('active-slide')) {
						$active = $element;
						current_slide = key;
					}
					
				});
				
				
				// Forza Slidey!
				if(move==fwd){
					
					// Do we need to loop to the start?
					if(!$active.next(child).length){
						$next = $slider.children(child+':first');
						marker_pos = 0;
					}
					else{
						$next = $active.next(child)
						marker_pos = current_slide+1;
					}
				}
				else if(move==back){
					
					// Back slidey! Go back!!
					
					// Do we need to loop to the end?
					if(!$active.prev(child).length){
						$next = $slider.children(child+':last');
						marker_pos = markers.length-1;
					}
					else{
						$next = $active.prev(child)
						marker_pos = current_slide-1;
					}
				}
				else{
					
					// Jump around slidey! Jump up, Jump up and get down!
					$next = $(($slider.children(child)[move-1]));
					marker_pos = move-1;
					
				}
				
				if(settings.showMarkers){
					markers.removeClass('active-marker');
					$(markers[marker_pos]).addClass('active-marker');
				}
				
				//Give the active elements the last-active class to give them a lower z-index than the next elements to be displayed
				$active.addClass('last-active-slide');
			
				//Animate the opacity of the next image to be displayed and give it the '.active' class to bring it to the front
				$next.css({opacity: 0.0}).addClass('active-slide').animate({opacity: 1.0}, 500, function() {
					$active.removeClass('active-slide last-active-slide');
					animating =false;
				});
				
			}
		
		
			// Horizontal slider		
			if(settings.animType == 'slide'){
				
				console.log('starting slide....');
			
				position = $canvas.position();
				
				current_slide = ((position.left/settings.width)*-1);
				
				console.log('	starting pos: '+current_slide);
				
				if(move == 0){
					
					new_position = position.left - settings.width;
					
					$canvas.animate({'left': new_position}, 500, function(){
						
						if(new_position == -(settings.width * (slideCount + 1))){
							$canvas.css('left',-settings.width);
							current_slide=1;
							console.log('		next-if: '+current_slide);
						}
						else{
							current_slide++;
							console.log('		next-else: '+current_slide);
						}
						
						if(settings.showMarkers){
							markers.removeClass('active-marker');
							$(markers[current_slide-1]).addClass('active-marker');
						}
						
						animating=false;
						console.log('	ending pos: '+current_slide);
						
					});

				}else if(move == -1){
					
					new_position = position.left + settings.width;
					
					$canvas.animate({'left': new_position}, 500, function(){
						
						if(new_position == 0){
							$canvas.css('left',-settings.width*slideCount);
							current_slide=slideCount;
							console.log('		prev-if: '+current_slide);
						}
						else{
							current_slide--;
							console.log('		prev-else: '+current_slide);
						}
						
						if(settings.showMarkers){
							markers.removeClass('active-marker');
							$(markers[current_slide-1]).addClass('active-marker');
						}
						
						animating=false;
						console.log('	ending pos: '+current_slide);
						
					});

				}else{
					
					new_position = -(move * settings.width);
					
					$canvas.animate({'left': new_position}, 500, function(){
						
						if(new_position == 0){
							$canvas.css('left',-settings.width*slideCount);
							$current_slide=slideCount-1;
						}
						
						if(new_position == -(settings.width * (slideCount + 1))){
							$canvas.css('left',-settings.width);
							current_slide=1;
						}
						else{
							current_slide=move;
						}
						
						if(settings.showMarkers){
							markers.removeClass('active-marker');
							$(markers[current_slide-1]).addClass('active-marker');
						}
						
						animating=false;
						console.log('	ending pos: '+current_slide);
						
					});
					
				}
				
			}
			
		}
		
		return this;
	
	}
})(jQuery);