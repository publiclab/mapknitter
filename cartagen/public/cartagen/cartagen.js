// cartagen.js
//
// Copyright (C) 2009 Jeffrey Warren, Design Ecology, MIT Media Lab
//
// This file is part of the Cartagen mapping framework. Read more at
// <http://cartagen.org>
//
// Cartagen is free software: you can redistribute it and/or modify
// it under the terms of the MIT License. You should have received a copy
// of the MIT License along with Cartagen.  If not, see
// <http://www.opensource.org/licenses/mit-license.php>.
//

// these belong in other objects... move them
var lastPos = [0,0]
var objects = []

PhoneGap = window.DeviceInfo && DeviceInfo.uuid != undefined // temp object unitl PhoneGap is initialized

if (typeof cartagen_base_uri == 'undefined') {
    cartagen_base_uri = 'cartagen'
}
// additional dependencies:
var scripts = [
	cartagen_base_uri + '/canvastext.js',
	cartagen_base_uri + '/glop.js',
	cartagen_base_uri + '/events.js',
	cartagen_base_uri + '/lib/geohash.js',
]

// load phonegap js if needed
if(window.PhoneGap) {
	scripts.unshift(cartagen_base_uri + '/lib/phonegap/phonegap.base.js',
				 cartagen_base_uri + '/lib/phonegap/geolocation.js',
				 cartagen_base_uri + '/lib/phonegap/iphone/phonegap.js',
				 cartagen_base_uri + '/lib/phonegap/iphone/geolocation.js')
}


// loads each script in scripts array, sequentially.
// requires a load_next_script() call at the end of each
// dependent script to trigger the next one.
function load_next_script() {
	Cartagen.debug("loading: "+scripts[0])
	if (scripts.length > 0) {
		load_script(scripts.splice(0,1)[0])
	}
}
// loads a script into <script> tags, no cross-domain limits:
function load_script(script) {
	$$('head')[0].insert(new Element('script', { 'src': script, 'type': 'text/javascript', 'charset': 'utf-8', evalJSON: 'force' }));
}

// some browsers don't have a console object, so create a dud one for them:
if (typeof console == "undefined") { console = { log: function(param) {}}}

// if (Prototype.Browser.MobileSafari) $('brief').hide()

var Mouse = {
	x: 0,
	y: 0,
	click_x: 0,
	click_y: 0
}

var Style = {
	styles: {
		// this doesn't get used. We don't have a body object to load them into...
		body: {
			fillStyle: "#eee",
			fontColor: "#eee",
			fontSize: 12
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

			// copy styles based on feature name
			if (Style.styles[feature.name] && Style.styles[feature.name].fillStyle) feature.fillStyle = Style.styles[feature.name].fillStyle
			if (Style.styles[feature.name] && Style.styles[feature.name].strokeStyle) feature.strokeStyle = Style.styles[feature.name].strokeStyle

			// font styling:
			if (selector.fontColor) feature.label.fontColor = selector.fontColor
			if (selector.fontSize) feature.label.fontSize = selector.fontSize
			if (selector.fontScale) feature.label.fontScale = selector.fontScale
			if (selector.fontBackground) feature.label.fontBackground = selector.fontBackground
			if (selector.text) feature.label.text = selector.text

			feature.tags.each(function(tag) {
				//look for a style like this:
				if (Style.styles[tag.key]) {
					if (Style.styles[tag.key].opacity) feature.opacity = Style.styles[tag.key].opacity
					if (Style.styles[tag.key].fillStyle) feature.fillStyle = Style.styles[tag.key].fillStyle
					if (Style.styles[tag.key].strokeStyle) feature.strokeStyle = Style.styles[tag.key].strokeStyle
					if (Style.styles[tag.key].lineWidth) feature.lineWidth = Style.styles[tag.key].lineWidth
					if (Style.styles[tag.key].fontColor) feature.label.fontColor = Style.styles[tag.key].fontColor
					if (Style.styles[tag.key].fontSize) feature.label.fontSize = Style.styles[tag.key].fontSize
					if (Style.styles[tag.key].fontScale) feature.label.fontScale = Style.styles[tag.key].fontScale
					if (Style.styles[tag.key].fontBackground) feature.label.fontBackground = Style.styles[tag.key].fontBackground
					if (Style.styles[tag.key].text) {
						if (Object.isFunction(Style.styles[tag.key].text)) feature.label.text = Style.styles[tag.key].text.apply(feature)
						else feature.label.text = Style.styles[tag.key].text
					}
					if (Style.styles[tag.key].pattern) {
						feature.pattern_img = new Image()
						feature.pattern_img.src = Style.styles[tag.key].pattern
					}
				}
				if (Style.styles[tag.value]) {
					if (Style.styles[tag.value].opacity) feature.opacity = Style.styles[tag.value].opacity
					if (Style.styles[tag.value].fillStyle) feature.fillStyle = Style.styles[tag.value].fillStyle
					if (Style.styles[tag.value].strokeStyle) feature.strokeStyle = Style.styles[tag.value].strokeStyle
					if (Style.styles[tag.value].lineWidth) feature.label.lineWidth = Style.styles[tag.value].lineWidth
					if (Style.styles[tag.value].fontColor) feature.label.fontColor = Style.styles[tag.value].fontColor
					if (Style.styles[tag.value].fontSize) feature.label.fontSize = Style.styles[tag.value].fontSize
					if (Style.styles[tag.value].fontScale) feature.label.fontScale = Style.styles[tag.value].fontScale
					if (Style.styles[tag.value].fontBackground) feature.label.fontBackground = Style.styles[tag.value].fontBackground
					if (Style.styles[tag.value].text) {
						if (Object.isFunction(Style.styles[tag.value].text)) feature.label.text = Style.styles[tag.value].text.apply(feature)
						else feature.label.text = Style.styles[tag.value].text
					}
					if (Style.styles[tag.value].pattern) {
						feature.pattern_img = new Image()
						feature.pattern_img.src = Style.styles[tag.value].pattern
					}
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
				// check tags for refresh:
				if (Style.styles[tag.key] && Style.styles[tag.key]['refresh']) {

					$H(Style.styles[tag.key]['refresh']).each(function(pair) {
						Style.create_refresher(feature, pair.key, pair.value)
					})
				}
				if (Style.styles[tag.value] && Style.styles[tag.value]['refresh']) {
					if(!feature.style_generators) feature.style_generators = {}
					$H(Style.styles[tag.value]['refresh']).each(function(pair) {
						Style.create_refresher(feature, pair.key, pair.value)
					})
				}
			})
		} catch(e) {
			Cartagen.debug("There was an error in your stylesheet. Please check http://wiki.cartagen.org for the GSS spec. Error: "+trace(e))
		}
	},
	create_refresher: function(feature, property, interval) {
		if (Object.isFunction(feature[property])) { //sanity check
            if (['fontBackground', 'fontColor', 'fontScale', 'fontSize', 'text'].include(property)) {
                feature = feature.label
            }
			if(!feature.style_generators) feature.style_generators = {}
			if(!feature.style_generators.executers) feature.style_generators.executers = {}
			feature.style_generators[property] = feature[property]
			Style.refresh_style(feature, property)
			feature.style_generators.executers[property] = new PeriodicalExecuter(function() {
				Style.refresh_style(feature, property)
			}, interval)
		}
	},
	refresh_style: function(feature, property) {
		feature[property] = feature.style_generators[property]()
	},
	// sets the canvas 'pen' styles using the object.foo style definitions
	apply_style: function(feature) {
		canvas.globalOpacity = 1
		if (feature.opacity) {
			canvas.globalOpacity = Object.value(feature.opacity)
		}
		if (feature.strokeStyle) {
			 strokeStyle(Object.value(feature.strokeStyle))
		}
		if (feature.fillStyle) {
			fillStyle(Object.value(feature.fillStyle))
		}
		if (feature.pattern_img) {
			fillStyle(canvas.createPattern(feature.pattern_img,'repeat'))
		}
		if (feature.lineWidth) {
			lineWidth(Object.value(feature.lineWidth))
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
	// same as apply_style but just for fonts. This was necessary because
	// strokeStyle and such have to be reset *after* drawing actual polygons but
	// *before* drawing text.
	apply_font_style: function(feature) {
		if (feature.fontColor) {
			if (Object.isFunction(feature.fontColor)) strokeStyle(feature.fontColor())
			else strokeStyle(feature.fontColor)
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
				Cartagen.debug('applying '+stylesheet_url)
				Style.styles = ("{"+result.responseText+"}").evalJSON()
				Style.stylesheet_source = "{"+result.responseText+"}"
				Style.apply_gss(Style.stylesheet_source)
				// populate the gss field
				if($('gss_textarea')) {
					$('gss_textarea').value = Style.stylesheet_source
				}
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

var Geohash = {
	hash: new Hash(),
	default_length: 4, // default length of geohash
	// adds a feature to a geohash index
	put: function(lat,lon,feature,length) {
		if (!length) length = this.default_length
		var _short_hash = encodeGeoHash(lat,lon).truncate(length,"")
		// check to see if the geohash is already populated:
		var merge_hash = this.hash.get(_short_hash)
		if (!merge_hash) {
			merge_hash = [feature]
		} else {
			merge_hash.push(feature)
		}
		this.hash.set(_short_hash,merge_hash)
	},
	// fetch features in a geohash index
	get: function(key,length) {
		if (!length) length = this.default_length
		key = key.truncate(length,"") // default length of geohash
		return this.hash.get(key)
	},
	trace: function() {
		this.hash.keys().each(function(key) {
			Cartagen.debug(this.hash.get(key).length)
		},this)
	}
}

var Cartagen = {
	object_count: 0,
	way_count: 0,
	node_count: 0,
	requested_plots: 0,
	stylesheet: "/style.gss",
	live: false,
	powersave: true,
	zoom_out_limit: 0.02,
	zoom_in_limit: 0,
	simplify: 1,
	live_gss: false, // this is for inline gss editing, generally only on cartagen.org
	static_map: true,
	static_map_layers: ["/static/rome/park.js"],
	dynamic_layers: [],
	range: 0.001,
	lat1: 41.9227, // these are the initial bounding boxes for the viewport
	lat2: 41.861,
	lng1: 12.4502,
	lng2: 12.5341,
	zoom_level: 0.05,
	plots: new Hash(),
	nodes: new Hash(),
	ways: new Hash(),
	fullscreen: true,
	bleed_level: 1,
	initial_bleed_level: 2, // this is how much plots bleed on the initial pageload
    label_queue: [], // queue of labels to draw
    debug_mode: typeof console != "undefined",
	setup: function(configs) {
		// geolocate with IP if available
		if (navigator.geolocation) navigator.geolocation.getCurrentPosition(User.set_loc)
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
			if (Prototype.Browser.MobileSafari) {
				this.get_static_plot(this.static_map_layers[0])
				this.get_static_plot(this.static_map_layers[1])
			} else {
				this.static_map_layers.each(function(layer_url) {
					Cartagen.debug('fetching '+layer_url)
					this.get_static_plot(layer_url)
				},this)
				if (this.dynamic_layers.length > 0) {
					this.dynamic_layers.each(function(layer_url) {
						Cartagen.debug('fetching '+layer_url)
						load_script(layer_url)
					},this)
				}
			}
		}
	},
	// Runs every frame in the draw() method. An attempt to isolate cartagen code from general GLOP code
	draw: function() {
		this.object_count = 0
		this.way_count = 0
		this.node_count = 0
		Map.refresh_resolution()
		if (Prototype.Browser.MobileSafari || window.PhoneGap) Cartagen.simplify = 2
		
		Style.style_body()

		translate(width/2,height/2)
			rotate(Map.rotate)
			scale(Cartagen.zoom_level,Cartagen.zoom_level)
	 	translate(width/-2,height/-2)
		// rotate(-1*Map.rotate)
			translate((-1*Map.x)+(width/2),(-1*Map.y)+(height/2))
		// rotate(Map.rotate)

		// viewport stuff:
		strokeStyle('white')
		lineWidth(10)
		viewport_width = width*(1/Cartagen.zoom_level)-(100*(1/Cartagen.zoom_level))
		viewport_height = height*(1/Cartagen.zoom_level)-(100*(1/Cartagen.zoom_level))
		viewport = [Map.y-viewport_height/2,Map.x-viewport_width/2,Map.y+viewport_height/2,Map.x+viewport_width/2]
		strokeRect(Map.x-viewport_width/2,Map.y-viewport_height/2,viewport_width,viewport_height)
	},
    // runs every frame in the draw() method, after Globjects have been drawn
    post_draw: function() {
        this.label_queue.each(function(item) {
            item[0].draw(item[1], item[2])
        })
		this.label_queue = []
    },
    // adds the label to the list of labels to be drawn when
    queue_label: function(label, x, y) {
        this.label_queue.push([label, x, y])
    },
	// show alert if it's IE:
	browser_check: function() {
		if ($('browsers')) {
			$('browsers').absolutize;
			$('browsers').style.top = "100px";
			$('browsers').style.margin = "0 auto";
			if (Prototype.Browser.IE) $('browsers').show();
		}
	},
	get_url_param: function(name) {  
		name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");  
		var regexS = "[\\?&]"+name+"=([^&#]*)";  
		var regex = new RegExp( regexS );  
		var results = regex.exec( window.location.href );  
		if( results == null )    return "";  
		else return results[1];
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
			Cartagen.get_cached_plot(new_lat1,new_lng1,new_lat2,new_lng2,Cartagen.bleed_level)
		}
		lastPos[0] = Map.x
		lastPos[1] = Map.y
	},
	// fetches a JSON plot from a static file, given a full url
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
				Cartagen.debug("Total plots: "+Cartagen.plots.size()+", of which "+Cartagen.requested_plots+" are still loading.")
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
		Cartagen.live_gss = !Cartagen.live_gss
	},
	// sends user to an image of the current canvas
	redirect_to_image: function() {
		document.location = canvas.canvas.toDataURL();
	},
    debug: function(msg) {
        console.log(msg)
    }
}

var Map = {
	initialize: function() {
		this.x = Projection.lon_to_x((Cartagen.lng1+Cartagen.lng2)/2)
		this.y = Projection.lat_to_y((Cartagen.lat1+Cartagen.lat2)/2)
	},
	pointer_x: function() { return Map.x+(((width/-2)-Mouse.x)/Cartagen.zoom_level) },
	pointer_y: function() { return Map.y+(((height/-2)-Mouse.y)/Cartagen.zoom_level) },
	x: 0,
	y: 0,
	rotate: 0,
	rotate_old: 0,
	x_old: 0,
	y_old: 0,
	// Res down for zoomed-out... getting a NaN for x % 0. Not that much savings yet.
	resolution: Math.round(Math.abs(Math.log(Cartagen.zoom_level))),
	refresh_resolution: function() {
		this.resolution = Math.round(Math.abs(Math.log(Cartagen.zoom_level)))
	},
	// [lon1, lat2, lon2, lat1]
	get_bbox: function() {
		var lon1 = Projection.x_to_lon(Map.x - (width/2))
		var lon2 = Projection.x_to_lon(Map.x + (width/2))
		var lat1 = Projection.y_to_lat(Map.y - (height/2))
		var lat2 = Projection.y_to_lat(Map.y + (height/2))
		return [lon1, lat2, lon2, lat1]
	}
}

var Node = Class.create({
	radius: 6,
	tags: new Hash(),
	fillStyle: "#555",
	fontColor: "#eee",
	fontSize: 12,
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
  }
})

var Way = Class.create({
	age: 0,
	highlight: false,
	nodes: [],
	label: null,
	closed_poly: false,
	tags: new Hash(),
	fillStyle: "#555",
	fontColor: "#eee",
	fontSize: 12,
    initialize: function(data) {
		Object.extend(this, data)
		this.bbox = Geometry.calculate_bounding_box(this.nodes)
		if (this.nodes[0].x == this.nodes[this.nodes.length-1].x && this.nodes[0].y == this.nodes[this.nodes.length-1].y) this.closed_poly = true
		if (this.tags.get('natural') == "coastline") this.closed_poly = true
		if (this.closed_poly) {
			var centroid = Geometry.poly_centroid(this.nodes)
			this.x = centroid[0]*2
			this.y = centroid[1]*2
		} else {
		// attempt to make letters follow line segments:
			this.x = (this.middle_segment()[0].x+this.middle_segment()[1].x)/2
			this.y = (this.middle_segment()[0].y+this.middle_segment()[1].y)/2
		}
		this.area = poly_area(this.nodes)
		this.label = new Label(this)
		Style.parse_styles(this,Style.styles.way)
		// geohash.set(encodeGeoHash())
		objects.push(this)
		Geohash.put(Projection.y_to_lat(this.y),Projection.x_to_lon(this.x),this,6)
		Cartagen.ways.set(this.id,this)
    },
	// returns the middle-most line segment as a tuple [node_1,node_2]
	middle_segment: function() {
		// Cartagen.debug(this.nodes[Math.floor(this.nodes.length/2)+1])
        if (this.nodes.length == 1) {
            return this.nodes[0]
        }
        else if (this.nodes.length == 2) {
            return [this.nodes[0], this.nodes[1]]
        }
        else {
            return [this.nodes[Math.floor(this.nodes.length/2)],this.nodes[Math.floor(this.nodes.length/2)+1]]
        }
	},
	middle_segment_angle: function() {
        var segment = this.middle_segment()
        if (segment[1]) {
            var _x = segment[0].x-segment[1].x
            var _y = segment[0].y-segment[1].y
            return (Math.tan(_y/_x)/1.7)
        } else return 90
	},
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
				lineWidth(3/Cartagen.zoom_level)
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

		// show bboxes for ways:
		// lineWidth(1)
		// strokeStyle('red')
		// strokeRect(this.bbox[1],this.bbox[0],this.bbox[3]-this.bbox[1],this.bbox[2]-this.bbox[0])

		// draw label if we're zoomed in enough'
		if (Cartagen.zoom_level > 0.3) {
			Cartagen.queue_label(this.label, this.x, this.y)
		}
	    canvas.restore()
	}
})

var Label = Class.create({
    fontFamily: 'Lucida Grande',
    fontSize: 11,
    fontBackground: null,
    text: null,
    fontScale: false,
    padding: 6,
    fontColor: '#eee',
    initialize: function(_way) {
        this.way = _way
    },
    draw: function(_x, _y) {
        if (this.text) {
            canvas.save()
            //this.text = this.way.id
            Style.apply_font_style(this)

			// try to rotate the labels on unclosed ways:
			try {
				if (!this.way.closed_poly) {
					translate(_x,_y)
					rotate(this.way.middle_segment_angle())
					translate(-1*_x,-1*_y)
				}
			} catch(e) {console.log(e)}
			if (this.fontScale == "fixed") {
				var _height = Object.value(this.fontSize)
				var _padding = Object.value(this.padding)
			} else {
				var _height = Object.value(this.fontSize)/Cartagen.zoom_level
				var _padding = Object.value(this.padding)/Cartagen.zoom_level
			}

			if (canvas.fillText) { // || Prototype.Browser.Gecko) {
				canvas.font = _height+"pt "+this.fontFamily
				var _width = canvas.measureText(Object.value(this.text)).width
				if (this.fontBackground) {
					fillStyle(Object.value(this.fontBackground))
					rect(_x-((_width+_padding)/2),_y-((_height/2+(_padding/2))),_width+_padding,_height+_padding)
				}
				fillStyle(Object.value(this.fontColor))
	            canvas.fillText(Object.value(this.text),_x-(_width/2),_y+(_height/2))	
			} else {
				var _width = canvas.measureCanvasText(Object.value(this.fontFamily),_height,this.text)
				if (this.fontBackground) {
					fillStyle(Object.value(this.fontBackground))
					rect(_x-((_width+_padding)/2),_y-((_height/2+(_padding/2))),_width+_padding,_height+_padding)
				}
				drawTextCenter(Object.value(this.fontFamily),_height,_x,_y+(_height/2),Object.value(this.text))
			}
			canvas.restore()
        }
    }


})
var Projection = {
	current_projection: 'spherical_mercator',
	scale_factor: 100000,
	set: function(new_projection) {
		this.current_projection = new_projection
	},
	lon_to_x: function(lon) { return -1*Projection[Projection.current_projection].lon_to_x(lon) },
	x_to_lon: function(x) { return -1*Projection[Projection.current_projection].x_to_lon(x) },
	lat_to_y: function(lat) { return -1*Projection[Projection.current_projection].lat_to_y(lat) },
	y_to_lat: function(y) { return -1*Projection[Projection.current_projection].y_to_lat(y) },
	//required by spherical mercator:
	center_lon: function() { return (Cartagen.lng2+Cartagen.lng1)/2 },
	spherical_mercator: {
		lon_to_x: function(lon) { return (lon - Projection.center_lon()) * -1 * Projection.scale_factor },
		x_to_lon: function(x) { return (x/(-1*Projection.scale_factor)) + Projection.center_lon() },
		lat_to_y: function(lat) { return ((180/Math.PI * (2 * Math.atan(Math.exp(lat*Math.PI/180)) - Math.PI/2))) * Projection.scale_factor * 1.7 },
		y_to_lat: function(y) { return (180/Math.PI * Math.log(Math.tan(Math.PI/4+(y/(Projection.scale_factor*1.7))*(Math.PI/180)/2))) }
	},
	elliptical_mercator: {
		lon_to_x: function(lon) {
		    var r_major = 6378137.000;
		    return r_major * lon;
		},
		x_to_lon: function(x) {
		    var r_major = 6378137.000;
		    return lon/r_major;
		},
		lat_to_y: function(lat) {
		    if (lat > 89.5)
		        lat = 89.5;
		    if (lat < -89.5)
		        lat = -89.5;
		    var r_major = 6378137.000;
		    var r_minor = 6356752.3142;
		    var temp = r_minor / r_major;
		    var es = 1.0 - (temp * temp);
		    var eccent = Math.sqrt(es);
		    var phi = lat;
		    var sinphi = Math.sin(phi);
		    var con = eccent * sinphi;
		    var com = .5 * eccent;
		    con = Math.pow(((1.0-con)/(1.0+con)), com);
		    var ts = Math.tan(.5 * ((Math.PI*0.5) - phi))/con;
		    var y = 0 - r_major * Math.log(ts);
		    return y;
		},
		y_to_lat: function(y) {
			// unknown
		}
		
	}
}
User = {
	color: randomColor(),
	name: 'anonymous',
	// lat & lon are based on geolocation:
	lat: 0,
	lon: 0,
	x: -118.31700000003664,
	y: -6562600.9880228145,
	node_submit_uri: '/node/write',
	node_updates_uri: '/node/read',
	way_submit_uri: '/way/write',
	way_update_uri: '/way/read',
	line_width: 10,
	node_radius: 50,
	follow_interval: 60,
	following: false,
	following_executer: null,
	drawing_way: false,
	set_loc: function(loc) {
		if (loc.coords) {
			User.lat = loc.coords.latitude
			User.lon = loc.coords.longitude
		}
		else {
			User.lat = loc.latitude
			User.lon = loc.longitude
		}
		// User.calculate_coords()
		Cartagen.debug('detected location: '+this.lat+","+this.lon)
	},
	calculate_coords: function() {
		// this should be based on lat and lon
	},
	create_node: function(_x, _y, _draw, id) {
		if (Object.isUndefined(_x)) _x = User.x
		if (Object.isUndefined(_y)) _y = User.y
		if (Object.isUndefined(id)) id = 'temp_' + (Math.random() * 999999999).floor()
		var node = new Node()
		node.x = _x
		node.y = _y
		node.radius = User.node_radius
		node.id = id
		node.lon = Projection.x_to_lon(_x)
		node.lat = Projection.y_to_lat(_y)
		node.fillStyle = User.color
		
		if (_draw) {
			objects.push(node)
        	draw()
		}
		
		return node
	},
	submit_node: function(_x, _y) {
		var node = User.create_node(_x, _y, true)
		var params = {
			color: User.color,
			lon: node.lon,
			lat: node.lat,
			author: User.name
		}
		new Ajax.Request(User.node_submit_uri, {
			method: 'post',
			parameters: params,
			onSuccess: function(transport) {
				node.id = 'cartagen_' + transport.responseText
				Cartagen.debug('saved node with id ' + node.id)
			}
		})
	},
	toggle_following: function() {
		if (User.following) {
			User.following_executer.stop()
			User.following = false
		}
		else {
			User.following_executer = new PeriodicalExecuter(User.center_map_on_user, User.follow_interval)
			User.following = true
			User.center_map_on_user()
		}
	},
	center_map_on_user: function() {
		//navigator.geolocation.getCurrentPosition(User.set_loc_and_center)
		User.set_loc_and_center()
	},
	set_loc_and_center: function(loc) {
		//User.set_loc(loc)
		Map.x = User.x
		Map.y = User.y
		draw()
	},
	toggle_way_drawing: function(_x, _y) {
		if (User.drawing_way) {
			User.add_node(_x, _y)
			User.submit_way(User.way)

		}
		else {
			User.way = new Way({
				id: 'temp_' + (Math.random() * 999999999).floor(),
				author: User.name,
				nodes: [User.create_node(_x,_y,true)],
				tags: new Hash()
			})
			User.way.closed_poly = false
			User.way.strokeStyle = User.color
			User.way.lineWidth = User.line_width
			User.way.age = 40
			draw()			
		}
		User.drawing_way = !User.drawing_way
	},
	submit_way: function(_way) {
 		var params = {
			color: User.color,
			author: User.name,
			bbox: _way.bbox,
			nodes: _way.nodes.collect(function(node) {
				return [node.lon, node.lat]
			})
		}
		Cartagen.debug(_way.nodes)
		Cartagen.debug(params)
		new Ajax.Request(User.way_submit_uri, {
			parameters: {way: Object.toJSON(params)},
			onSuccess: function(transport) {
				_way.id = 'cartagen_' + transport.responseJSON.way_id
				_way.nodes.each(function(nd) {
					nd.id = 'cartagen_' + transport.responseJSON.node_ids.shift()
				})
			}
		})
		Cartagen.debug(_way)
	},
	add_node: function(_x, _y) {
		node = User.create_node(_x, _y, true)
		User.way.nodes.push(node)
		User.way.bbox = Geometry.calculate_bounding_box(User.way.nodes)
		draw()
	},
	update: function() {
		if (User.last_pos && User.last_pos == lastPos) {
			 var timestamp = User.last_update
		}
		User.last_pos = lastPos
		User.last_update = (new Date()).toUTCString()
		
		
		new Ajax.Request(User.node_update_uri, {
		})
	}	
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

// use poly_area(nodes,true) for signed area
function poly_area(nodes) {
	var area = 0
	nodes.each(function(node,index) {
		if (index < nodes.length-1) next = nodes[index+1]
		else next = nodes[0]
		if (index > 0) last = nodes[index-1]
		else last = nodes[nodes.length-1]
		area += last.x*node.y-node.x*last.y+node.x*next.y-next.x*node.y
	})
	if (arguments[1] == true) return area/2
	else return Math.abs(area/2)
}

var Geometry = {
	poly_centroid: function(polygon) {
		var n = polygon.length
		var cx = 0, cy = 0
		var a = poly_area(polygon,true)
		var centroid = []
		var i,j
		var factor = 0
		
		for (i=0;i<n;i++) {
			j = (i + 1) % n
			factor = (polygon[i].x * polygon[j].y - polygon[j].x * polygon[i].y)
			cx += (polygon[i].x + polygon[j].x) * factor
			cy += (polygon[i].y + polygon[j].y) * factor
		}
		
		a *= 6
		factor = 1/a
		cx *= factor
		cy *= factor
		centroid[0] = cx
		centroid[1] = cy
		return centroid
	},
	calculate_bounding_box: function(points) {
		var bbox = [0,0,0,0] // top, left, bottom, right
		points.each(function(node) {
			if (node.x < bbox[1] || bbox[1] == 0) bbox[1] = node.x
			if (node.x > bbox[3] || bbox[3] == 0) bbox[3] = node.x
			if (node.y < bbox[0] || bbox[0] == 0) bbox[0] = node.y
			if (node.y > bbox[2] || bbox[2] == 0) bbox[2] = node.y
		})
		return bbox
	}
	
	/*
	PolygonCenterOfMass(Point[] polygon,int N)
	{
		float cx=0,cy=0;
		float A=(float)SignedPolygonArea(polygon,N);
		Point2Df res=new Point2Df();
		int i,j;

		float factor=0;
		for (i=0;i<N;i++) {
			j = (i + 1) % N;
			factor=(polygon[i].x*polygon[j].y-polygon[j].x*polygon[i].y);
			cx+=(polygon[i].x+polygon[j].x)*factor;
			cy+=(polygon[i].y+polygon[j].y)*factor;
		}
		A*=6.0f;
		factor=1/A;
		cx*=factor;
		cy*=factor;
		res.x=cx;
		res.y=cy;
		return res;
	}
	*/
}

// add Object.value, which returns the argument, unless the argument is a function,
// in which case it calls the function and returns the result
Object.value = function(obj) {
    if(Object.isFunction(obj)) return obj()
    return obj
}

// This duplicates a function call in glop.js... load order issues
function randomColor() {
	return "rgb("+Math.round(Math.random()*255)+","+Math.round(Math.random()*255)+","+Math.round(Math.random()*255)+")"
}


// Rotates view slowly for cool demo purposes.
function demo() { try { Map.rotate += 0.005 } catch(e) {}}