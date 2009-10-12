/* cartagen.js
 *
 * Copyright (C) 2009 Jeffrey Warren, Design Ecology, MIT Media Lab
 *
 * This file is part of the Cartagen mapping framework. Read more at
 * <http://cartagen.org>
 *
 * Cartagen is free software: you can redistribute it and/or modify
 * it under the terms of the MIT License. You should have received a copy
 * of the MIT License along with Cartagen.  If not, see
 * <http://www.opensource.org/licenses/mit-license.php>.
 */
 
/* The following sections (until "BEGIN CARTAGEN") are not part of Cartagen. They are, however, 
 * also available under an MIT license.
 */

/* **** BEGIN PROTOTYPE **** */

//= require <../lib/prototype>

/* **** END PROTOTYPE **** */


/* **** BEGIN GEOHASH **** */

//= require <../lib/geohash>

/* **** END GEOHASH **** */


/* **** BEGIN LIVEPIPE **** */

//= require <../lib/context-menus/livepipe>
//= require <../lib/context-menus/contextmenu>

/* **** END LIVEPIPE **** */


/* **** BEGIN CARTAGEN **** */

//= require <config/config>
 
/**
 * Array of all objects that should be drawn.
 * @type Feature[]
 * @deprecated
 */
var objects = []

// temp object unitl PhoneGap is initialized.
PhoneGap = window.DeviceInfo && DeviceInfo.uuid != undefined

if (typeof cartagen_base_uri == 'undefined') {
	/**
	 * Path to the cartagen directory. Defaults to "cartagen", which works only
	 * if the cartagen directory is named "cartagen" and is located in the
	 * same directoy as the current page. This should be set before Cartagen
	 * is loaded if it needs to be changed.
	 * 
	 * @type String
	 */
    cartagen_base_uri = 'cartagen'
}

// if (Prototype.Browser.MobileSafari) $('brief').hide()

/**
 * @namespace
 * Namespace for methods and variables that manage Cartagen as a whole, i.e. loading
 * data and creating Nodes and Ways.
 */
var Cartagen = {
	/**
	 * Queue of labels to draw
	 * @type Label[]
	 */
	label_queue: [],
	/**
	 * Queue of features to be drawn at the end of draw()
	 */
	feature_queue: [],
	/**
	 * An array of scripts that will be loaded when Cartagen is initialized.
	 * 
	 * @type String[]
	 * @see Cartagen.initialize
	 */
	scripts: [],
	/**
	 * Registers initialize to run with the given configs when window is loaded
	 * @param {Object} configs A set of key/value pairs that will be copied to the Cartagen object
	 */
	setup: function(configs) {
		$(document).observe('dom:loaded', function() {
			Cartagen.initialize(configs)
		})	
	},
	/**
	 * Performs initialization tasks, mainly fetching map data. This should never be called directly,
	 * rather it is intended to be called by setup
	 * @param {Object} configs A set of key/value pairs that will be copied to the Cartagen object
	 */
	initialize: function(configs) {
		Config.init(configs)
		// load phonegap js if needed
		if (window.PhoneGap) {
			Cartagen.scripts.unshift(cartagen_base_uri + '/lib/phonegap/phonegap.base.js',
						             cartagen_base_uri + '/lib/phonegap/geolocation.js',
						             cartagen_base_uri + '/lib/phonegap/iphone/phonegap.js',
						             cartagen_base_uri + '/lib/phonegap/iphone/geolocation.js')
		}

		// load extra scripts:
		Cartagen.load_next_script()
		
		// browser stuff:
		this.browser_check()
		
		//if (Prototype.Browser.MobileSafari) window.scrollTo(0, 1) //get rid of url bar
		
		/**
		 * @name Cartagen#cartagen:init
		 * @event
		 * Fired after Cartagen loads its configuration and the contents of 
		 * Cartagen.scripts, but before any features are loaded or drawn.
		 * Note that Cartagen.scripts are loaded asynchronously, so it is not
		 * guarenteed that they will be finished loading.
		 */
		document.fire('cartagen:init')
		
		// bind event listeners
		$('canvas').observe('glop:draw', Cartagen.draw.bindAsEventListener(this))
		$('canvas').observe('glop:postdraw', Cartagen.post_draw.bindAsEventListener(this))

		// Startup:
		Style.load_styles(Config.stylesheet) // stylesheet
		
		if (!Config.static_map) {
			Importer.get_current_plot(true)
			new PeriodicalExecuter(Glop.trigger_draw,3)
			new PeriodicalExecuter(function() { Importer.get_current_plot(false) },3)
		}// else {
			$l('getting statics')
			Config.static_map_layers.each(function(layer_url) {
				$l('fetching '+layer_url)
				Importer.get_static_plot(layer_url)
			},this)
			// to add user-added map data... messy!
			if (Config.dynamic_layers.length > 0) {
				Config.dynamic_layers.each(function(layer_url) {
					load_script(layer_url)
				},this)
			}
		// }
		
		Glop.trigger_draw()
		
		/**
		 * @name cartagen:postinit
		 * @event
		 * Fired after Caragen loads map data.
		 */
		document.fire('cartagen:postinit')
	},
	/**
	 * Runs every frame in the draw() method. An attempt to isolate cartagen code from general GLOP code.
	 * Uses Geohash to draw each feature on the map.
	 * @param {Event} e The Glop draw event.
	 */
	draw: function(e) {
		e.no_draw = true

		if (Prototype.Browser.MobileSafari || window.PhoneGap) Config.simplify = 2
		Style.style_body()
        if (Viewport.padding > 0) {
            $C.stroke_style('white')
            $C.line_width(2)
            $C.stroke_rect(Viewport.padding, Viewport.padding, Glop.width - (Viewport.padding * 2), Glop.height - (Viewport.padding * 2))
        }
        
        $C.translate(Glop.width / 2, Glop.height / 2)
        $C.rotate(Map.rotate)
        $C.scale(Map.zoom, Map.zoom)
        $C.translate(-Map.x,-Map.y)
        
		Viewport.draw() //adjust viewport
		
		/**
		 *@name Cartagen#cartagen:predraw
		 *Fires just before features are drawn
		 *@event
		 */
		$('canvas').fire('cartagen:predraw')
		
		//Geohash lookup:
		Geohash.objects.each(function(object) {
			if (object.user_submitted) {
				Cartagen.feature_queue.push(object)
			}
			else {
				try {
				object.draw()
				} catch(e) {$l(e)}
			}
		})

		this.feature_queue.each(function(item) {
			(item.draw.bind(item))()
		})
		this.feature_queue = []

		if (Prototype.Browser.MobileSafari || window.PhoneGap) User.mark()
	},
    /**
     * Runs every frame, after everything else has been done.
     */
    post_draw: function() {
        this.label_queue.each(function(item) {
            item[0].draw(item[1], item[2])
        })

		this.label_queue = []

		/**
		 *@name Cartagen#cartagen:predraw
		 *Fires just after labels are drawn
		 *@event
		 */
		$('canvas').fire('cartagen:postdraw')
		
		// display percentage of features we've imported so far:
		Interface.display_loading(Importer.parse_manager.completed)
		
    },
    /**
     * Adds the label to the list of labels to be drawn during post_draw
     * @param {Label}  label The label to draw
     * @param {Number} x     x-coord
     * @param {Number} y     y-coord
     */
    queue_label: function(label, x, y) {
        this.label_queue.push([label, x, y])
    },
	/**
	 * Show alert if it's IE.
	 */
	browser_check: function() {
		if ($('browsers')) {
			$('browsers').absolutize();
			$('browsers').style.top = "100px";
			$('browsers').style.margin = "0 auto";
			if (Prototype.Browser.IE) $('browsers').show();
		}
	},
	/**
	 * Repositions Cartagen to center on lat,lon with given zoom level
     * @param {Number} lat     latitude to center the map on
     * @param {Number} lon     longitude to center the map on
     * @param {Number} zoom_level     zoom_level to set the map to
	 */
	go_to: function(lat,lon,zoom_level) {
		Map.zoom = zoom_level
		Map.lat = lat
		Map.lon = lon
		Map.x = Projection.lon_to_x(Map.lon)
		Map.y = Projection.lat_to_y(Map.lat)
	},
	/**
	 * Searches all objects by tags, and sets highlight=true for all matches.
	 * 
	 * @param {Object} query The tag to search for
	 */
	highlight: function(query) {
		Geohash.objects.each(function(object) {
			object.highlight = false
			if (query != "" && object.tags && object instanceof Way) {
				object.tags.each(function(tag) {
					if (tag.key.toLowerCase().match(query.toLowerCase()) || tag.value.toLowerCase().match(query.toLowerCase())) {
						object.highlight = true
					}
				})
				if (object.user && object.user.toLowerCase().match(query.toLowerCase())) object.highlight = true
				if (object.description && object.description.toLowerCase().match(query.toLowerCase())) object.highlight = true
			}
		})
	},
	/**
	 * Shows the live GSS editor. Generally only for cartgen.org.
	 */
	show_gss_editor: function() {
		$('description').hide()
		$('brief').style.width = '28%'
		$('brief_first').style.width = '92%';
		$('gss').toggle()
		Config.live_gss = !Config.live_gss
	},
	/**
	 * Sends user to an image of the current canvas
	 */
	redirect_to_image: function() {
		try {
				window.open($C.to_data_url())
			} catch(e) {
				alert("Sorry, this stylesheet uses remote images; JavaScript does not allow these to be used to generate an image.")
		}
	},
	/**
	 * Loads each script in scripts array, sequentially.
	 * Requires a load_next_script() call at the end of each
	 * dependent script to trigger the next one.
	 */
	load_next_script: function() {
		$l("loading: "+Cartagen.scripts[0])
		if (Cartagen.scripts.length > 0) {
			Cartagen.load_script(Cartagen.scripts.splice(0,1)[0])
		}
	},
	/**
	 * Loads a script into <script src="" /> tags, no cross-domain limits.
	 * @param {String} script Path to the script
	 */
	load_script: function(script) {
		$$('head')[0].insert(new Element('script', { 
			'src': script, 
			'type': 'text/javascript', 
			'charset': 'utf-8', 
			evalJSON: 'force' 
		}));
	},
	/**
	 * Loads data from a local KML file and dumps it into the Geohash object.
	 * @param {String} url Path to the data file
	 */
	import_kml: function(url) {
		new Ajax.Request(url,{
			method: 'get',
			onComplete: function(result) {
				$l('completed load of KML')
				response = result
				$l(xml2json.xml_to_object(result.responseText))
				$l('completed import of KML')
			}
		})
		
	}
}

//= require <util/util>
//= require <config/style>
//= require <data/feature>
//= require <glop/glop>
//= require <interface/interface>
//= require <mapping/map>
