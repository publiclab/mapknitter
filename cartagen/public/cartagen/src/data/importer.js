var Importer = {
	/**
	 * An array of bboxes of requested plots... helps in debugging what has been requested.
	 */
	plot_array: [],
	/** 
	 * The number of plots that have been requested, but have not been loaded yet.
	 * @type Number
	 */
	requested_plots: 0,
	/**
	 * Hash of bbox => features
	 * @type Hash
	 */
	plots: new Hash(),
	/**
	 * A TaskManager that performs feature parsing
	 */
	parse_manager: null,
	init: function() {
		Importer.parse_manager = new TaskManager(50)
		try {
			if (JSON.parse) {
				Importer.native_json = true
			}
		} catch(e) {
			Importer.native_json = false
		}
	},
	flush_localstorage: function() {
		if (typeof localStorage != "undefined" && !Config.suppress_interface && localStorage.length > 200) {
			var answer = confirm('Your localStorage is filling up ('+localStorage.length+' entries) and may cause slowness in some browsers. Click OK to flush it and begin repopulating it from new data.')
			if (answer) {
				localStorage.clear()
			} else {
				alert("Your localStorage is intact.")
			}	
		}
	},
	/**
	 * Parses JSON with either the Prototype (crockford-style) JSON parser,
	 * or a native parser if available
	 */
	parse: function(string) {
			// var a = new Date
		if (Importer.native_json) {
			// var result = string.evalJSON()
			var result = JSON.parse(string)
			// var b = new Date
			// $l('parsed: '+(b.getTime()-a.getTime()))
			return result
		} else {
			var result = string.evalJSON()
			// var b = new Date
			// $l('parsed: '+(b.getTime()-a.getTime()))
			return result
		}
	},
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
					if (key.length == 6) Importer.get_cached_plot(key)
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
		$l('getting static plot for '+url)
		Importer.requested_plots++
		new Ajax.Request(url,{
			method: 'get',
			onSuccess: function(result) {
				try {
					$l('formed correctly: '+result.responseText)
					Importer.parse_objects(Importer.parse(result.responseText))
				} catch(e) {
					$l('Malformed JSON, did not parse. Try removing trailing commas and extra whitespace. Test your JSON by typing \"Importer.parse(\'{"your": "json", "goes": "here"}\')\" ==> '+result.responseText)
				}
				Importer.requested_plots--
				if (Importer.requested_plots == 0) Event.last_event = Glop.frame
				$l("Total plots: "+Importer.plots.size()+", of which "+Importer.requested_plots+" are still loading.")
				Glop.trigger_draw()
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
		if (!Config.live) {
			// check if we've loaded already this session:
			if (Importer.plots.get(key)) {
				// no live-loading, so:
				//$l("already loaded plot")
			} else {
				// if we haven't, check if HTML 5 localStorage exists in this browser:
				if (typeof localStorage != "undefined") {
					var ls = localStorage.getItem('geohash_'+key)
					if (ls) {
						$l("localStorage cached plot")
						Importer.parse_objects(Importer.parse(ls), key)
						// Cartagen.plot_array.push(Geohash.bbox(key))
					} else {
						// it's not in the localStorage:
						Importer.load_plot(key)
					}
				} else {
					// not loaded this session and no localStorage, so:
					Importer.load_plot(key)
				}
			}
		} else {
			// we're live-loading! Gotta get it no matter what:
			Importer.load_plot(key)
		}

		Glop.trigger_draw()
		Importer.plots.set(key, true)
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
		// Importer.plot_array.push(Geohash.bbox(key))
		$l('loading geohash plot: '+key)
		
		Importer.requested_plots++
		var finished = false
		// var req = new Ajax.Request('/api/0.6/map.json?bbox='+_lng1+","+_lat1+','+_lng2+','+_lat2,{
		var req = new Ajax.Request('/api/0.6/geohash/'+key+'.json',{
			method: 'get',
			onSuccess: function(result) {
				finished = true
				// $l('loaded '+_lat1+'&lng1='+_lng1+'&lat2='+_lat2+'&lng2='+_lng2)
				Importer.parse_objects(Importer.parse(result.responseText), key)
				if (localStorage) localStorage.setItem('geohash_'+key,result.responseText)
				Importer.requested_plots--
				if (Importer.requested_plots == 0) Event.last_event = Glop.frame
				$l("Total plots: "+Importer.plots.size()+", of which "+Importer.requested_plots+" are still loading.")
				Geohash.last_get_objects[3] = true // force re-get of geohashes
				Glop.trigger_draw()
			},
			onFailure: function() {
				Importer.requested_plots--
			}
		})

		// abort after 120 secs
		var f = function(){
			if (!finished) {
				Importer.plots.set(key, false)
				req.transport.onreadystatechange = Prototype.emptyFunction
				req.transport.abort()
				// Importer.requested_plots--
				$l("Request aborted. Total plots: "+Importer.plots.size()+", of which "+Importer.requested_plots+" are still loading.")
			}
		}
		f.delay(120)
	},
	parse_node: function(node){
		var n = new Node
		n.name = node.name
		n.author = node.author
		n.img = node.img
		n.h = 10
		n.w = 10
		n.color = Glop.random_color()
		n.timestamp = node.timestamp
		n.user = node.user
		if (!Object.isUndefined(node.image)) $l('got image!!')
		n.id = node.id
		n.lat = node.lat
		n.lon = node.lon
		n.x = Projection.lon_to_x(n.lon)
		n.y = Projection.lat_to_y(n.lat)
		Style.parse_styles(n,Style.styles.node)
		// can't currently afford to have all nodes in the map as well as all ways.
		// but we're missing some nodes when we render... semantic ones i think. cross-check.
		// objects.push(n)
		Feature.nodes.set(n.id,n)
		if (node.display) {
			n.display = true
			n.radius = 50
			$l(n.img)
			Geohash.put(n.lat, n.lon, n, 1)
		}
	},
	parse_way: function(way){
		if (Config.live || !Feature.ways.get(way.id)) {
			var data = {
				id: way.id,
				user: way.user,
				timestamp: way.timestamp,
				nodes: [],
				tags: new Hash()
			}
			if (way.name) data.name = way.name
			way.nd.each(function(nd, index) {
				if ((index % Config.simplify) == 0 || index == 0 || index == way.nd.length-1 || way.nd.length <= Config.simplify*2)  {
					node = Feature.nodes.get(nd.ref)
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
	},
	/**
	 * Parses feature data and creates Way and Node objects, registering them with
	 * Geohash
	 * @param {Object} data OSM data to parse
	 */
	parse_objects: function(data, key) {
		var cond;
		if (key) {
			cond = function() {
				return (Geohash.keys.get(key) === true)
			}
		} else  {
			// cond = true
			cond = function() {
				return true
			}
		}
		if (data.osm.node) {
			node_task = new Task(data.osm.node, Importer.parse_node, cond)
			Importer.parse_manager.add(node_task)
		}
		if (data.osm.way) {
			way_task = new Task(data.osm.way, Importer.parse_way, cond, [node_task.id])
			Importer.parse_manager.add(way_task)
		}
		coastline_task = new Task(['placeholder'], Coastline.refresh_coastlines, cond, [way_task.id])
		Importer.parse_manager.add(coastline_task)
		// we should load relations -- scheduled for 0.8 rlease

		// sort by polygons' node count:
		// objects.sort(Geometry.sort_by_area)
	}
}

Importer.flush_localstorage()
document.observe('cartagen:init', Importer.init.bindAsEventListener(Importer))
