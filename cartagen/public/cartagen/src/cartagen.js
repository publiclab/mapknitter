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

/**
 * Array of all objects that should be drawn.
 * @type Feature[]
 * @deprecated
 */
var objects = []

PhoneGap = window.DeviceInfo && DeviceInfo.uuid != undefined // temp object unitl PhoneGap is initialized

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
	live_gss: false,
	/**
	 * If true, map data is no dynamic and does not need to be reloaded periodically.
	 * @type Boolean
	 */
	static_map: true,
	/**
	 * Path to layers that will be statically loaded on initialization. This should be
	 * overriden by the user in the arguments passed to setup
	 * @type String[]
	 */
	static_map_layers: ["/static/rome/park.js"],
	/**
	 * URIs of layers that will be refreshed periodically.
	 * @type String[]
	 */
	dynamic_layers: [],
	/**
	 * precision of latitude/longitude requests,
	 */
	precision: 0.001,
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
	zoom_level: 0.5,
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
	 * Hash of relation id => relation
	 * @type Relation
	 */
	relations: new Hash(),
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
	 * @type Label[]
	 */
	label_queue: [],
	/**
	 * Queue of features to be drawn at the end of draw()
	 */
	feature_queue: [],
	/**
	 * Should deebug messages be sent to the console?
	 * @type Boolean
	 */
        debug: false,
	/**
	 * An array of scripts that will be loaded when Cartagen is initialized.
	 * 
	 * @type String[]
	 * @see Cartagen.initialize
	 */
	scripts: [],
	/**
	 * Whether to load user-submitted nodes and ways from the database
	 * @type Boolean
	 */
	load_user_features: false,
	/**
	 * Array of coastline ways to be assembled occasionally into coastline 'collected way' relations
	 */
	coastlines: [],
	/**
	 * Array of nodes of coastlines within the viewport, combining multiple 
	 * coastlines and the viewport corners where applicable; used to 
	 * 'walk' around the viewport. Solves peninsula/estuary problem where 
	 * multiple unconnected coastlines enter the viewport and must be reconciled
	 */
	coastline_nodes: [],
	/**
	 * Registers initialize to run with the given configs when window is loaded
	 * @param {Object} configs A set of key/value pairs that will be copied to the Cartagen object
	 */
	setup: function(configs) {
		// geolocate with IP if available
		if (navigator.geolocation) navigator.geolocation.getCurrentPosition(User.set_loc)
		// wait for window load:
		// Event.observe(window, 'load', this.initialize.bind(this,configs))
		this.initialize(configs)
	},
	/**
	 * Performs initialization tasks, mainly fetching map data. This should never be called directly,
	 * rather it is intended to be registed as a callback for window.onload by setup
	 * @param {Object} configs A set of key/value pairs that will be copied to the Cartagen object
	 */
	initialize: function(configs) {
		// basic configuration:
		Object.extend(this, configs)
		if (Cartagen.debug) {
			Geohash.grid = true
		}

		if (this.get_url_param('gss')) this.stylesheet = this.get_url_param('gss')
		
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
		Style.load_styles(this.stylesheet) // stylesheet
		if (!this.static_map) {
			this.get_current_plot(true)
			new PeriodicalExecuter(Glop.draw,3)
			new PeriodicalExecuter(function() { Cartagen.get_current_plot(false) },3)
		} else {
			this.static_map_layers.each(function(layer_url) {
				$l('fetching '+layer_url)
				this.get_static_plot(layer_url)
			},this)
			// to add user-added map data... messy!
			if (this.dynamic_layers.length > 0) {
				this.dynamic_layers.each(function(layer_url) {
					$l('fetching '+layer_url)
					load_script(layer_url)
				},this)
			}
		}
		
		Glop.draw()
		
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
		$l('drawing')
		
		this.object_count = 0
		this.way_count = 0
		this.node_count = 0

		if (Prototype.Browser.MobileSafari || window.PhoneGap) Cartagen.simplify = 2
		
		Style.style_body()
			
        if (Viewport.padding > 0) {
            $C.stroke_style('white')
            $C.line_width(2)
            $C.stroke_rect(Viewport.padding, Viewport.padding, Glop.width - (Viewport.padding * 2), Glop.height - (Viewport.padding * 2))
        }
        
        $C.translate(Glop.width / 2, Glop.height / 2)
        $C.rotate(Map.rotate)
        $C.scale(Cartagen.zoom_level, Cartagen.zoom_level)
        $C.translate((Glop.width / -2) + (-1 * Map.x) + (Glop.width / 2), (Glop.height / -2)+(-1 * Map.y) + (Glop.height / 2))
        
		Viewport.draw() //adjust viewport
		
		// Cartagen.plot_array.each(function(plot) {
		// 	$C.stroke_style('red')
		// 	$C.line_width(4)
		// 	//[lon1, lat2, lon2, lat1]
		// 	var x = Projection.lon_to_x(plot[0])
		// 	var y = Projection.lat_to_y(plot[3])
		// 	var w = Projection.lon_to_x(plot[2])-x
		// 	var h = Projection.lat_to_y(plot[1])-y
		// 	$C.stroke_rect(x,y,w,h)
		// 	$C.draw_text('Helvetica', 
		// 	             9 / Cartagen.zoom_level, 
		// 				 'rgba(0,0,0,0.5)', 
		// 				 Projection.lon_to_x(plot[0]) + 3/Cartagen.zoom_level,
		// 				 Projection.lat_to_y(plot[3]) - 3/Cartagen.zoom_level, 
		// 				 plot[4])
		// })

		/**
		 *@name Cartagen#cartagen:predraw
		 *Fires just before features are drawn
		 *@event
		 */
		$('canvas').fire('cartagen:predraw')
		
		Cartagen.coastline_viewport_punctures = []
		Cartagen.relations.values().each(function(object) {
			object.draw()
		})

		//Geohash lookup:
		Geohash.objects.each(function(object) {
			if (object.user_submitted) {
				Cartagen.feature_queue.push(object)
			}
			else {
				(object.draw.bind(object))()
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
	 * Repositions Cartagen to center on lat,lon with given zoom level
     * @param {Number} lat     latitude to center the map on
     * @param {Number} lon     longitude to center the map on
     * @param {Number} zoom_level     zoom_level to set the map to
	 */
	go_to: function(lat,lon,zoom_level) {
		Map.lat = lat
		Map.lon = lon
		Map.x = -Projection.lon_to_x(Map.lon)
		Map.y = Projection.lat_to_y(Map.lat)
		Cartagen.zoom_level = zoom_level
	},
	/**
	 * Parses feature data and creates Way and Node objects, registering them with
	 * Geohash
	 * @param {Object} data OSM data to parse
	 */
	parse_objects: function(data) {
		data.osm.node.each(function(node){
	        var n = new Node
			n.name = node.name
			n.author = n.author
			n.img = n.img
			n.h = 10
			n.w = 10
			n.color = Glop.random_color()
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
			if (node.display) {
				$l(node)
				n.display = true
				n.radius = 50
				Geohash.put(n.lat, n.lon, n, 1)
			}
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
						if (tag.v == 'coastline') data.coastline = true
					})
				} else {
					data.tags.set(way.tag.k,way.tag.v)
					if (tag.v == 'coastline') data.coastline = true
				}
				new Way(data)
			}
		})
				
		// flush coastline collected_ways relations and re-generate them with new coastlines:
		Cartagen.coastlines.each(function(c){c.neighbors = []})
		Cartagen.coastlines.each(function(coastline_a) {
			Cartagen.coastlines.each(function(coastline_b) {
				if (coastline_a.id != coastline_b.id) {
					if (coastline_a.nodes.last().id == coastline_b.nodes.first().id) {
						coastline_a.neighbors[1] = coastline_b
						coastline_b.neighbors[0] = coastline_a
					}
				}
			})
		})
		
		// turn this into a new Cartagen function:
		var coastline_chains = Cartagen.coastlines.clone()
		Cartagen.relations = new Hash()
		while (coastline_chains.length > 0) {
			var data = {
				members: coastline_chains.first().chain([],true,true)
			}
			// remove chain members from coastline chain:
			data.members.each(function(member) {
				coastline_chains.each(function(coastline,index) {
					if (coastline.id == member.id) coastline_chains.splice(index,1)
				})
			})
			new Relation(data)
		}
		
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
		// objects.sort(Cartagen.sort_by_area)
		Geohash.sort_objects()
		Geohash
	},
	/**
	 * An array of bboxes of requested plots... helps in debugging what has been requested.
	 */
	plot_array: [],
	/**
	 * Gets the plot under the current center of the viewport
	 */
	get_current_plot: function(force) {
		force = force || false
		if ((Map.x != Map.last_pos[0] && Map.y != Map.last_pos[1]) || force != false || Glop.frame < 100) {
			// find all geohashes we want to request:
			if (Geohash.keys && Geohash.keys.keys()) {
				try {
				Geohash.keys.keys().each(function(key) {
					// this will look for cached plots, or get new ones if it fails to find cached ones
					if (key.length == 6) Cartagen.get_cached_plot(key)
				})
				} catch(e) {
					$l(e)
					// $D._verbose_trace(e)
				}
			}
		}
		Map.last_pos[0] = Map.x
		Map.last_pos[1] = Map.y
	},
	/**
	 * Fetches a JSON plot from a static file, given a full url.
	 */
	get_static_plot: function(url) {
		$l('fetching ' + url)
		Cartagen.requested_plots++
		new Ajax.Request(url,{
			method: 'get',
			onComplete: function(result) {
				// $l(result.responseText.evalJSON().osm.ways.length+" ways")
				$l('got ' + url)
				Cartagen.parse_objects(result.responseText.evalJSON())
				$l(objects.length+" objects")
				Cartagen.requested_plots--
				if (Cartagen.requested_plots == 0) Event.last_event = Glop.frame
				$l("Total plots: "+Cartagen.plots.size()+", of which "+Cartagen.requested_plots+" are still loading.")
			}
		})
	},
	/** 
	 * Checks against local storage for browers with HTML 5,
	 * then fetches the plot and parses the data into the objects array.
	 */
	get_cached_plot: function(key) {
		// Remember that parse_objects() will fill localStorage.
		// We can't do it here because it's an asychronous AJAX call.

		// if we're not live-loading:
		if (!Cartagen.live) {
			// check if we've loaded already this session:
			if (Cartagen.plots.get(key)) {
				// no live-loading, so:
				//$l("already loaded plot")
			} else {
				// if we haven't, check if HTML 5 localStorage exists in this browser:
				if (typeof localStorage != "undefined") {
					var ls = localStorage.getItem('geohash_'+key)
					if (ls) {
						$l("localStorage cached plot")
						Cartagen.parse_objects(ls.evalJSON())
						// Cartagen.plot_array.push(Geohash.bbox(key))
					} else {
						// it's not in the localStorage:
						Cartagen.load_plot(key)
					}
				} else {
					// not loaded this session and no localStorage, so:
					Cartagen.load_plot(key)
				}
			}
		} else {
			// we're live-loading! Gotta get it no matter what:
			Cartagen.load_plot(key)
		}

		Cartagen.plots.set(key, true)
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
		setTimeout("Cartagen.get_cached_plot("+_lat1+","+_lng1+","+_lat2+","+_lng2+","+_bleed+")",bleed_delay)
	},
	/**
	 * Requests a JSON plot for a bbox from the server
	 * 
	 * @param {Number} _lat1  Upper bound
	 * @param {Number} _lng1  Left bound
	 * @param {Number} _lat2  Lower bound
	 * @param {Number} _lng2  Right bound
	 */
	load_plot: function(key) {
		// Cartagen.plot_array.push(Geohash.bbox(key))
		$l('loading geohash plot: '+key)
		
		Cartagen.requested_plots++
		var finished = false
		// var req = new Ajax.Request('/api/0.6/map.json?bbox='+_lng1+","+_lat1+','+_lng2+','+_lat2,{
		var req = new Ajax.Request('/api/0.6/geohash/'+key+'.json',{
			method: 'get',
			onSuccess: function(result) {
				finished = true
				// $l('loaded '+_lat1+'&lng1='+_lng1+'&lat2='+_lat2+'&lng2='+_lng2)
				Cartagen.parse_objects(result.responseText.evalJSON())
				if (localStorage) localStorage.setItem('geohash_'+key,result.responseText)
				Cartagen.requested_plots--
				if (Cartagen.requested_plots == 0) Event.last_event = Glop.frame
				$l("Total plots: "+Cartagen.plots.size()+", of which "+Cartagen.requested_plots+" are still loading.")
				Geohash.last_get_objects[3] = true // force re-get of geohashes
				Glop.draw()
			},
			onFailure: function() {
				Cartagen.requested_plots--
			}
		})

		// abort after 120 secs
		var f = function(){
			if (!finished) {
				Cartagen.plots.set(key, false)
				req.transport.onreadystatechange = Prototype.emptyFunction
				req.transport.abort()
				// Cartagen.requested_plots--
				$l("Request aborted. Total plots: "+Cartagen.plots.size()+", of which "+Cartagen.requested_plots+" are still loading.")
			}
		}
		f.delay(120)
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
		Cartagen.live_gss = !Cartagen.live_gss
	},
	/**
	 * Sends user to an image of the current canvas
	 */
	redirect_to_image: function() {
		document.location = $C.to_data_url();
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
//= require <features/feature>
//= require <glop/glop>
//= require <interface/interface>
//= require <mapping/map>
