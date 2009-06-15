/**
 * @namespace
 * Namespace for methods and variables that manage Cartagen as a whole, i.e. loading
 * data and creating Nodes and Ways.
 */
var Cartagen = {
	/** 
	 * The number of objects drawn during the current frame.
	 * @type Number
	 */
	object_count: 0,
	/** 
	 * The number of ways drawn during the current frame.
	 * @type Number
	 */
	way_count: 0,
	/**
	 * The number of nodes drawn during the current frame, including nodes
	 *  that are part of a way but are not drawn.
	 *  @type Number
	 */
	node_count: 0,
	/** 
	 * The number of plots that have been requested, but have not been loaded yet.
	 * @type Number
	 */
	requested_plots: 0,
	/**
	 * The path to the stylesheet that GSS will be loaded from. 
	 * @type String
	 */
	stylesheet: "/style.gss",
	/**
	 * If true, we are loading live data. Else, we are loading static data.
	 * @type Boolean
	 */
	live: false,
	/**
	 * When true, only draws when needed, rather than as much as possible.
	 * @type Boolean
	 */
	powersave: true,
	/**
	 * The smallest (farthest out) the zoom level can become.
	 * @type Number
	 */
	zoom_out_limit: 0.02,
	/**
	 * Currently unused.
	 * @type Number
	 */
	zoom_in_limit: 0,
	/**
	 * When drawing ways, only 1/simplify nodes will be used - so a value
	 * of 2 would mean that only half of nodes are used to draw ways (and
	 * the other half are skipped). Can help on slower computers.
	 * @type Number 
	 */
	simplify: 1,
	/**
	 * When true, a live gss editor is active. Generally only used for cartagen.org.
	 * @type Boolean
	 */
	live_gss: false, // this is for inline gss editing, generally only on cartagen.org
	/**
	 * If true, map data is no dynamic and does not need to be reloaded periodically.
	 * @type Boolean
	 */
	static_map: true,
	/**
	 * Path to layers that will be statically loaded on initialization. This should be
	 * overriden by the user in the arguments passed to {@link setup}
	 * @type String[]
	 */
	static_map_layers: ["/static/rome/park.js"],
	/**
	 * URIs of layers that will be refreshed periodically.
	 * @type String[]
	 */
	dynamic_layers: [],
	/**
	 * ???
	 */
	range: 0.001,
	/**
	 * Upper bound of map
	 * @type Number
	 */
	lat1: 41.9227,
	/**
	 * Lower bound of map
	 * @type Number
	 */
	lat2: 41.861,
	/**
	 * Left bound of map
	 * @type Number
	 */
	lng1: 12.4502,
	/**
	 * Right bound of map
	 * @type Number
	 */
	lng2: 12.5341,
	/**
	 * Current zoom level
	 * @type Number
	 */
	zoom_level: 0.1,
	/**
	 * Hash of bbox => features
	 * @type Hash
	 */
	plots: new Hash(),
	/**
	 * Hash of node id => node
	 * @type Hash
	 */
	nodes: new Hash(),
	/**
	 * Hash of way id => way
	 * @type Way
	 */
	ways: new Hash(),
	/**
	 * Should Cartagen expand to fill the browser window?
	 * @type Boolean
	 */
	fullscreen: true,
	/**
	 * The amound of bleed to use when requesting plots
	 * @type Number
	 * @see initial_bleed_level
	 */
	bleed_level: 1,
	/**
	 * How much plots bleed on the initial pageload
	 * @type Number
	 * @see bleed_level
	 */
	initial_bleed_level: 2,
	/**
	 * Queue of labels to draw
	 * @type Array
	 */
    label_queue: [],
	/**
	 * Should deebug messages be sent to the console?
	 * @type Boolean
	 */
    debug_mode: typeof console != "undefined",
	/**
	 * Registers {@link initialize} to run with the given configs when window is loaded
	 * @param {Object} configs A set of key/value pairs that will be copied to the Cartagen object
	 */
	setup: function(configs) {
		// geolocate with IP if available
		if (navigator.geolocation) navigator.geolocation.getCurrentPosition(User.set_loc)
		// wait for window load:
		Event.observe(window, 'load', this.initialize.bind(this,configs))
	},
	/**
	 * Performs initialization tasks, mainly fetching map data. This should never be called directly,
	 * rather it is intended to be registed as a callback for window.onload by {@link setup}
	 * @param {Object} configs A set of key/value pairs that will be copied to the Cartagen object
	 */
	initialize: function(configs) {
		glop_init()
		events_init()
		canvas_init()
		// queue dependencies:
		Cartagen.load_next_script()
		this.browser_check()
		//if (Prototype.Browser.MobileSafari) window.scrollTo(0, 1) //get rid of url bar
		// draw on window resize:
		Event.observe(window, 'resize', function() {try{draw()}catch(e){}});
		// we can override right-click:
		// Event.observe(window, 'oncontextmenu', function() { return false })

		Object.keys(configs).each(function(key,index) {
			this[key] = Object.values(configs)[index]
			// Cartagen.debug('configuring '+key+': '+this[key])
		},this)
		
		if (this.get_url_param('gss')) this.stylesheet = this.get_url_param('gss')

		Map.initialize()
		// Startup:
		Style.load_styles(this.stylesheet) // stylesheet
		if (!this.static_map) {
			this.get_cached_plot(this.lat1,this.lng1,this.lat2,this.lng2,Cartagen.initial_bleed_level)
			new PeriodicalExecuter(this.get_current_plot,0.33)
		} else {
			// if (Prototype.Browser.MobileSafari) {
			// 	this.get_static_plot(this.static_map_layers[0])
			// 	this.get_static_plot(this.static_map_layers[1])
			// } else {
				this.static_map_layers.each(function(layer_url) {
					Cartagen.debug('fetching '+layer_url)
					this.get_static_plot(layer_url)
				},this)
				// to add user-added map data... messy!
				if (this.dynamic_layers.length > 0) {
					this.dynamic_layers.each(function(layer_url) {
						Cartagen.debug('fetching '+layer_url)
						load_script(layer_url)
					},this)
				}
			// }
		}
		User.update()
		new PeriodicalExecuter(User.update, 60)
	},
	/**
	 * Runs every frame in the draw() method. An attempt to isolate cartagen code from general GLOP code.
	 * Uses {@link Geohash} to draw each feature on the map.
	 */
	draw: function() {
		this.object_count = 0
		this.way_count = 0
		this.node_count = 0
		Map.draw()
		if (Prototype.Browser.MobileSafari || window.PhoneGap) Cartagen.simplify = 2
		
		Style.style_body()
			
        
        if (Viewport.padding > 0) {
            strokeStyle('white')
            lineWidth(2)
            strokeRect(Viewport.padding, Viewport.padding, width - (Viewport.padding * 2), height - (Viewport.padding * 2))
        }
        
        translate(width / 2, height / 2)
        rotate(Map.rotate)
        scale(Cartagen.zoom_level, Cartagen.zoom_level)
        translate(width / -2, height / -2)
        translate((-1 * Map.x) + (width / 2), (-1 * Map.y) + (height / 2))
        
        // viewport stuff:
        Viewport.width = width * (1 / Cartagen.zoom_level) - (2 * Viewport.padding * (1 / Cartagen.zoom_level))
        Viewport.height = height * (1 / Cartagen.zoom_level) - (2 * Viewport.padding * (1 / Cartagen.zoom_level))
        // culling won't work anymore after we fixed rotation...
        Viewport.width = Math.max(Viewport.width, Viewport.height)
        Viewport.height = Viewport.width
        Viewport.bbox = [Map.y - Viewport.height / 2, Map.x - Viewport.width / 2, Map.y + Viewport.height / 2, Map.x + Viewport.width / 2]
        // strokeRect(Map.x-Viewport.width/2,Map.y-Viewport.height/2,Viewport.width,Viewport.height)
		
		//Geohash lookup:
		Geohash.draw()
		Geohash.objects.each(function(object) { 
			object.draw()
		})
	},
    /**
     * Runs every frame, after everything else has been done.
     */
    post_draw: function() {
        this.label_queue.each(function(item) {
            item[0].draw(item[1], item[2])
        })
		this.label_queue = []
    },
    /**
     * Adds the label to the list of labels to be drawn during {@link post_draw}
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
	 * Returns a GET parameter.
	 * @param {String} name The name of the parameter.
	 */
	get_url_param: function(name) {  
		name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");  
		var regexS = "[\\?&]"+name+"=([^&#]*)";  
		var regex = new RegExp( regexS );  
		var results = regex.exec( window.location.href );  
		if( results == null )    return "";  
		else return results[1];
	},
	/**
	 * Compared two ways based on area
	 * @param {Way} a
	 * @param {Way} b
	 */
	sort_by_area: function(a,b) {
		if (a instanceof Way) {
			if (b instanceof Way) {
				if ( a.area < b.area )
			    return 1;
			  if ( a.area > b.area )
			    return -1;
			  return 0; // a == b
			} else {
				return -1 // a wins no matter what if b is not a Way
			}
		} else {
			return 1 // b wins no matter what if a is not a Way
		}
	},
	/**
	 * Parses feature data and creates Way and Node objects, registering them with
	 * {@link Geohash}
	 * @param {Object} data OSM data to parse
	 */
	parse_objects: function(data) {
		data.osm.node.each(function(node){
	        var n = new Node
			n.h = 10
			n.w = 10
			n.color = randomColor()
			n.timestamp = node.timestamp
			n.user = node.user
			n.id = node.id
			n.lat = node.lat
			n.lon = node.lon
			n.x = Projection.lon_to_x(n.lon)
			n.y = Projection.lat_to_y(n.lat)
			Style.parse_styles(n,Style.styles.node)
			// can't currently afford to have all nodes in the map as well as all ways.
			// but we're missing some nodes when we render... semantic ones i think. cross-check.
			// objects.push(n)
			Cartagen.nodes.set(n.id,n)
	    })
		data.osm.way.each(function(way){
			if (Cartagen.live || !Cartagen.ways.get(way.id)) {
				var data = {
					id: way.id,
					user: way.user,
					timestamp: way.timestamp,
					nodes: [],
					tags: new Hash()
				}
				if (way.name) data.name = way.name
				way.nd.each(function(nd, index) {
					if ((index % Cartagen.simplify) == 0 || index == 0 || index == way.nd.length-1 || way.nd.length <= Cartagen.simplify*2)  {
						node = Cartagen.nodes.get(nd.ref)
						if (!Object.isUndefined(node)) data.nodes.push(node)
					}
				})
				if (way.tag instanceof Array) {
					way.tag.each(function(tag) {
						data.tags.set(tag.k,tag.v)
					})
				} else {
					data.tags.set(way.tag.k,way.tag.v)
				}
				new Way(data)
			}
		})
		// data.osm.relation.each(function(way){
		// 	var w = new Way
		// 	w.id = way.id
		// 	w.user = way.user
		// 	w.timestamp = way.timestamp
		// 	w.nodes = []
		// 	way.nd.each(function(nd){
		// 		//find the node corresponding to nd.ref
		// 		try {
		// 			w.nodes.push([nodes.get(nd.ref).x,nodes.get(nd.ref).y])
		// 		} catch(e) {
		// 			// alert(nd.ref)
		// 		}
		//
		// 	})
		// 	way.tag.each(function(tag) {
		// 		w.tags.push([tag.k,tag.v])
		// 	})
		// 	objects.push(w)
		// })

		// sort by polygons' node count:
		objects.sort(Cartagen.sort_by_area)
	},
	/**
	 * Gets the plot under the current center of the viewport
	 */
	get_current_plot: function() {
		if (Map.x != Map.last_pos[0] && Map.y != Map.last_pos[1]) {
			var new_lat1,new_lat2,new_lng1,new_lng2
			new_lat1 = Projection.y_to_lat(Map.y)-range
			new_lng1 = Projection.x_to_lon(Map.x)-range
			new_lat2 = Projection.y_to_lat(Map.y)+range
			new_lng2 = Projection.x_to_lon(Map.x)+range
			// this will look for cached plots, or get new ones if it fails
			Cartagen.get_cached_plot(new_lat1,new_lng1,new_lat2,new_lng2,Cartagen.bleed_level)
		}
		Map.last_pos[0] = Map.x
		Map.last_pos[1] = Map.y
	},
	/**
	 * Fetches a JSON plot from a static file, given a full url.
	 */
	get_static_plot: function(url) {
		Cartagen.debug('fetching ' + url)
		Cartagen.requested_plots++
		new Ajax.Request(url,{
			method: 'get',
			onComplete: function(result) {
				// Cartagen.debug(result.responseText.evalJSON().osm.ways.length+" ways")
				Cartagen.debug('got ' + url)
				Cartagen.parse_objects(result.responseText.evalJSON())
				Cartagen.debug(objects.length+" objects")
				Cartagen.requested_plots--
				if (Cartagen.requested_plots == 0) last_event = frame
				Cartagen.debug("Total plots: "+Cartagen.plots.size()+", of which "+Cartagen.requested_plots+" are still loading.")
			}
		})
	},
	/** 
	 * Reduces precision of a plot request to quantize plot requests,
	 * checks against local storage for browers with HTML 5,
	 * then fetches the plot and parses the data into the objects array.
	 */
	get_cached_plot: function(_lat1,_lng1,_lat2,_lng2,_bleed) {
		plot_precision = 0.001
		_lat1 = _lat1.to_precision(plot_precision)
		_lng1 = _lng1.to_precision(plot_precision)
		_lat2 = _lat2.to_precision(plot_precision)
		_lng2 = _lng2.to_precision(plot_precision)
		var cached = false

		// Remember that parse_objects() will fill localStorage.
		// We can't do it here because it's an asychronous AJAX call.

		// if we're not live-loading:
		if (!Cartagen.live) {
			// check if we've loaded already this session:
			if (Cartagen.plots.get(_lat1+","+_lng1+","+_lat2+","+_lng2) && Cartagen.plots.get(_lat1+","+_lng1+","+_lat2+","+_lng2)[0]) {
				// no live-loading, so:
				Cartagen.debug("already loaded plot")
			} else {
				// if we haven't, check if HTML 5 localStorage exists in this browser:
				if (typeof localStorage != "undefined") {
					var ls = localStorage.getItem(_lat1+","+_lng1+","+_lat2+","+_lng2)
					if (ls) {
						Cartagen.plots.set(_lat1+","+_lng1+","+_lat2+","+_lng2,[true,_bleed])
						Cartagen.debug("localStorage cached plot")
						Cartagen.parse_objects(ls)
					} else {
						// it's not in the localStorage:
						Cartagen.load_plot(_lat1,_lng1,_lat2,_lng2)
					}
				} else {
					// not loaded this session and no localStorage, so:
					Cartagen.load_plot(_lat1,_lng1,_lat2,_lng2)
					Cartagen.plots.set(_lat1+","+_lng1+","+_lat2+","+_lng2,[true,_bleed])
				}
			}
			// if the bleed level of this plot is > 0
			if (_bleed > 0) {
				Cartagen.debug('bleeding to neighbors with bleed = '+_bleed)
				// bleed to 8 neighboring plots, decrement bleed:
				Cartagen.delayed_get_cached_plot(_lat1+plot_precision,_lng1+plot_precision,_lat2+plot_precision,_lng2+plot_precision,_bleed-1)
				Cartagen.delayed_get_cached_plot(_lat1-plot_precision,_lng1-plot_precision,_lat2-plot_precision,_lng2-plot_precision,_bleed-1)

				Cartagen.delayed_get_cached_plot(_lat1+plot_precision,_lng1,_lat2+plot_precision,_lng2,_bleed-1)
				Cartagen.delayed_get_cached_plot(_lat1,_lng1+plot_precision,_lat2,_lng2+plot_precision,_bleed-1)

				Cartagen.delayed_get_cached_plot(_lat1-plot_precision,_lng1,_lat2-plot_precision,_lng2,_bleed-1)
				Cartagen.delayed_get_cached_plot(_lat1,_lng1-plot_precision,_lat2,_lng2-plot_precision,_bleed-1)

				Cartagen.delayed_get_cached_plot(_lat1-plot_precision,_lng1+plot_precision,_lat2-plot_precision,_lng2+plot_precision,_bleed-1)
				Cartagen.delayed_get_cached_plot(_lat1+plot_precision,_lng1-plot_precision,_lat2+plot_precision,_lng2-plot_precision,_bleed-1)
			}
		} else {
			// we're live-loading! Gotta get it no matter what:
			load_plot(_lat1,_lng1,_lat2,_lng2)
		}
	},	
	/**
	 * Peforms get_cached_plot() with a randomized delay of between 1 and 3 seconds.
	 * 
	 * This prevents a zillion requests to the server at the same time and is useful for live viewing.
	 * For viewing page_cached plots, it doesn't matter.
	 * 
	 * @param {Number} _lat1  Upper bound
	 * @param {Number} _lng1  Left bound
	 * @param {Number} _lat2  Lower bound
	 * @param {Number} _lng2  Right bound
	 * @param {Number} _bleed Amount of bleed
	 */
	delayed_get_cached_plot: function(_lat1,_lng1,_lat2,_lng2,_bleed) {
		bleed_delay = 1000+(2000*Math.random(_lat1+_lng1)) //milliseconds, with a random factor to stagger requests
		setTimeout("get_cached_plot("+_lat1+","+_lng1+","+_lat2+","+_lng2+","+_bleed+")",bleed_delay)
	},
	/**
	 * Requests a JSON plot for a bbox from the server
	 * 
	 * @param {Number} _lat1  Upper bound
	 * @param {Number} _lng1  Left bound
	 * @param {Number} _lat2  Lower bound
	 * @param {Number} _lng2  Right bound
	 */
	load_plot: function(_lat1,_lng1,_lat2,_lng2) {
		Cartagen.requested_plots++
		new Ajax.Request('/map/plot.js?lat1='+_lat1+'&lng1='+_lng1+'&lat2='+_lat2+'&lng2='+_lng2+'',{
			method: 'get',
			onComplete: function(result) {
				Cartagen.parse_objects(result.responseText.evalJSON())
				Cartagen.requested_plots--
				if (Cartagen.requested_plots == 0) last_event = frame
				Cartagen.debug("Total plots: "+Cartagen.plots.size()+", of which "+Cartagen.requested_plots+" are still loading.")
			}
		})
	},
	/**
	 * Searches all objects by tags, and sets highlight=true for all matches.
	 * 
	 * @param {Object} query The tag to search for
	 */
	highlight: function(query) {
		objects.each(function(object) {
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
		Cartagen.live_gss = !Cartagen.live_gss
	},
	/**
	 * Sends user to an image of the current canvas
	 */
	redirect_to_image: function() {
		document.location = canvas.canvas.toDataURL();
	},
    debug: function(msg) {
    	if (Cartagen.debug_mode) {
        	if (typeof console != 'undefined') console.log(msg)
        	if (typeof window.debug != 'undefined') window.debug.log(msg)
    	}
    },
	/**
	 * Loads each script in scripts array, sequentially.
	 * Requires a load_next_script() call at the end of each
	 * dependent script to trigger the next one.
	 */
	load_next_script: function() {
		Cartagen.debug("loading: "+scripts[0])
		if (scripts.length > 0) {
			Cartagen.load_script(scripts.splice(0,1)[0])
		}
	},
	/**
	 * Loads a script into <script> tags, no cross-domain limits.
	 * @param {String} script Path to the script
	 */
	load_script: function(script) {
		$$('head')[0].insert(new Element('script', { 'src': script, 'type': 'text/javascript', 'charset': 'utf-8', evalJSON: 'force' }));
	}
}