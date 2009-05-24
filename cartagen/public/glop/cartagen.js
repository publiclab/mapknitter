var plots = new Hash(), nodes = new Hash(), ways = new Hash(), lastPos = [0,0], scale_factor = 100000, bleed_level = 1, initial_bleed_level = 2, zoom_out_limit, zoom_in_limit, live_gss = false

var objects = []

var scripts = [
	'/glop/canvastext.js',
	'/glop/glop.js',
	'/glop/events.js'
]

function load_script(script) {
	$$('head')[0].insert(new Element('script', { 'src': script, 'type': 'text/javascript', 'charset': 'utf-8', evalJSON: 'force' }));
}
function load_next_script() {
	if (scripts.length > 0) {
		load_script(scripts.splice(0,1)[0])
	}
}		

// var spherical_mercator = Class.create({
// 	lon_to_x: function(lon) { return (lon - projection.center_lon()) * -1 * scale_factor },
// 	x_to_lon: function(x) { return (x/(-1*scale_factor)) + projection.center_lon() },
// 	lat_to_y: function(lat) { return ((180/Math.PI * (2 * Math.atan(Math.exp(lat*Math.PI/180)) - Math.PI/2))) * scale_factor * 1.7 },
// 	y_to_lat: function(y) { return (180/Math.PI * Math.log(Math.tan(Math.PI/4+(y/(scale_factor*1.7))*(Math.PI/180)/2))) },
// })
// 
// // Uses global values... should set these in the initializer/constructor:
// var projection = Class.create({
// 	current_projection: spherical_mercator,
// 	set: function(new_projection) {
// 		this.current_projection = new_projection
// 	},
// 	lon_to_x: function(lon) { return this.current_projection.lon_to_x() },
// 	x_to_lon: function(x) { return this.current_projection.x_to_lon() },
// 	lat_to_y: function(lat) { return this.current_projection.lat_to_y() },
// 	y_to_lat: function(y) { return this.current_projection.y_to_lat() },
// 	//required by spherical mercator:
// 	center_lon: function() { return (lng2+lng1)/2 },
// })

if (Prototype.Browser.MobileSafari) $('brief').hide()

var Mouse = {
	x: 0,
	y: 0,
	click_x: 0,
	click_y: 0
}

var Style = {
	styles: {
		body: {
			fillStyle: "#eee",
		},
		way: {
			fillStyle: "#555",
		},
		node: {
			fillStyle: "#555",
		}
	},
	style_body: function() {
		if (Style.styles) {
			if (Style.styles.body.fillStyle) fillStyle(Style.styles.body.fillStyle)
			if (Style.styles.body.strokeStyle) strokeStyle(Style.styles.body.strokeStyle)
			if (Style.styles.body.lineWidth || Style.styles.body.lineWidth == 0) lineWidth(Style.styles.body.lineWidth)
			if (Style.styles.body.pattern && Object.isUndefined(Style.styles.body.pattern_img)) {
				Style.styles.body.pattern_img = new Image()
				Style.styles.body.pattern_img.src = Style.styles.body.pattern
			}
			if (Style.styles.body.pattern_img) {
				try {
					fillStyle(canvas.createPattern(Style.styles.body.pattern_img,'repeat'))	
				} catch(e) {}
			}
			rect(0,0,width,height)
			strokeRect(0,0,width,height)
		}
		canvas.lineJoin = 'round'
		canvas.lineCap = 'round'
	},
	parse_styles: function(feature,selector) {
		try {
			// check for function or parameter for each style type... 
			// or is it copying the function itself, and doesn't need to know if it's a function or parameter?
			if (selector.opacity) feature.opacity = selector.opacity
			if (selector.fillStyle) feature.fillStyle = selector.fillStyle
			if (selector.lineWidth || selector.lineWidth == 0) feature.lineWidth = selector.lineWidth
			if (selector.strokeStyle && Object.isFunction(selector.strokeStyle)) {
				// bind the styles object to the context of this Way:
				feature.strokeStyle = selector.strokeStyle()
			} else {
				feature.strokeStyle = selector.strokeStyle
			}
			// patterns
			if (selector.pattern) {
				feature.pattern_img = new Image()
				feature.pattern_img.src = selector.pattern
			}
			// radius is relevant to nodes, i.e. single points
			if (selector.radius) feature.radius = selector.radius
			// check selector for hover:
			if (selector['hover']) feature.hover = selector['hover']
			if (selector['mouseDown']) feature.mouseDown = selector['mouseDown']

			if (Style.styles[feature.name] && Style.styles[feature.name].fillStyle) {
				feature.fillStyle = Style.styles[feature.name].fillStyle
			}
			if (Style.styles[feature.name] && Style.styles[feature.name].strokeStyle) {
				feature.strokeStyle = Style.styles[feature.name].strokeStyle
			}
			// font styling:
			if (selector['fontColor']) feature.fontColor = selector['fontColor']

			feature.tags.each(function(tag) {
				//look for a style like this:
				if (Style.styles[tag.key] && Style.styles[tag.key].opacity) {
					feature.opacity = Style.styles[tag.key].opacity
				}
				if (Style.styles[tag.value] && Style.styles[tag.value].opacity) {
					feature.opacity = Style.styles[tag.value].opacity
				}
				if (Style.styles[tag.key] && Style.styles[tag.key].fillStyle) {
					feature.fillStyle = Style.styles[tag.key].fillStyle
				}
				if (Style.styles[tag.value] && Style.styles[tag.value].fillStyle) {
					feature.fillStyle = Style.styles[tag.value].fillStyle
				}
				if (Style.styles[tag.key] && Style.styles[tag.key].strokeStyle) {
					feature.strokeStyle = Style.styles[tag.key].strokeStyle
				}
				if (Style.styles[tag.value] && Style.styles[tag.value].strokeStyle) {
					feature.strokeStyle = Style.styles[tag.value].strokeStyle
				}
				if (Style.styles[tag.key] && Style.styles[tag.key].lineWidth) {
					feature.lineWidth = Style.styles[tag.key].lineWidth
				}
				if (Style.styles[tag.value] && Style.styles[tag.value].lineWidth) {
					feature.lineWidth = Style.styles[tag.value].lineWidth
				}
				if (Style.styles[tag.key] && Style.styles[tag.key].pattern) {
					feature.pattern_img = new Image()
					feature.pattern_img.src = Style.styles[tag.key].pattern
				}
				if (Style.styles[tag.value] && Style.styles[tag.value].pattern) {
					feature.pattern_img = new Image()
					feature.pattern_img.src = Style.styles[tag.value].pattern
				}

				//check tags for hover:
				if (Style.styles[tag.key] && Style.styles[tag.key]['hover']) {
					feature.hover = Style.styles[tag.key]['hover']
				}
				if (Style.styles[tag.value] && Style.styles[tag.value]['hover']) {
					feature.hover = Style.styles[tag.value]['hover']
				}
				//check tags for mouseDown:
				if (Style.styles[tag.key] && Style.styles[tag.key]['mouseDown']) {
					feature.mouseDown = Style.styles[tag.key]['mouseDown']
				}
				if (Style.styles[tag.value] && Style.styles[tag.value]['mouseDown']) {
					feature.mouseDown = Style.styles[tag.value]['mouseDown']
				}
			})
		} catch(e) {
			console.log("There was an error in your stylesheet. Please check http://wiki.cartagen.org for the GSS spec. Error: "+trace(e))
		}
	},
	apply_style: function(feature) {
		if (feature.opacity) {
			if (Object.isFunction(feature.opacity)) {
				canvas.globalOpacity = feature.opacity()
			} else {
				canvas.globalOpacity = feature.opacity
			}
		}
		if (feature.strokeStyle) {
			if (Object.isFunction(feature.strokeStyle)) {
				strokeStyle(feature.strokeStyle())
			} else {
				strokeStyle(feature.strokeStyle)
			}
		}
		if (feature.fillStyle) {
			if (Object.isFunction(feature.fillStyle)) {
				fillStyle(feature.fillStyle())
			} else {
				fillStyle(feature.fillStyle)
			}
		}
		if (feature.pattern_img) {
			fillStyle(canvas.createPattern(feature.pattern_img,'repeat'))
		}
		if (feature.lineWidth) {
			if (Object.isFunction(feature.lineWidth)) {
				lineWidth(feature.lineWidth())
			} else {
				lineWidth(feature.lineWidth)
			}
		}
		// trigger hover and mouseDown styles:
		if (feature instanceof Way) {
			if (feature.hover && feature.closed_poly && is_point_in_poly(feature.nodes,Map.pointer_x(),Map.pointer_y())) {
				Style.apply_style(feature.hover)
				if (!Object.isUndefined(feature.hover.action)) feature.hover.action()
			}
			if (feature.mouseDown && mouseDown == true && feature.closed_poly && is_point_in_poly(feature.nodes,Map.pointer_x(),Map.pointer_y())) {
				Style.apply_style(feature.mouseDown)
				if (!Object.isUndefined(feature.mouseDown.action)) feature.mouseDown.action()
			}
		} else if (feature instanceof Node) {
			if (feature.hover && overlaps(feature.x,feature.y,Map.pointer_x(),Map.pointer_y(),100)) {
				Style.apply_style(feature.hover)
				if (feature.hover.action) feature.hover.action()
			}
			if (feature.mouseDown && mouseDown == true && overlaps(feature.x,feature.y,Map.pointer_x(),Map.pointer_y(),100)) {
				Style.apply_style(feature.mouseDown)
				if (feature.mouseDown.action) feature.mouseDown.action()
			}
		}
	},
	// add an individual style to the styles object. May not actually work; old code.
	// add_style('highway','strokeStyle','red')
	add_style: function(tag,style,value) {
		eval("styles."+tag+" = {"+style+": '"+value+"'}")
	},
	// load a remote stylesheet, given a URL
	load_styles: function(stylesheet_url) {
		if (stylesheet_url[0,4] == "http") {
			stylesheet_url = "/map/style?url="+stylesheet_url
		}
		new Ajax.Request(stylesheet_url,{
			method: 'get',
			onComplete: function(result) {
				console.log('applying '+stylesheet_url)
				Style.styles = ("{"+result.responseText+"}").evalJSON()
				Style.stylesheet_source = "{"+result.responseText+"}"
				Style.apply_gss(Style.stylesheet_source)
				// populate the gss field
				$('gss_textarea').value = Style.stylesheet_source
			}
		})
	},
	// given a string of gss, applies the string to all Ways and Nodes in the objects array
	apply_gss: function(gss) {
		if (Object.isUndefined(arguments[1])) var clear_styles = true
		else clear_styles = arguments[1]
		Style.styles = gss.evalJSON()
		objects.each(function(object) {
			if (clear_styles) {
				object.lineWeight = null
				object.strokeStyle = null
				object.fillStyle = null
				object.hover = null
				object.mouseDown = null
			}
			if (object instanceof Node) Style.parse_styles(object,Style.styles.node)
			if (object instanceof Way) Style.parse_styles(object,Style.styles.way)
		},this)
	}
}

var Viewport = {
}

var Cartagen = {
	object_count: 0,
	way_count: 0,
	node_count: 0,
	requested_plots: 0,
	fullscreen: true,
	stylesheet: "/style.gss",
	live: false,
	powersave: true,
	zoom_out_limit: 0.02,
	simplify: 1,
	static_map: true,
	static_map_layers: ["/static/rome/park.js"],
	range: 0.001,
	lat1: 41.9227,
	lat2: 41.861,
	lng1: 12.4502,
	lng2: 12.5341,
	zoom_level: 0.05,
	setup: function(configs) {
		// wait for window load:
		Event.observe(window, 'load', this.initialize.bind(this,configs))
	},
	initialize: function(configs) {
		// queue dependencies:
		load_next_script()
		this.browser_check()
		// draw on window resize:
		Event.observe(window, 'resize', function() {try{draw()}catch(e){}});
		// we can override right-click:
		// Event.observe(window, 'oncontextmenu', function() { return false })

		Object.keys(configs).each(function(key,index) {
			this[key] = Object.values(configs)[index]
			console.log('configuring '+key+': '+this[key])
		},this)
		
		Map.initialize()
		// Startup:
		Style.load_styles(this.stylesheet)
		if (!this.static_map) {
			this.get_cached_plot(this.lat1,this.lng1,this.lat2,this.lng2,initial_bleed_level)
			new PeriodicalExecuter(this.get_current_plot,0.33)
		} else {
			if (Prototype.Browser.MobileSafari) {
				this.get_static_plot(static_map_layers[0])
				this.get_static_plot(static_map_layers[1])
			} else {
				this.static_map_layers.each(function(layer_url) {
					console.log('fetching '+layer_url)
					this.get_static_plot(layer_url)
				},this)	
			}
		}
	},
	// Runs every frame in the draw() method. An attempt to isolate cartagen code from general GLOP code
	draw: function() {
		this.object_count = 0
		this.way_count = 0
		this.node_count = 0
		Map.refresh_resolution()
		if (Prototype.Browser.MobileSafari) {
			Cartagen.simplify = 2
		}

		Style.style_body()

		translate(width/2,height/2)
			rotate(global_rotate)
			scale(Cartagen.zoom_level,Cartagen.zoom_level)
	 	translate(width/-2,height/-2)
		// rotate(-1*global_rotate)
			translate((-1*Map.x)+(width/2),(-1*Map.y)+(height/2))
		// rotate(global_rotate)

		// viewport stuff:
		strokeStyle('white')
		lineWidth(10)
		viewport_width = width*(1/Cartagen.zoom_level)-(100*(1/Cartagen.zoom_level))
		viewport_height = height*(1/Cartagen.zoom_level)-(100*(1/Cartagen.zoom_level))
		viewport = [Map.y-viewport_height/2,Map.x-viewport_width/2,Map.y+viewport_height/2,Map.x+viewport_width/2]
		strokeRect(Map.x-viewport_width/2,Map.y-viewport_height/2,viewport_width,viewport_height)
	},
	// show alert if it's IE:
	browser_check: function() {
		$('browsers').absolutize;
		$('browsers').style.top = "100px";	
		$('browsers').style.margin = "0 auto";	
		if (Prototype.Browser.IE) $('browsers').show();
	},
	// sort ways by area:
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
			n.x = lon_to_x(n.lon)
			n.y = lat_to_y(n.lat)
			Style.parse_styles(n,Style.styles.node)
			// can't currently afford to have all nodes in the map as well as all ways.
			// but we're missing some nodes when we render... semantic ones i think. cross-check.
			// objects.push(n)
			nodes.set(n.id,n)
	    })
		data.osm.way.each(function(way){
			if (Cartagen.live || !ways.get(way.id)) {
				var w = new Way
				w.id = way.id
				w.user = way.user
				w.timestamp = way.timestamp
				w.nodes = []
				w.x = 0
				w.y = 0
				w.bbox = [0,0,0,0] // top, left, bottom, right
				way.nd.each(function(nd,index){
					try {
						if ((index % Cartagen.simplify) == 0 || index == 0 || index == way.nd.length-1 || way.nd.length <= Cartagen.simplify*2) {
							// find the node corresponding to nd.ref, store a reference:
							node = nodes.get(nd.ref)
							if (!Object.isUndefined(node)) {
								if (node.x < w.bbox[1] || w.bbox[1] == 0) w.bbox[1] = node.x
								if (node.x > w.bbox[3] || w.bbox[3] == 0) w.bbox[3] = node.x
								if (node.y < w.bbox[0] || w.bbox[0] == 0) w.bbox[0] = node.y
								if (node.y > w.bbox[2] || w.bbox[2] == 0) w.bbox[2] = node.y
								w.x += node.x
								w.y += node.y
								w.nodes.push(node)
							}
						}
					} catch(e) {
						console.log(trace(e))
					}
				})
				w.x = w.x/w.nodes.length
				w.y = w.y/w.nodes.length
				w.area = poly_area(w.nodes)
				w.tags = new Hash()
				if (way.tag instanceof Array) {
					way.tag.each(function(tag) {
						w.tags.set(tag.k,tag.v)
					})
				} else {
					w.tags.set(way.tag.k,way.tag.v)
				}
				if (w.nodes[0].x == w.nodes[w.nodes.length-1].x && w.nodes[0].y == w.nodes[w.nodes.length-1].y) w.closed_poly = true
				if (w.tags.get('natural') == "coastline") w.closed_poly = true
				Style.parse_styles(w,Style.styles.way)
				objects.push(w)
				ways.set(w.id,w)
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
	number_precision: function(num,prec) {
		return (num * (1/prec)).round()/(1/prec)
	},
	// gets the plot under the current center of the viewport
	get_current_plot: function() {
		if (Map.x != lastPos[0] && Map.y != lastPos[1]) {
			var new_lat1,new_lat2,new_lng1,new_lng2
			new_lat1 = y_to_lat(Map.y)-range
			new_lng1 = x_to_lon(Map.x)-range
			new_lat2 = y_to_lat(Map.y)+range
			new_lng2 = x_to_lon(Map.x)+range
			// this will look for cached plots, or get new ones if it fails
			Cartagen.get_cached_plot(new_lat1,new_lng1,new_lat2,new_lng2,bleed_level)
		}
		lastPos[0] = Map.x
		lastPos[1] = Map.y
	},
	// fetches a JSON plot from a static file, given a full url
	get_static_plot: function(url) {
		Cartagen.requested_plots++
		new Ajax.Request(url,{
			method: 'get',
			onSuccess: function(result) {
				// console.log(result.responseText.evalJSON().osm.ways.length+" ways")
				Cartagen.parse_objects(result.responseText.evalJSON())
				console.log(objects.length+" objects")
				Cartagen.requested_plots--
				if (Cartagen.requested_plots == 0) last_event = frame
				console.log("Total plots: "+plots.size()+", of which "+Cartagen.requested_plots+" are still loading.")
			}
		})
	},
	// reduces precision of a plot request to quantize plot requests
	// checks against local storage for browers with HTML 5
	// then fetches the plot and parses the data into the objects array
	get_cached_plot: function(_lat1,_lng1,_lat2,_lng2,_bleed) {
		plot_precision = 0.001
		_lat1 = Cartagen.number_precision(_lat1,plot_precision)
		_lng1 = Cartagen.number_precision(_lng1,plot_precision)
		_lat2 = Cartagen.number_precision(_lat2,plot_precision)
		_lng2 = Cartagen.number_precision(_lng2,plot_precision)
		var cached = false

		// Remember that parse_objects() will fill localStorage.
		// We can't do it here because it's an asychronous AJAX call.

		// if we're not live-loading:
		if (!Cartagen.live) {
			// check if we've loaded already this session:
			if (plots.get(_lat1+","+_lng1+","+_lat2+","+_lng2) && plots.get(_lat1+","+_lng1+","+_lat2+","+_lng2)[0]) {
				// no live-loading, so:
				console.log("already loaded plot")
			} else {
				// if we haven't, check if HTML 5 localStorage exists in this browser:
				if (typeof localStorage != "undefined") {
					var ls = localStorage.getItem(_lat1+","+_lng1+","+_lat2+","+_lng2)
					if (ls) {
						plots.set(_lat1+","+_lng1+","+_lat2+","+_lng2,[true,_bleed])
						console.log("localStorage cached plot")
						Cartagen.parse_objects(ls)
					} else {
						// it's not in the localStorage:
						Cartagen.load_plot(_lat1,_lng1,_lat2,_lng2)
					}
				} else {
					// not loaded this session and no localStorage, so:
					Cartagen.load_plot(_lat1,_lng1,_lat2,_lng2)
					plots.set(_lat1+","+_lng1+","+_lat2+","+_lng2,[true,_bleed])
				}
			}
			// if the bleed level of this plot is > 0
			if (_bleed > 0) {
				console.log('bleeding to neighbors with bleed = '+_bleed)
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
	// peforms get_cached_plot() with a randomized delay of between 1 and 3 seconds
	// this prevents a zillion requests to the server at the same time and is useful for live viewing
	// for viewing page_cached plots, it doesn't matter
	delayed_get_cached_plot: function(_lat1,_lng1,_lat2,_lng2,_bleed) {
		bleed_delay = 1000+(2000*Math.random(_lat1+_lng1)) //milliseconds, with a random factor to stagger requests
		setTimeout("get_cached_plot("+_lat1+","+_lng1+","+_lat2+","+_lng2+","+_bleed+")",bleed_delay)
	},
	// requests a JSON plot for a bbox from the server
	load_plot: function(_lat1,_lng1,_lat2,_lng2) {
		Cartagen.requested_plots++
		new Ajax.Request('/map/plot.js?lat1='+_lat1+'&lng1='+_lng1+'&lat2='+_lat2+'&lng2='+_lng2+'',{
			method: 'get',
			onComplete: function(result) {
				Cartagen.parse_objects(result.responseText.evalJSON())
				Cartagen.requested_plots--
				if (Cartagen.requested_plots == 0) last_event = frame
				console.log("Total plots: "+plots.size()+", of which "+Cartagen.requested_plots+" are still loading.")
			}
		})
	},
	// Searches all objects by tags, and sets highlight=true for all matches.
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
	show_gss_editor: function() {
		$('description').hide()
		$('brief').style.width = '28%'
		$('brief_first').style.width = '92%';
		$('gss').toggle()
		live_gss = !live_gss
	}
}

var Map = {
	initialize: function() {
		this.x = lon_to_x((Cartagen.lng1+Cartagen.lng2)/2)
		this.y = lat_to_y((Cartagen.lat1+Cartagen.lat2)/2)
	},
	pointer_x: function() { return Map.x+(((width/2)-Mouse.x)/Cartagen.zoom_level) },
	pointer_y: function() { return Map.y+(((height/2)-Mouse.y)/Cartagen.zoom_level) },
	x: 0,
	y: 0,
	x_old: 0,
	y_old: 0,
	// Res down for zoomed-out... getting a NaN for x % 0. Not that much savings yet.
	resolution: Math.round(Math.abs(Math.log(Cartagen.zoom_level))),
	refresh_resolution: function() {
		this.resolution = Math.round(Math.abs(Math.log(Cartagen.zoom_level)))
	}
}

var Node = Class.create({
	radius: 6,
	tags: [],
	draw: function() {
		Cartagen.object_count++
		Cartagen.point_count++
		canvas.save()
		this.shape()
		canvas.restore()
	},
	shape: function() {
	    canvas.save()
			Style.apply_style(this)
		beginPath()
		translate(this.x,this.y-6)
		arc(0,this.radius,this.radius,0,Math.PI*2,true)
		fill()
		stroke()
	    canvas.restore()
  },
  within: function(start_x,start_y,end_x,end_y) {
	return false
  }
})

var Way = Class.create({
	initialize: function() {
	},
	age: 0,
	highlight: false,
	nodes: [],
	label: null,
	closed_poly: false,
	tags: new Hash(),
	draw: function() {
		Cartagen.object_count++
		// only draw if in the viewport:
		if (intersect(viewport[0],viewport[1],viewport[2],viewport[3],this.bbox[0],this.bbox[1],this.bbox[2],this.bbox[3])) {
			Cartagen.way_count++
			this.shape()
			this.age += 1;
		}
	},
	shape: function() {
		canvas.save()
			Style.apply_style(this)
			if (this.highlight) {
				lineWidth(3/zoom_level)
				strokeStyle("red")
			}
			// fade in after load:
			if (Object.isUndefined(this.opacity)) this.opacity = 1
			if (this.age < 20) {
				canvas.globalAlpha = this.opacity*(this.age/20)
			} else {
				canvas.globalAlpha = this.opacity
			}
			
		beginPath()
		moveTo(this.nodes[0].x,this.nodes[0].y)

		if (Map.resolution == 0) Map.resolution = 1
		this.nodes.each(function(node,index){
			if ((index % Map.resolution == 0) || index == 0 || index == this.nodes.length-1 || this.nodes.length <= 30) {
				Cartagen.node_count++
				lineTo(node.x,node.y)
			}
		},this)

		// fill the polygon if the beginning and end nodes are the same.
		// we'll have to change this for open polys, like coastlines
		stroke()
		if (this.closed_poly) fill()

		// test bboxes for ways:
		// lineWidth(8)
		// strokeStyle('red')
		// strokeRect(this.bbox[1],this.bbox[0],this.bbox[3]-this.bbox[1],this.bbox[2]-this.bbox[0])

		if (this.text) {
			if (this.fontColor) strokeStyle(this.fontColor)
			try{
				rotate(Math.PI)
				drawTextCenter("sans",15/zoom_level,this.x,this.y,this.fillStyle)
			} catch(e) {
				trace(e)
			}
		}
	    canvas.restore()
	},
	click: function() {
	},
	within: function(start_x,start_y,end_x,end_y) {
		return false
	}
})

function poly_area(nodes) {
	var area = 0
	nodes.each(function(node,index) {
		if (index < nodes.length-1) next = nodes[index+1]
		else next = nodes[0]
		if (index > 0) last = nodes[index-1]
		else last = nodes[nodes.length-1]
		area += last.x*node.y-node.x*last.y+node.x*next.y-next.x*node.y
	})
	return Math.abs(area/2)
}

function overlaps(x1,y1,x2,y2,fudge) {
	if (x2 > x1-fudge && x2 < x1+fudge) {
		if (y2 > y1-fudge && y2 < y1+fudge) {
	  		return true
		} else {
			return false
		}
	} else {
		return false
	}
}

function intersect(box1top,box1left,box1bottom,box1right,box2top,box2left,box2bottom,box2right) {	
	return !(box2left > box1right || box2right < box1left || box2top > box1bottom || box2bottom < box1top)
}

//+ Jonas Raoni Soares Silva
//@ http://jsfromhell.com/math/is-point-in-poly [rev. #0]
function is_point_in_poly(poly, _x, _y){
    for(var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
        ((poly[i].y <= _y && _y < poly[j].y) || (poly[j].y <= _y && _y < poly[i].y))
        && (_x < (poly[j].x - poly[i].x) * (_y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x)
        && (c = !c);
    return c;
}

// This duplicates a function call in glop.js... load order issues
function randomColor() {
	return "rgb("+Math.round(Math.random()*255)+","+Math.round(Math.random()*255)+","+Math.round(Math.random()*255)+")"
}

function lon_to_x(lon) { return (lon - center_lon()) * -1 * scale_factor }
function x_to_lon(x) { return (x/(-1*scale_factor)) + center_lon() }

function lat_to_y(lat) { return ((180/Math.PI * (2 * Math.atan(Math.exp(lat*Math.PI/180)) - Math.PI/2))) * scale_factor * 1.7 }
function y_to_lat(y) { return (180/Math.PI * Math.log(Math.tan(Math.PI/4+(y/(scale_factor*1.7))*(Math.PI/180)/2))) }

function center_lon() {
	return (Cartagen.lng2+Cartagen.lng1)/2
}

// Rotates view slowly for cool demo purposes.
function demo() {
	try {
		global_rotate += 0.005
	} catch(e) {}
}