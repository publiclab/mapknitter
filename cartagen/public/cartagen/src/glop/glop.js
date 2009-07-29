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
	 * A Date object updated (regenerated) every frame.
	 * @type Date
	 */
	date: new Date,
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
		// new PeriodicalExecuter(Glop.draw_powersave, 0.1)
		TimerManager.setup(Glop.draw_powersave,this)
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
		if (!custom_size) { // see Canvas.to_print_data_url()
			Glop.width = document.viewport.getWidth()
			Glop.height = document.viewport.getHeight()
		}
		$('canvas').width = Glop.width
		$('canvas').height = Glop.height
		$$('body')[0].style.width = Glop.width+"px"
	
		// for embedded
		//Glop.width = $('canvas').getWidth()
		//Glop.height = $('canvas').getHeight()
		//$('canvas').width = Glop.width
		//$('canvas').height = Glop.height
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
	 * The number of frames to continue rendering, even if there's no further user interaction
	 */
	tail: 0,
	/**
	 * Triggered when moused is moved on the canvas
	 * @param {Event} event
	 */
	trigger_draw: function(t) {
		// t = t || 1
		if (Object.isNumber(t) && !Object.isUndefined(t)) {
			if (t > this.tail) this.tail = t
		} else {
			if (this.tail <= 0) this.tail = 1
		}
	},
	/**
	 * Draws only if needed. Designed to be called periodically.
	 */
	draw_powersave: function() {
		var delay = 20
		if (this.tail > 0 || Config.powersave == false || (Importer.requested_plots && Importer.requested_plots > 0) || Cartagen.last_loaded_geohash_frame > Glop.frame-delay || Importer.parse_manager.completed < 100) {
			if (this.tail > 0) this.tail -= 1
			Glop.draw()
		} //else $l('powersave: '+this.tail)
		// $l('tail:'+this.tail)
		Glop.frame += 1
		Glop.date = new Date
	}
}

document.observe('cartagen:init', Glop.init.bindAsEventListener(Glop))

//= require "tasks"
//= require "timer"
//= require "events"
//= require "canvas"
//= require "canvastext"
