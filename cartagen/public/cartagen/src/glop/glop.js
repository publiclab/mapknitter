/**
 * @namespace The base of the interface between javascript and the canvas element.
 */
var Glop = {
	/**
	 * The number of frames that have been drawn.
	 * @type Number
	 */
	frame: 0,
	/**
	 * The width of the canvas
	 * @type Number
	 */
	width: 0,
	/**
	 * The height of the canvas
	 */
	height: 0,
	/**
	 * If set to true, drawing is disabled
	 */
	paused: false,
	/**
	 * Sets up powersaving.
	 */
	init: function() {
		// seconds between redraws:
		new PeriodicalExecuter(Glop.draw_powersave, 0.1)
	},
	/**
	 * Draws a frame. Sets height/width, moves the map as needed, fires draw events, and draws
	 * the object array unless told not to (by  subscriber of glop:draw.
	 */
	draw: function(custom_size, force_draw) {
		if (Glop.paused && (force_draw != true)) {
			$('canvas').fire('glop:predraw')
			return
		}

		
		$C.clear()
		
		if (Cartagen.fullscreen) {
			if (!custom_size) { // see Canvas.to_print_data_url()
				Glop.width = document.viewport.getWidth()
				Glop.height = document.viewport.getHeight()
			}
			$('canvas').width = Glop.width
			$('canvas').height = Glop.height
			$$('body')[0].style.width = Glop.width+"px"
		}
		else {
			Glop.width = $('canvas').getWidth()
			Glop.height = $('canvas').getHeight()
			$('canvas').width = Glop.width
			$('canvas').height = Glop.height
		}
		
		Events.drag()
		
		/**
		 * @name Glop#glop:predraw
		 * @event
		 * Fired each frame before features are drawn.
		 */
		$('canvas').fire('glop:predraw')
		
		/**
		 * @name Glop#glop:draw
		 * @event
		 * Fired each frame between glop:predraw and glop:postdraw. SHould be used
		 * to draw features on the canvas. If the 'no_draw' property of the event
		 * is set to true, GLOP will not raw the objects array.
		 */
		draw_event = $('canvas').fire('glop:draw')
		
		if (!draw_event.no_draw) {
			objects.each(function(object) { 
				object.draw()
			})
		}
		
		/**
		 * @name Glop#glop:postdraw
		 * @event
		 * Fired at the end of each frame, after features are drawn.
		 */
		$('canvas').fire('glop:postdraw')
	},
	/**
	 * Creates a random color
	 * @return Color in rgb(r, g, b) format
	 * @type String
	 */
	random_color: function() {
		return "rgb("+Math.round(Math.random()*255)+","+Math.round(Math.random()*255)+","+Math.round(Math.random()*255)+")"
	},
	/**
	 * Draws only if needed. Designed to be called periodically.
	 */
	draw_powersave: function() {
		if (Cartagen.powersave == false || (Cartagen.requested_plots && Cartagen.requested_plots > 0) || Cartagen.last_loaded_geohash_frame > Glop.frame-20) {
			Glop.draw()
		} else {
			if (Event.last_event > Glop.frame-25) {
				Glop.draw()
			} else {
				// $l('sleeping')
			}
		}
		Glop.frame += 1
	}
}

document.observe('cartagen:init', Glop.init.bindAsEventListener(Glop))

//= require "timer_manager"
//= require "events"
//= require "canvas"
//= require "canvastext"