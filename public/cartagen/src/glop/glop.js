/**
 * @namespace The base of the interface between javascript and the canvas element. GLOP is a general javascript/canvas drawing system.
 */
var Glop = {
	/**
	 * The number of frames that have been drawn.
	 * @type Number
	 */
	frame: 0,
	/**
	 * The startup time in milliseconds since... 1970?
	 * @type Number
	 */
	start_time: 0,
	/**
	 * The current time in milliseconds since... 1970?
	 * @type Number
	 */
	timestamp: 0,
	/**
	 * The last 100 frames worth of timestamps, used to calculate fps.
	 * @type Number
	 */
	times: [],
	/**
	 * The framerate over the last 10 seconds.
	 * @type Number
	 */
	fps: 0,
	/**
	 * Whether the Glop environment has changed x,y size since the last frame.
	 * @type Boolean
	 */
	changed_size: 0,
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
	 * Binds all events to the main canvas. Use Glop.observe for all events.
	 */
	observe: function(a,b,c) {
		$('main').observe(a,b,c)
	},
	/**
	 * Binds all events to the main canvas. Use Glop.observe for all events.
	 */
	fire: function(a,b,c) {
		$('main').fire(a,b,c)
	},
	/**
	 * Binds all events to the main canvas. Use Glop.observe for all events.
	 */
	stopObserving: function(a,b,c) {
		$('main').stopObserving(a,b,c)
	},
	/**
	 * Sets up powersaving.
	 */
	init: function() {
		// seconds between redraws:
		// new PeriodicalExecuter(Glop.draw_powersave, 0.1)
		TimerManager.setup(Glop.draw_powersave,this)
	},
	/**
	 * Used to check if anything has changed since the last frame
	 */
	snapshot: '',
	/**
	 * Draws a frame. Sets height/width, moves the map as needed, fires draw events, and draws
	 * the object array unless told not to (by  subscriber of glop:draw.
	 */
	draw: function(custom_size, force_draw) {
		if (Glop.paused && (force_draw != true)) {
			Glop.fire('glop:predraw')
			return
		}

		Glop.timestamp = Glop.date.getTime()
		Glop.times.unshift(Glop.timestamp)
		// the last 100 frames
		if (Glop.times.length > 100) Glop.times.pop()
		Glop.fps = parseInt(Glop.times.length/(Glop.timestamp - Glop.times.last())*1000)
		
		// clear only if anything's changed!
		var new_snapshot = Map.x +','+ Map.x_old +','+ Map.y +','+ Map.y_old +','+ Map.rotate +','+ Map.rotate_old +','+ Map.zoom +','+ Map.old_zoom

		// consider thawing background:
		//      a) if there are remaining tasks to be completed
		//		b) measuring whether a canvas has been drawn on, or drawn 'completely'
		if (new_snapshot != Glop.snapshot || force_draw || Glop.changed_size) {
			$C.thaw('background')
		} else {
			$C.freeze('background')
		}
		Glop.snapshot = new_snapshot
		
		Glop.resize(custom_size)
	
		// for embedded
		//Glop.width = $C.element.getWidth()
		//Glop.height = $C.element.getHeight()
		//$C.element.width = Glop.width
		//$C.element.height = Glop.height
		Events.drag()	
		/**
		 * @name Glop#glop:predraw
		 * @event
		 * Fired each frame before features are drawn.
		 */
		Glop.fire('glop:predraw')
		/**
		 * @name Glop#glop:draw
		 * @event
		 * Fired each frame between glop:predraw and glop:postdraw. SHould be used
		 * to draw features on the canvas. If the 'no_draw' property of the event
		 * is set to true, GLOP will not raw the objects array.
		 */
		draw_event = $('main').fire('glop:draw')
		if (Config.vectors && !draw_event.no_draw) {
			objects.each(function(object) { 
				object.draw()
			})
		}
		
		/**
		 * @name Glop#glop:postdraw
		 * @event
		 * Fired at the end of each frame, after features are drawn.
		 */
		Glop.fire('glop:postdraw')
	},
	/**
	 * Adjusts size of canvas element to match browser window size
	 * @return Color in rgb(r, g, b) format
	 * @type String
	 */
	resize: function(custom_size) {
		if (!custom_size) { // see Canvas.to_print_data_url()
			Glop.changed_size = (Glop.width != document.viewport.getWidth() || Glop.height != document.viewport.getHeight()-Config.padding_top)
			$l(Glop.changed_size)
			Glop.width = document.viewport.getWidth()
			Glop.height = document.viewport.getHeight()-Config.padding_top
		}
		$C.canvases.each(function(canvas) {
			if ($C.freezer.get(canvas.key) != true || Glop.changed_size) {
			// we miss the initial draw before freezing
			// if ($(canvas.key).width != Glop.width || $(canvas.key).height != Glop.height) {
				// $l()
				$(canvas.key).width = Glop.width
				$(canvas.key).height = Glop.height
			}
		})
		$$('body')[0].style.width = Glop.width+"px"
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
			Glop.frame += 1
		} else {
			Glop.times = []
		} //else $l('powersave: '+this.tail)
		// $l('tail:'+this.tail)
		Glop.date = new Date
	}
}

document.observe('cartagen:init', Glop.init.bindAsEventListener(Glop))

//= require "tasks"
//= require "timer"
//= require "events"
//= require "canvas"
//= require "canvastext"
