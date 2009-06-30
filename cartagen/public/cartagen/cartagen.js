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

var objects = []

PhoneGap = window.DeviceInfo && DeviceInfo.uuid != undefined // temp object unitl PhoneGap is initialized

if (typeof cartagen_base_uri == 'undefined') {
    cartagen_base_uri = 'cartagen'
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
	live_gss: false,
	static_map: true,
	static_map_layers: ["/static/rome/park.js"],
	dynamic_layers: [],
	precision: 0.001,
	lat1: 41.9227,
	lat2: 41.861,
	lng1: 12.4502,
	lng2: 12.5341,
	zoom_level: 0.5,
	plots: new Hash(),
	nodes: new Hash(),
	ways: new Hash(),
	fullscreen: true,
	bleed_level: 1,
	initial_bleed_level: 2,
	label_queue: [],
	feature_queue: [],
        debug: false,
	scripts: [],
	load_user_features: false,
	setup: function(configs) {
		if (navigator.geolocation) navigator.geolocation.getCurrentPosition(User.set_loc)
		this.initialize(configs)
	},
	initialize: function(configs) {
		Object.extend(this, configs)
		if (this.get_url_param('gss')) this.stylesheet = this.get_url_param('gss')

		if(window.PhoneGap) {
			scripts.unshift(cartagen_base_uri + '/lib/phonegap/phonegap.base.js',
						    cartagen_base_uri + '/lib/phonegap/geolocation.js',
						    cartagen_base_uri + '/lib/phonegap/iphone/phonegap.js',
						    cartagen_base_uri + '/lib/phonegap/iphone/geolocation.js')
		}

		Cartagen.load_next_script()

		this.browser_check()

		document.fire('cartagen:init')

		$('canvas').observe('glop:draw', Cartagen.draw.bindAsEventListener(this))
		$('canvas').observe('glop:postdraw', Cartagen.post_draw.bindAsEventListener(this))

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
			if (this.dynamic_layers.length > 0) {
				this.dynamic_layers.each(function(layer_url) {
					$l('fetching '+layer_url)
					load_script(layer_url)
				},this)
			}
		}

		Glop.draw()

		document.fire('cartagen:postinit')
	},
	draw: function(e) {
		e.no_draw = true

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

        Viewport.width = Glop.width * (1 / Cartagen.zoom_level) - (2 * Viewport.padding * (1 / Cartagen.zoom_level))
        Viewport.height = Glop.height * (1 / Cartagen.zoom_level) - (2 * Viewport.padding * (1 / Cartagen.zoom_level))
        Viewport.width = Math.max(Viewport.width, Viewport.height)
        Viewport.height = Viewport.width
        Viewport.bbox = [Map.y - Viewport.height / 2, Map.x - Viewport.width / 2, Map.y + Viewport.height / 2, Map.x + Viewport.width / 2]


		$('canvas').fire('cartagen:predraw')

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
    post_draw: function() {
        this.label_queue.each(function(item) {
            item[0].draw(item[1], item[2])
        })

		this.label_queue = []
    },
    queue_label: function(label, x, y) {
        this.label_queue.push([label, x, y])
    },
	browser_check: function() {
		if ($('browsers')) {
			$('browsers').absolutize();
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
					})
				} else {
					data.tags.set(way.tag.k,way.tag.v)
				}
				new Way(data)
			}
		})

		Geohash.sort_objects()
	},
	plot_array: [],
	get_current_plot: function(force) {
		force = force || false
		if ((Map.x != Map.last_pos[0] && Map.y != Map.last_pos[1]) || force != false || Glop.frame < 100) {
			if (Geohash.keys && Geohash.keys.keys()) {
				try {
				$l('keys: '+Geohash.keys.size())
				Geohash.keys.keys().each(function(key) {
					if (key.length == 6) Cartagen.get_cached_plot(key)
				})
				} catch(e) {
					$l(e)
				}
			}
		}
		Map.last_pos[0] = Map.x
		Map.last_pos[1] = Map.y
	},
	get_static_plot: function(url) {
		$l('fetching ' + url)
		Cartagen.requested_plots++
		new Ajax.Request(url,{
			method: 'get',
			onComplete: function(result) {
				$l('got ' + url)
				Cartagen.parse_objects(result.responseText.evalJSON())
				$l(objects.length+" objects")
				Cartagen.requested_plots--
				if (Cartagen.requested_plots == 0) Event.last_event = Glop.frame
				$l("Total plots: "+Cartagen.plots.size()+", of which "+Cartagen.requested_plots+" are still loading.")
			}
		})
	},
	get_cached_plot: function(key) {

		if (!Cartagen.live) {
			if (Cartagen.plots.get(key)) {
			} else {
				if (typeof localStorage != "undefined") {
					var ls = localStorage.getItem('geohash_'+key)
					if (ls) {
						$l("localStorage cached plot")
						Cartagen.parse_objects(ls.evalJSON())
					} else {
						Cartagen.load_plot(key)
					}
				} else {
					Cartagen.load_plot(key)
				}
			}
		} else {
			Cartagen.load_plot(key)
		}

		Cartagen.plots.set(key, true)
	},
	delayed_get_cached_plot: function(_lat1,_lng1,_lat2,_lng2,_bleed) {
		bleed_delay = 1000+(2000*Math.random(_lat1+_lng1)) //milliseconds, with a random factor to stagger requests
		setTimeout("Cartagen.get_cached_plot("+_lat1+","+_lng1+","+_lat2+","+_lng2+","+_bleed+")",bleed_delay)
	},
	load_plot: function(key) {
		$l('loading geohash plot: '+key)


		Cartagen.requested_plots++
		var finished = false
		var req = new Ajax.Request('/api/0.6/geohash/'+key+'.json',{
			method: 'get',
			onSuccess: function(result) {
				finished = true
				Cartagen.parse_objects(result.responseText.evalJSON())
				if (localStorage) localStorage.setItem('geohash_'+key,result.responseText)
				Cartagen.requested_plots--
				if (Cartagen.requested_plots == 0) Event.last_event = Glop.frame
				$l("Total plots: "+Cartagen.plots.size()+", of which "+Cartagen.requested_plots+" are still loading.")
			},
			onFailure: function() {
				Cartagen.requested_plots--
			}
		})

		var f = function(){
			if (!finished) {
				Cartagen.plots.set(key, false)
				req.transport.onreadystatechange = Prototype.emptyFunction
				req.transport.abort()
				$l("Request aborted. Total plots: "+Cartagen.plots.size()+", of which "+Cartagen.requested_plots+" are still loading.")
			}
		}
		f.delay(120)
	},
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
	redirect_to_image: function() {
		document.location = $C.to_data_url();
	},
	load_next_script: function() {
		$l("loading: "+Cartagen.scripts[0])
		if (Cartagen.scripts.length > 0) {
			Cartagen.load_script(Cartagen.scripts.splice(0,1)[0])
		}
	},
	load_script: function(script) {
		$$('head')[0].insert(new Element('script', {
			'src': script,
			'type': 'text/javascript',
			'charset': 'utf-8',
			evalJSON: 'force'
		}));
	},
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

var Geometry = {
	poly_centroid: function(polygon) {
		var n = polygon.length
		var cx = 0, cy = 0
		var a = Geometry.poly_area(polygon,true)
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
	},
	overlaps: function(x1,y1,x2,y2,fudge) {
		if (x2 > x1-fudge && x2 < x1+fudge) {
			if (y2 > y1-fudge && y2 < y1+fudge) {
		  		return true
			} else {
				return false
			}
		} else {
			return false
		}
	},
	intersect: function(box1top,box1left,box1bottom,box1right,box2top,box2left,box2bottom,box2right) {
		return !(box2left > box1right || box2right < box1left || box2top > box1bottom || box2bottom < box1top)
	},
	is_point_in_poly: function(poly, x, y){
	    for(var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
	        ((poly[i].y <= y && y < poly[j].y) || (poly[j].y <= y && y < poly[i].y))
	        && (x < (poly[j].x - poly[i].x) * (y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x)
	        && (c = !c);
	    return c;
	},
	poly_area: function(nodes, signed) {
		var area = 0
		nodes.each(function(node,index) {
			if (index < nodes.length-1) next = nodes[index+1]
			else next = nodes[0]
			if (index > 0) last = nodes[index-1]
			else last = nodes[nodes.length-1]
			area += last.x*node.y-node.x*last.y+node.x*next.y-next.x*node.y
		})
		if (signed) return area/2
		else return Math.abs(area/2)
	}
}
$D = {
	enabled: false,
	init: function(){
		if (Cartagen.debug) {
			$D.enable()
		}
	},
	enable: function() {
		$D.enabled = true
		if (console.firebug) {
			$D.log = console.debug
			$D.warn = console.warn
			$D.err = console.error
			$D.trace = console.trace
			$D.verbose_trace = $D._verbose_trace
		}
		else {
			$D.log = $D._log
			$D.warn = $D._warn
			$D.err = $D._err
			$D.trace = $D._trace
			$D.verbose_trace = $D._verbose_trace
		}
		$l = $D.log
	},
	disable: function() {
		$D.enabled = false

		(['log', 'warn', 'err', 'trace', 'verbose_trace']).each(function(m) {
			$D[m] = Prototype.emptyFunction
		})
	},

	log: Prototype.emptyFunction,

	_log: function(msg) {
		console.log(msg)
	},

	warn: Prototype.emptyFunction,

	_warn: function(msg) {
		console.warn(msg)
	},

	err: Prototype.emptyFunction,

	_err: function(msg) {
		console.err(msg)
	},

	trace: Prototype.emptyFunction,

	_trace: function() {
		console.trace()
	},

	verbose_trace: Prototype.emptyFunction,

	_verbose_trace: function(msg) {
		console.log("An exception occurred in the script. Error name: " + msg.name + ". Error description: " + msg.description + ". Error number: " + msg.number + ". Error message: " + msg.message + ". Line number: "+ msg.lineNumber)
	}
}

$l = $D.log

document.observe('cartagen:init', $D.init)

Math.in_range = function(v,r1,r2) {
	return (v > Math.min(r1,r2) && v < Math.max(r1,r2))
}

Object.value = function(obj, context) {

    if(Object.isFunction(obj)) {
		context = context || this
		f = obj.bind(context)
		return f()
	}
    return obj
}

Number.prototype.to_precision = function(prec){
	return (this * (1/prec)).round()/(1/prec)
}

Cartagen.demo = function() { Map.rotate += 0.005 }
var Geohash = {
	_dirs: ['top','bottom','left','right'],
	hash: new Hash(),
	objects: [],
	grid: true,
	default_length: 6, // default length of geohash
	limit_bottom: 8, // 12 is most ever...
	last_get_objects: [0,0,0],
	init: function() {
		$('canvas').observe('cartagen:predraw', this.draw.bindAsEventListener(this))
		$('canvas').observe('glop:postdraw', this.draw_bboxes.bindAsEventListener(this))
	},
	draw: function() {
		if (Geohash.objects.length == 0 || Cartagen.zoom_level/this.last_get_objects[2] > 1.1 || Cartagen.zoom_level/this.last_get_objects[2] < 0.9 || Math.abs(this.last_get_objects[0] - Map.x) > 50 || Math.abs(this.last_get_objects[1] - Map.y) > 50) {
			this.get_objects()
			$l('re-getting-objects')
		}
	},
	put: function(lat,lon,feature,length) {
		if (!length) length = this.default_length
		var key = this.get_key(lat,lon,length)

		var merge_hash = this.hash.get(key)
		if (!merge_hash) {
			merge_hash = [feature]
		} else {
			merge_hash.push(feature)
		}

		this.hash.set(key,merge_hash)
	},
	put_object: function(feature) {
		this.put(Projection.y_to_lat(feature.y),
		         Projection.x_to_lon(-feature.x),
		         feature,
		         this.get_key_length(feature.width,feature.height))
	},
	get_key: function(lat,lon,length) {
		if (!length) length = this.default_length
		if (length < 1) length = 1

		return encodeGeoHash(lat,lon).truncate(length,'')
	},
	get: function(lat,lon,length) {
		if (!length) length = this.default_length

		var key = this.get_key(lat,lon,length)
		return this.hash.get(key)
	},
	get_from_key: function(key) {
		return this.hash.get(key) || []
	},
	get_upward: function(key) {
		key.truncate(this.limit_bottom,'')

		var this_level = this.hash.get(key)

		if (this_level && key.length > 0) {
			if (key.length > 1) return this_level.concat(this.get_upward(key.truncate(key.length-1),''))
			else return this_level
		} else {
			if (key.length > 1) return this.get_upward(key.truncate(key.length-1),'')
			else return []
		}
	},
	get_keys_upward: function(key) {
		key.truncate(this.limit_bottom,'')

		if (key.length > 0) {
			this.keys.set(key, true)
			k = key.truncate(key.length-1,'')
			if (key.length > 1 && !Geohash.keys.get(k)) {
				this.get_keys_upward(k)
			}
		}
	},
	get_neighbors: function(key) {
		var neighbors = []

		this._dirs.each(function(dir) {
			var n_key = calculateAdjacent(key, dir)
			var n_array = this.get_from_key(n_key)
			if (n_array) neighbors = neighbors.concat(n_array)
		}, this)

		return neighbors
	},
	fill_bbox: function(key,keys) {
		this._dirs.each(function(dir) {
			var k = calculateAdjacent(key, dir)
			if (!keys.get(k)) {
				keys.set(k, true)

				var bbox = decodeGeoHash(k) //[lon1, lat2, lon2, lat1]
				if (Math.in_range(bbox.latitude[2],Map.bbox[3],Map.bbox[1]) &&
				    Math.in_range(bbox.longitude[2],Map.bbox[0],Map.bbox[2]))
						this.fill_bbox(k,keys)
			}
		}, this)
	},
	trace: function() {
		var lengths = new Hash
		this.hash.keys().each(function(key) {
			$l(key+': '+this.hash.get(key).length)
			if (!lengths.get(key.length)) lengths.set(key.length,0)
			lengths.set(key.length,lengths.get(key.length)+1)
		}, this)

		$l('Lengths >>')

		lengths.keys().sort().each(function(length) {
			$l(length+": "+lengths.get(length))
		})

		return this.hash.size()
	},
	bbox: function(geohash) {
		var geo = decodeGeoHash(geohash)
		return [geo.longitude[0],geo.latitude[1],geo.longitude[1],geo.latitude[0],geohash]
	},
	draw_bbox: function(key) {
		var bbox = this.bbox(key)

		var line_width = 1/Cartagen.zoom_level
		$C.line_width(line_width)
		$C.stroke_style('rgba(0,0,0,0.5)')

		var width = Projection.lon_to_x(bbox[2]) - Projection.lon_to_x(bbox[0])
		var height = Projection.lat_to_y(bbox[1]) - Projection.lat_to_y(bbox[3])

		$C.stroke_rect(Projection.lon_to_x(bbox[0]),
					   Projection.lat_to_y(bbox[3]),
					   width,
					   height)
		$C.save()
		$C.translate(Projection.lon_to_x(bbox[0]),Projection.lat_to_y(bbox[3]))
		$C.fill_style(Object.value(this.fontBackground))
		var height = 16 / Cartagen.zoom_level
		var width = $C.measure_text('Lucida Grande',
		                            height,
		                            key)
		var padding = 2
		$C.draw_text('Lucida Grande',
					 height,
					 'rgba(0,0,0,0.5)',
					 3/Cartagen.zoom_level,
					 -3/Cartagen.zoom_level,
					 key)
		$C.restore()
	},
	draw_bboxes: function() {
		if (Geohash.grid) {
			this.keys.keys().each(function(key){
				Geohash.draw_bbox(key)
			})
		}
	},
	get_key_length: function(lat,lon) {
		if      (lon < 0.0000003357) lon_key = 12
		else if (lon < 0.000001341)  lon_key = 11
		else if (lon < 0.00001072)   lon_key = 10
		else if (lon < 0.00004291)   lon_key = 9
		else if (lon < 0.0003433)    lon_key = 8
		else if (lon < 0.001373)     lon_key = 7
		else if (lon < 0.01098)      lon_key = 6
		else if (lon < 0.04394)      lon_key = 5
		else if (lon < 0.3515)       lon_key = 4
		else if (lon < 1.406)        lon_key = 3
		else if (lon < 11.25)        lon_key = 2
		else if (lon < 45)           lon_key = 1
		else                         lon_key = 0 // eventually we can map the whole planet at once

		if      (lat < 0.0000001676) lat_key = 12
		else if (lat < 0.000001341)  lat_key = 11
		else if (lat < 0.000005364)  lat_key = 10
		else if (lat < 0.00004291)   lat_key = 9
		else if (lat < 0.0001716)    lat_key = 8
		else if (lat < 0.001373)     lat_key = 7
		else if (lat < 0.005493)     lat_key = 6
		else if (lat < 0.04394)      lat_key = 5
		else if (lat < 0.1757)       lat_key = 4
		else if (lat < 1.40625)      lat_key = 3
		else if (lat < 5.625)        lat_key = 2
		else if (lat < 45)           lat_key = 1
		else                         lat_key = 0 // eventually we can map the whole planet at once

		return Math.min(lat_key,lon_key)
	},
	get_objects: function() {
		this.last_get_objects = [Map.x,Map.y,Cartagen.zoom_level]
		this.objects = []

		this.keys = new Hash

		this.key_length = this.get_key_length(0.0015/Cartagen.zoom_level, 0.0015/Cartagen.zoom_level)

		this.key = this.get_key(Map.lat, Map.lon, this.key_length)

		var bbox = decodeGeoHash(this.key) //[lon1, lat2, lon2, lat1]

		this.fill_bbox(this.key, this.keys)
		this.get_keys_upward(this.key)

		this.keys.keys().each(function(key, index) {
			this.get_keys_upward(key)
		}, this)

		this.keys.keys().each(function(key) {
			this.objects = (this.get_from_key(key)).concat(this.objects)
		}, this)

		return this.objects
	},
	sort_objects: function() {
		this.keys.values().each(function(value) {
			if (value.sort) value.sort(Cartagen.sort_by_area())
		})
	}
}

document.observe('cartagen:init', Geohash.init.bindAsEventListener(Geohash))
var Style = {
	properties: ['fillStyle', 'pattern', 'strokeStyle', 'opacity', 'lineWidth', 'outlineColor',
	             'outlineWidth', 'radius', 'hover', 'mouseDown'],

	label_properties: ['text', 'fontColor', 'fontSize', 'fontScale', 'fontBackground',
		               'fontRotation'],
	styles: {
		body: {
			fillStyle: "#eee",
			fontColor: "#eee",
			fontSize: 12,
			fontRotation: 0
		}
	},
	style_body: function() {
		$C.fill_style(Style.styles.body.fillStyle)
		if (Style.styles.body.pattern) {
			if (!Style.styles.body.pattern.src) {
				var value = Style.styles.body.pattern
				Style.styles.body.pattern = new Image()
				Style.styles.body.pattern.src = Object.value(value)
			}
			$C.fill_pattern(Style.styles.body.pattern, 'repeat')
		}
		$C.rect(0, 0, Glop.width, Glop.height)
		$C.stroke_rect(0, 0, Glop.width, Glop.height)
		$C.line_join('round')
		$C.line_cap('round')
	},
	parse_styles: function(feature,selector) {
		try {
		(this.properties.concat(this.label_properties)).each(function(property) {
			var val = selector[property]

			if (Style.styles[feature.name] && Style.styles[feature.name][property])
				val = Style.styles[feature.name][property]

			feature.tags.each(function(tag) {
				if (Style.styles[tag.key] && Style.styles[tag.key][property])
					val = Style.styles[tag.key][property]

				if (Style.styles[tag.value] && Style.styles[tag.value][property])
					val = Style.styles[tag.value][property]
			})

			if (val) {
				var f = feature
				if (this.label_properties.include(property)) {
					f = feature.label
				}

				if (val.gss_update_interval) {
					Style.create_refresher(f, property, val, val.gss_update_interval)
				}
				else {
					f[property] = Object.value(val, feature)
				}
			}
		}, this)
		} catch(e) {$l(e)}
	},
	create_refresher: function(feature, property, generator, interval) {
		if(!feature.style_generators) feature.style_generators = {}
		if(!feature.style_generators.executers) feature.style_generators.executers = {}

		feature.style_generators[property] = generator

		Style.refresh_style(feature, property)
		feature.style_generators.executers[property] = new PeriodicalExecuter(function() {
			Style.refresh_style(feature, property)
		}, interval)
	},
	refresh_style: function(feature, property) {
		feature[property] = Object.value(feature.style_generators[property], feature)
	},
	load_styles: function(stylesheet_url) {
		if (stylesheet_url[0,4] == "http") {
			stylesheet_url = "/map/style?url="+stylesheet_url
		}
		new Ajax.Request(stylesheet_url,{
			method: 'get',
			onComplete: function(result) {
				$l('applying '+stylesheet_url)

				Style.apply_gss(result.responseText)
			}
		})
	},
	apply_gss: function(gss_string) {
		var styles = ("{"+gss_string+"}").evalJSON()
		$H(styles).each(function(style) {
			if (style.value.refresh) {
				$H(style.value.refresh).each(function(pair) {
					style.value[pair.key].gss_update_interval = pair.value
				})
			}
		})

		Style.styles = styles

		if($('gss_textarea')) {
			$('gss_textarea').value = gss_string
		}
	}
}


var Feature = Class.create(
{
	initialize: function() {
		this.tags = new Hash()
		this.fillStyle = '#555'
		this.fontColor = '#eee'
		this.fontSize = 12
		this.fontRotation = 0
		this.opacity = 1
		this.strokeStyle = 'black'
		this.lineWidth = 0
		this._unhovered_styles = {}
		this._unclicked_styles = {}

		this.label = new Label(this)
	},
	draw: function() {
		Cartagen.object_count++
		$C.save()


		$C.fill_style(this.fillStyle)

		if (this.pattern) {
			if (!this.pattern.src) {
				var value = this.pattern
				this.pattern = new Image()
				this.pattern.src = value
			}
			$C.fill_pattern(this.pattern, 'repeat')
		}

		$C.stroke_style(this.strokeStyle)
		$C.opacity(this.opacity)
		$C.line_width(this.lineWidth)

		this.style()

		this.shape()
		$C.restore()

		if (Cartagen.zoom_level > 0.3) {
			Cartagen.queue_label(this.label, this.x, this.y)
		}
	},
	style: Prototype.emptyFunction,
	shape: function() {
		$D.warn('Feature#shape should be overriden')
	},
	apply_hover_styles: function() {
		$H(this.hover).each(function(pair) {
			if (this[pair.key]) this._unhovered_styles[pair.key] = this[pair.key]
			this[pair.key] = pair.value
		}, this)
	},
	remove_hover_styles: function() {
		Object.extend(this, this._unhovered_styles)
	},
	apply_click_styles: function() {
		$H(this.mouseDown).each(function(pair) {
			if (this[pair.key]) this._unclicked_styles[pair.key] = this[pair.key]
			this[pair.key] = pair.value
		}, this)
	},
	remove_click_styles: function() {
		Object.extend(this, this._unclicked_styles)
	}
})

var Node = Class.create(Feature,
{
	initialize: function($super) {
		this.radius = 6
		$super()
	},
	draw: function($super) {
		Cartagen.node_count++
		$super()
	},
	style: function() {

	},
	shape: function() {
		$C.begin_path()
		$C.translate(this.x, this.y-this.radius)
		$C.arc(0, this.radius, this.radius, 0, Math.PI*2, true)
		$C.fill()
		$C.stroke()
	}
})
var Way = Class.create(Feature,
{
    initialize: function($super, data) {
		$super()

		this.age = 0
		this.highlight = false
		this.nodes = []
		this.closed_poly = false

		this.outline_color = null
		this.outline_width = null

		Object.extend(this, data)

		if (this.nodes.length > 1 && this.nodes[0].x == this.nodes[this.nodes.length-1].x &&
			this.nodes[0].y == this.nodes[this.nodes.length-1].y)
				this.closed_poly = true

		if (this.tags.get('natural') == "coastline") this.closed_poly = true

		if (this.closed_poly) {
			var centroid = Geometry.poly_centroid(this.nodes)
			this.x = centroid[0]*2
			this.y = centroid[1]*2
		} else {
			this.x = (this.middle_segment()[0].x+this.middle_segment()[1].x)/2
			this.y = (this.middle_segment()[0].y+this.middle_segment()[1].y)/2
		}

		this.area = Geometry.poly_area(this.nodes)
		this.bbox = Geometry.calculate_bounding_box(this.nodes)

		this.width = Math.abs(Projection.x_to_lon(this.bbox[1])-Projection.x_to_lon(this.bbox[3]))
		this.height = Math.abs(Projection.y_to_lat(this.bbox[0])-Projection.y_to_lat(this.bbox[2]))

		Style.parse_styles(this,Style.styles.way)
		objects.push(this) // made obsolete by Geohash
		Geohash.put_object(this)
		Cartagen.ways.set(this.id,this)
    },
	 middle_segment: function() {
        if (this.nodes.length == 1) {
            return [this.nodes[0], this.nodes[0]]
        }
        else if (this.nodes.length == 2) {
            return [this.nodes[0], this.nodes[1]]
        }
        else {
            return [this.nodes[Math.floor(this.nodes.length/2)],
			        this.nodes[Math.floor(this.nodes.length/2)+1]]
        }
	},
	middle_segment_angle: function() {
        var segment = this.middle_segment()
        if (segment[1]) {
            var _x = segment[0].x-segment[1].x
            var _y = segment[0].y-segment[1].y
            return (Math.tan(_y/_x)/1.7)
        } else return 0
	},
	draw: function($super) {
		Cartagen.way_count++
		$super()
		this.age += 1;
	},
	style: function() {
		if (this.hover && this.closed_poly &&
			Geometry.is_point_in_poly(this.nodes, Map.pointer_x(), Map.pointer_y())) {
				if (!this.hover_styles_applied) {
					this.apply_hover_styles()
					this.hover_styles_applied = true
				}
				if (!Object.isUndefined(this.hover.action)) this.hover.action.bind(this)()
		}
		else if (this.hover_styles_applied) {
			this.remove_hover_styles()
			this.hover_styles_applied = false
		}

		if (this.mouseDown && Mouse.down == true && this.closed_poly &&
			Geometry.is_point_in_poly(this.nodes,Map.pointer_x(),Map.pointer_y())) {
				if (!this.click_styles_applied) {
					this.apply_click_styles()
					this.click_styles_applied = true
				}
				if (!Object.isUndefined(this.mouseDown.action)) this.mouseDown.action.bind(this)()
		}
		else if (this.click_styles_applied) {
			this.remove_click_styles()
			this.hover_click_applied = false
		}
	},
	shape: function() {

		if (this.highlight) {
			$C.line_width(3/Cartagen.zoom_level)
			$C.stroke_style("red")
		}
		if (Object.isUndefined(this.opacity)) this.opacity = 1
		if (this.age < 20) {
			$C.opacity(this.opacity*(this.age/20))
		} else {
			$C.opacity(this.opacity)
		}

		$C.begin_path()
		$C.move_to(this.nodes[0].x,this.nodes[0].y)

		if (Map.resolution == 0) Map.resolution = 1
		this.nodes.each(function(node,index){
			if ((index % Map.resolution == 0) || index == 0 || index == this.nodes.length-1 || this.nodes.length <= 30) {
				Cartagen.node_count++
				$C.line_to(node.x,node.y)
			}
		},this)

		if (this.outlineColor && this.outlineWidth) $C.outline(this.outlineColor,this.outlineWidth)
		else $C.stroke()
		if (this.closed_poly) $C.fill()

	}
})
var Label = Class.create(
{
    initialize: function(owner) {
		this.fontFamily = 'Lucida Grande',
	    this.fontSize = 11,
	    this.fontBackground = null,
	    this.text = null,
	    this.fontScale = false,
	    this.padding = 6,
	    this.fontColor = '#eee',
		this.fontRotation = 0,
        this.owner = owner
    },
    draw: function(x, y) {
        if (this.text) {
            $C.save()

            $C.stroke_style(this.fontColor)

			if (!Object.isUndefined(this.owner.closed_poly) && !this.owner.closed_poly) {
				$C.translate(x, y)
				$C.rotate(this.owner.middle_segment_angle())
				$C.translate(-x, -y)
			}

			if (this.fontRotation) {
				$C.translate(x, y)
				if (this.fontRotation == "fixed") {
					$C.rotate(-Map.rotate)
				} else if (Object.isNumber(this.fontRotation)) {
					$C.rotate(this.fontRotation)
				}
				$C.translate(-x, -y)
			}

			if (this.fontScale == "fixed") {
				var height = this.fontSize
				var padding = this.padding
			} else {
				var height = this.fontSize / Cartagen.zoom_level
				var padding = this.padding / Cartagen.zoom_level
			}


			var width = $C.measure_text(this.fontFamily,
			                            height,
			                            Object.value(this.text, this.owner))

			if (this.fontBackground) {
				$C.fill_style(this.fontBackground)
				$C.rect(x - (width + padding)/2,
						y - (height/2 + padding/2),
						width + padding,
				        height + padding)
			}

			$C.draw_text(this.fontFamily,
			             height,
						 this.fontColor,
			             x - width/2,
						 y + height/2,
						 this.text)
			$C.restore()
        }
    }
})
var Glop = {
	frame: 0,
	width: 0,
	height: 0,
	init: function() {
		new PeriodicalExecuter(Glop.draw_powersave, 0.1)
	},
	draw: function(custom_size) {
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

		Glop.frame += 1

		Events.drag()

		$('canvas').fire('glop:predraw')

		draw_event = $('canvas').fire('glop:draw')

		if (!draw_event.no_draw) {
			objects.each(function(object) {
				object.draw()
			})
		}

		$('canvas').fire('glop:postdraw')
	},
	random_color: function() {
		return "rgb("+Math.round(Math.random()*255)+","+Math.round(Math.random()*255)+","+Math.round(Math.random()*255)+")"
	},
	draw_powersave: function() {
		if (Cartagen.powersave == false || (Cartagen.requested_plots && Cartagen.requested_plots > 0)) {
			Glop.draw()
		} else {
			if (Event.last_event > Glop.frame-25) {
				Glop.draw()
			} else {
			}
		}
	}
}

document.observe('cartagen:init', Glop.init.bindAsEventListener(Glop))

var Events = {
	last_event: 0,

	init: function() {
		var canvas = $('canvas')
		canvas.observe('mousemove', Events.mousemove)
		canvas.observe('mousedown', Events.mousedown)
		canvas.observe('mouseup', Events.mouseup)
		canvas.observe('dblclick', Events.doubleclick)

		if (window.addEventListener) window.addEventListener('DOMMouseScroll', Events.wheel, false)
		window.onmousewheel = document.onmousewheel = Events.wheel

		Event.observe(document, 'keypress', Events.keypress)
		Event.observe(document, 'keyup', Events.keyup)

		canvas.ontouchstart = Events.ontouchstart
		canvas.ontouchmove = Events.ontouchmove
		canvas.ontouchend = Events.ontouchend
		canvas.ongesturestart = Events.ongesturestart
		canvas.ongesturechange = Events.ongesturechange
		canvas.ongestureend = Events.ongestureend

		Event.observe(window, 'resize', Events.resize);

	},
	mousemove: function(event) {
		Mouse.x = -1*Event.pointerX(event)
		Mouse.y = -1*Event.pointerY(event)
		Glop.draw()
	},
	mousedown: function(event) {
		$l('lon: ' + Projection.x_to_lon(Mouse.x) + ', lat: ' + Projection.y_to_lat(Mouse.y))
        Mouse.down = true
        Mouse.click_frame = Glop.frame
        Mouse.click_x = Mouse.x
        Mouse.click_y = Mouse.y
        Map.x_old = Map.x
        Map.y_old = Map.y
        Map.rotate_old = Map.rotate
		Mouse.dragging = true
	},
	mouseup: function() {
        Mouse.up = true
        Mouse.down = false
        Mouse.release_frame = Glop.frame
        Mouse.dragging = false
        User.update()
	},
	wheel: function(event){
		var delta = 0;
		if (!event) event = window.event;
		if (event.wheelDelta) {
			delta = event.wheelDelta/120;
			if (window.opera) delta = -delta;
		} else if (event.detail) {
			delta = -event.detail/3;
		}
		if (delta && !Cartagen.live_gss) {
			if (delta <0) {
				Cartagen.zoom_level += delta/40
			} else {
				Cartagen.zoom_level += delta/40
			}
			if (Cartagen.zoom_level < Cartagen.zoom_out_limit) Cartagen.zoom_level = Cartagen.zoom_out_limit
		}
		Glop.draw()
	},
	keypress: function(e) {
		var code;
		if (!e) var e = window.event;
		if (e.keyCode) code = e.keyCode;
		else if (e.which) code = e.which;
		var character = String.fromCharCode(code);
		if (Keyboard.key_input) {
			switch(character) {
				case "s": zoom_in(); break
				case "w": zoom_out(); break
				case "d": Map.rotate += 0.1; break
				case "a": Map.rotate -= 0.1; break
				case "f": Map.x += 20/Cartagen.zoom_level; break
				case "h": Map.x -= 20/Cartagen.zoom_level; break
				case "t": Map.y += 20/Cartagen.zoom_level; break
				case "g": Map.y -= 20/Cartagen.zoom_level; break
				case "x": localStorage.clear()
			}
		} else {
			switch(character){
				case "r": Keyboard.keys.set("r",true); break
				case "z": Keyboard.keys.set("z",true); break
				case "g": if (!Cartagen.live_gss) Cartagen.show_gss_editor(); break
				case "h": get_static_plot('/static/rome/highway.js'); break
			}
		}
		Glop.draw()
	},
	keyup: function() {
		Keyboard.keys.set("r",false)
		Keyboard.keys.set("z",false)
	},
	ontouchstart: function(e){
		e.preventDefault();
		if(e.touches.length == 1){ // Only deal with one finger
	 		var touch = e.touches[0]; // Get the information for finger #1
		    var node = touch.target; // Find the node the drag started from

			Mouse.down = true
			Mouse.click_frame = Glop.frame
			Mouse.click_x = touch.screenX
			Mouse.click_y = touch.screenY
			Map.x_old = Map.x
			Map.y_old = Map.y
			Mouse.dragging = true
			Glop.draw()
		  }
	},
	ontouchmove: function(e) {
		e.preventDefault();
		if(e.touches.length == 1){ // Only deal with one finger
			var touch = e.touches[0]; // Get the information for finger #1
			var node = touch.target; // Find the node the drag started from

			Mouse.drag_x = (touch.screenX - Mouse.click_x)
			Mouse.drag_y = (touch.screenY - Mouse.click_y)

			var d_x = -Math.cos(Map.rotate)*Mouse.drag_x+Math.sin(Map.rotate)*Mouse.drag_y
			var d_y = -Math.cos(Map.rotate)*Mouse.drag_y-Math.sin(Map.rotate)*Mouse.drag_x

			Map.x = Map.x_old+(d_x/Cartagen.zoom_level)
			Map.y = Map.y_old+(d_y/Cartagen.zoom_level)

			Glop.draw()
		}
	},
	ontouchend: function(e) {
		if(e.touches.length == 1) {
			Mouse.up = true
			Mouse.down = false
			Mouse.release_frame = Glop.frame
			Mouse.dragging = false
		}
		User.update()
		Glop.draw()
	},
	ongesturestart: function(e) {
		zoom_level_old = Cartagen.zoom_level
	},
	ongesturechange: function(e){
		var node = e.target;
		if (Map.rotate_old == null) Map.rotate_old = Map.rotate
		Map.rotate = Map.rotate_old + (e.rotation/180)*Math.PI
		Cartagen.zoom_level = zoom_level_old*e.scale
		Glop.draw()
	},
	gestureend: function(e){
		Map.rotate_old = null
		User.update()
	},
	doubleclick: function(event) {
	},
	drag: function() {
		if (Mouse.dragging && !Prototype.Browser.MobileSafari && !window.PhoneGap) {
			Mouse.drag_x = (Mouse.x - Mouse.click_x)
			Mouse.drag_y = (Mouse.y - Mouse.click_y)
			if (Keyboard.keys.get("r")) { // rotating
				Map.rotate = Map.rotate_old + (-1*Mouse.drag_y/Glop.height)
			} else if (Keyboard.keys.get("z")) {
				if (Cartagen.zoom_level > 0) {
					Cartagen.zoom_level = Math.abs(Cartagen.zoom_level - (Mouse.drag_y/Glop.height))
				} else {
					Cartagen.zoom_level = 0
				}
			} else {
				var d_x = Math.cos(Map.rotate)*Mouse.drag_x+Math.sin(Map.rotate)*Mouse.drag_y
				var d_y = Math.cos(Map.rotate)*Mouse.drag_y-Math.sin(Map.rotate)*Mouse.drag_x

				Map.x = Map.x_old+(d_x/Cartagen.zoom_level)
				Map.y = Map.y_old+(d_y/Cartagen.zoom_level)
			}
		}
	},
	click_length: function() {
		return Mouse.release_frame-Mouse.click_frame
	},
	resize: function() {
		Glop.draw()
	}
}
document.observe('cartagen:init', Events.init)



$C = {
	init: function() {
		this.canvas =  $('canvas').getContext('2d')
		CanvasTextFunctions.enable(this.canvas)
	},
	clear: function(){
		$C.canvas.clearRect(0, 0, Glop.width, Glop.height)
	},

	fill_style: function(color) {
		$C.canvas.fillStyle = color
	},
	fill_pattern: function(image, repeat) {
		try { $C.canvas.fillStyle = $C.canvas.createPattern(image, repeat) } catch(e) {}
	},
	translate: function(x,y) {
		$C.canvas.translate(x,y)
	},

	scale: function(x,y) {
		$C.canvas.scale(x,y)
	},

	rotate: function(rotation){
		$C.canvas.rotate(rotation)
	},

	rect: function(x, y, w, h){
		$C.canvas.fillRect(x, y, w, h)
	},

	stroke_rect: function(x, y, w, h){
		$C.canvas.strokeRect(x, y, w, h)
	},

	stroke_style: function(color) {
		$C.canvas.strokeStyle = color
	},

	line_join: function(style) {
		$C.canvas.lineJoin = style
	},

	line_cap: function(style) {
		$C.canvas.lineCap = style
	},

	line_width: function(lineWidth){
		if (parseInt(lineWidth) == 0)
			$C.canvas.lineWidth = 0.0000000001
		else
			$C.canvas.lineWidth = lineWidth
	},

	begin_path: function(){
		$C.canvas.beginPath()
	},

	move_to: function(x, y){
		$C.canvas.moveTo(x, y)
	},

	line_to: function(x, y){
		$C.canvas.lineTo(x, y)
	},

	quadratic_curve_to: function(cp_x, cp_y, x, y){
		$C.canvas.quadraticCurveTo(cp_x, cp_y, x, y)
	},

	stroke: function(){
		$C.canvas.stroke()
	},

	outline: function(color,width){
		$C.save()
			$C.stroke_style(color)
			$C.line_width($C.canvas.lineWidth+(width*2))
		$C.canvas.stroke()
		$C.restore()
		$C.canvas.stroke()
	},

	fill: function(){
		$C.canvas.fill()
	},

	arc: function(x, y, radius, startAngle, endAngle, counterclockwise){
		$C.canvas.arc(x, y, radius, startAngle, endAngle, counterclockwise)
	},
	draw_text: function(font, size, color, x, y, text){
		if ($C.canvas.fillText) {
			$C.canvas.fillStyle = color
			$C.canvas.font = size+'pt ' + font
			$C.canvas.fillText(text, x, y)
		} else {
			$C.canvas.strokeStyle = color
			$C.canvas.drawText(font, size, x, y, text)
		}
	},
	measure_text: function(font, size, text) {
		if ($C.canvas.fillText) {
			$C.canvas.font = size + 'pt ' + font
			var width = $C.canvas.measureText(text)
			if (width.width) return width.width
			return width
		}
		else {
			$C.canvas.measureCanvasText(font, size, text)
		}


	},
	opacity: function(alpha) {
		$C.canvas.alpha = alpha
	},
	save: function() {
		$C.canvas.save()
	},
	restore: function() {
		$C.canvas.restore()
	},
	to_data_url: function() {
		return $C.canvas.canvas.toDataURL()
	},
	to_print_data_url: function(width,height) {
		var _height = Glop.height, _width = Glop.width
		Glop.width = width
		Glop.height = height
		Glop.draw(true) // with a custom size
		var url = $C.canvas.canvas.toDataURL()
		Glop.width = _width
		Glop.height = _height
		return url
	}
}

document.observe('cartagen:init', $C.init.bindAsEventListener($C))
var CanvasTextFunctions = { };

CanvasTextFunctions.letters = {
    ' ': { width: 16, points: [] },
    '!': { width: 10, points: [[5,21],[5,7],[-1,-1],[5,2],[4,1],[5,0],[6,1],[5,2]] },
    '"': { width: 16, points: [[4,21],[4,14],[-1,-1],[12,21],[12,14]] },
    '#': { width: 21, points: [[11,25],[4,-7],[-1,-1],[17,25],[10,-7],[-1,-1],[4,12],[18,12],[-1,-1],[3,6],[17,6]] },
    '$': { width: 20, points: [[8,25],[8,-4],[-1,-1],[12,25],[12,-4],[-1,-1],[17,18],[15,20],[12,21],[8,21],[5,20],[3,18],[3,16],[4,14],[5,13],[7,12],[13,10],[15,9],[16,8],[17,6],[17,3],[15,1],[12,0],[8,0],[5,1],[3,3]] },
    '%': { width: 24, points: [[21,21],[3,0],[-1,-1],[8,21],[10,19],[10,17],[9,15],[7,14],[5,14],[3,16],[3,18],[4,20],[6,21],[8,21],[10,20],[13,19],[16,19],[19,20],[21,21],[-1,-1],[17,7],[15,6],[14,4],[14,2],[16,0],[18,0],[20,1],[21,3],[21,5],[19,7],[17,7]] },
    '&': { width: 26, points: [[23,12],[23,13],[22,14],[21,14],[20,13],[19,11],[17,6],[15,3],[13,1],[11,0],[7,0],[5,1],[4,2],[3,4],[3,6],[4,8],[5,9],[12,13],[13,14],[14,16],[14,18],[13,20],[11,21],[9,20],[8,18],[8,16],[9,13],[11,10],[16,3],[18,1],[20,0],[22,0],[23,1],[23,2]] },
    '\'': { width: 10, points: [[5,19],[4,20],[5,21],[6,20],[6,18],[5,16],[4,15]] },
    '(': { width: 14, points: [[11,25],[9,23],[7,20],[5,16],[4,11],[4,7],[5,2],[7,-2],[9,-5],[11,-7]] },
    ')': { width: 14, points: [[3,25],[5,23],[7,20],[9,16],[10,11],[10,7],[9,2],[7,-2],[5,-5],[3,-7]] },
    '*': { width: 16, points: [[8,21],[8,9],[-1,-1],[3,18],[13,12],[-1,-1],[13,18],[3,12]] },
    '+': { width: 26, points: [[13,18],[13,0],[-1,-1],[4,9],[22,9]] },
    ',': { width: 10, points: [[6,1],[5,0],[4,1],[5,2],[6,1],[6,-1],[5,-3],[4,-4]] },
    '-': { width: 26, points: [[4,9],[22,9]] },
    '.': { width: 10, points: [[5,2],[4,1],[5,0],[6,1],[5,2]] },
    '/': { width: 22, points: [[20,25],[2,-7]] },
    '0': { width: 20, points: [[9,21],[6,20],[4,17],[3,12],[3,9],[4,4],[6,1],[9,0],[11,0],[14,1],[16,4],[17,9],[17,12],[16,17],[14,20],[11,21],[9,21]] },
    '1': { width: 20, points: [[6,17],[8,18],[11,21],[11,0]] },
    '2': { width: 20, points: [[4,16],[4,17],[5,19],[6,20],[8,21],[12,21],[14,20],[15,19],[16,17],[16,15],[15,13],[13,10],[3,0],[17,0]] },
    '3': { width: 20, points: [[5,21],[16,21],[10,13],[13,13],[15,12],[16,11],[17,8],[17,6],[16,3],[14,1],[11,0],[8,0],[5,1],[4,2],[3,4]] },
    '4': { width: 20, points: [[13,21],[3,7],[18,7],[-1,-1],[13,21],[13,0]] },
    '5': { width: 20, points: [[15,21],[5,21],[4,12],[5,13],[8,14],[11,14],[14,13],[16,11],[17,8],[17,6],[16,3],[14,1],[11,0],[8,0],[5,1],[4,2],[3,4]] },
    '6': { width: 20, points: [[16,18],[15,20],[12,21],[10,21],[7,20],[5,17],[4,12],[4,7],[5,3],[7,1],[10,0],[11,0],[14,1],[16,3],[17,6],[17,7],[16,10],[14,12],[11,13],[10,13],[7,12],[5,10],[4,7]] },
    '7': { width: 20, points: [[17,21],[7,0],[-1,-1],[3,21],[17,21]] },
    '8': { width: 20, points: [[8,21],[5,20],[4,18],[4,16],[5,14],[7,13],[11,12],[14,11],[16,9],[17,7],[17,4],[16,2],[15,1],[12,0],[8,0],[5,1],[4,2],[3,4],[3,7],[4,9],[6,11],[9,12],[13,13],[15,14],[16,16],[16,18],[15,20],[12,21],[8,21]] },
    '9': { width: 20, points: [[16,14],[15,11],[13,9],[10,8],[9,8],[6,9],[4,11],[3,14],[3,15],[4,18],[6,20],[9,21],[10,21],[13,20],[15,18],[16,14],[16,9],[15,4],[13,1],[10,0],[8,0],[5,1],[4,3]] },
    ':': { width: 10, points: [[5,14],[4,13],[5,12],[6,13],[5,14],[-1,-1],[5,2],[4,1],[5,0],[6,1],[5,2]] },
    ',': { width: 10, points: [[5,14],[4,13],[5,12],[6,13],[5,14],[-1,-1],[6,1],[5,0],[4,1],[5,2],[6,1],[6,-1],[5,-3],[4,-4]] },
    '<': { width: 24, points: [[20,18],[4,9],[20,0]] },
    '=': { width: 26, points: [[4,12],[22,12],[-1,-1],[4,6],[22,6]] },
    '>': { width: 24, points: [[4,18],[20,9],[4,0]] },
    '?': { width: 18, points: [[3,16],[3,17],[4,19],[5,20],[7,21],[11,21],[13,20],[14,19],[15,17],[15,15],[14,13],[13,12],[9,10],[9,7],[-1,-1],[9,2],[8,1],[9,0],[10,1],[9,2]] },
    '@': { width: 27, points: [[18,13],[17,15],[15,16],[12,16],[10,15],[9,14],[8,11],[8,8],[9,6],[11,5],[14,5],[16,6],[17,8],[-1,-1],[12,16],[10,14],[9,11],[9,8],[10,6],[11,5],[-1,-1],[18,16],[17,8],[17,6],[19,5],[21,5],[23,7],[24,10],[24,12],[23,15],[22,17],[20,19],[18,20],[15,21],[12,21],[9,20],[7,19],[5,17],[4,15],[3,12],[3,9],[4,6],[5,4],[7,2],[9,1],[12,0],[15,0],[18,1],[20,2],[21,3],[-1,-1],[19,16],[18,8],[18,6],[19,5]] },
    'A': { width: 18, points: [[9,21],[1,0],[-1,-1],[9,21],[17,0],[-1,-1],[4,7],[14,7]] },
    'B': { width: 21, points: [[4,21],[4,0],[-1,-1],[4,21],[13,21],[16,20],[17,19],[18,17],[18,15],[17,13],[16,12],[13,11],[-1,-1],[4,11],[13,11],[16,10],[17,9],[18,7],[18,4],[17,2],[16,1],[13,0],[4,0]] },
    'C': { width: 21, points: [[18,16],[17,18],[15,20],[13,21],[9,21],[7,20],[5,18],[4,16],[3,13],[3,8],[4,5],[5,3],[7,1],[9,0],[13,0],[15,1],[17,3],[18,5]] },
    'D': { width: 21, points: [[4,21],[4,0],[-1,-1],[4,21],[11,21],[14,20],[16,18],[17,16],[18,13],[18,8],[17,5],[16,3],[14,1],[11,0],[4,0]] },
    'E': { width: 19, points: [[4,21],[4,0],[-1,-1],[4,21],[17,21],[-1,-1],[4,11],[12,11],[-1,-1],[4,0],[17,0]] },
    'F': { width: 18, points: [[4,21],[4,0],[-1,-1],[4,21],[17,21],[-1,-1],[4,11],[12,11]] },
    'G': { width: 21, points: [[18,16],[17,18],[15,20],[13,21],[9,21],[7,20],[5,18],[4,16],[3,13],[3,8],[4,5],[5,3],[7,1],[9,0],[13,0],[15,1],[17,3],[18,5],[18,8],[-1,-1],[13,8],[18,8]] },
    'H': { width: 22, points: [[4,21],[4,0],[-1,-1],[18,21],[18,0],[-1,-1],[4,11],[18,11]] },
    'I': { width: 8, points: [[4,21],[4,0]] },
    'J': { width: 16, points: [[12,21],[12,5],[11,2],[10,1],[8,0],[6,0],[4,1],[3,2],[2,5],[2,7]] },
    'K': { width: 21, points: [[4,21],[4,0],[-1,-1],[18,21],[4,7],[-1,-1],[9,12],[18,0]] },
    'L': { width: 17, points: [[4,21],[4,0],[-1,-1],[4,0],[16,0]] },
    'M': { width: 24, points: [[4,21],[4,0],[-1,-1],[4,21],[12,0],[-1,-1],[20,21],[12,0],[-1,-1],[20,21],[20,0]] },
    'N': { width: 22, points: [[4,21],[4,0],[-1,-1],[4,21],[18,0],[-1,-1],[18,21],[18,0]] },
    'O': { width: 22, points: [[9,21],[7,20],[5,18],[4,16],[3,13],[3,8],[4,5],[5,3],[7,1],[9,0],[13,0],[15,1],[17,3],[18,5],[19,8],[19,13],[18,16],[17,18],[15,20],[13,21],[9,21]] },
    'P': { width: 21, points: [[4,21],[4,0],[-1,-1],[4,21],[13,21],[16,20],[17,19],[18,17],[18,14],[17,12],[16,11],[13,10],[4,10]] },
    'Q': { width: 22, points: [[9,21],[7,20],[5,18],[4,16],[3,13],[3,8],[4,5],[5,3],[7,1],[9,0],[13,0],[15,1],[17,3],[18,5],[19,8],[19,13],[18,16],[17,18],[15,20],[13,21],[9,21],[-1,-1],[12,4],[18,-2]] },
    'R': { width: 21, points: [[4,21],[4,0],[-1,-1],[4,21],[13,21],[16,20],[17,19],[18,17],[18,15],[17,13],[16,12],[13,11],[4,11],[-1,-1],[11,11],[18,0]] },
    'S': { width: 20, points: [[17,18],[15,20],[12,21],[8,21],[5,20],[3,18],[3,16],[4,14],[5,13],[7,12],[13,10],[15,9],[16,8],[17,6],[17,3],[15,1],[12,0],[8,0],[5,1],[3,3]] },
    'T': { width: 16, points: [[8,21],[8,0],[-1,-1],[1,21],[15,21]] },
    'U': { width: 22, points: [[4,21],[4,6],[5,3],[7,1],[10,0],[12,0],[15,1],[17,3],[18,6],[18,21]] },
    'V': { width: 18, points: [[1,21],[9,0],[-1,-1],[17,21],[9,0]] },
    'W': { width: 24, points: [[2,21],[7,0],[-1,-1],[12,21],[7,0],[-1,-1],[12,21],[17,0],[-1,-1],[22,21],[17,0]] },
    'X': { width: 20, points: [[3,21],[17,0],[-1,-1],[17,21],[3,0]] },
    'Y': { width: 18, points: [[1,21],[9,11],[9,0],[-1,-1],[17,21],[9,11]] },
    'Z': { width: 20, points: [[17,21],[3,0],[-1,-1],[3,21],[17,21],[-1,-1],[3,0],[17,0]] },
    '[': { width: 14, points: [[4,25],[4,-7],[-1,-1],[5,25],[5,-7],[-1,-1],[4,25],[11,25],[-1,-1],[4,-7],[11,-7]] },
    '\\': { width: 14, points: [[0,21],[14,-3]] },
    ']': { width: 14, points: [[9,25],[9,-7],[-1,-1],[10,25],[10,-7],[-1,-1],[3,25],[10,25],[-1,-1],[3,-7],[10,-7]] },
    '^': { width: 16, points: [[6,15],[8,18],[10,15],[-1,-1],[3,12],[8,17],[13,12],[-1,-1],[8,17],[8,0]] },
    '_': { width: 16, points: [[0,-2],[16,-2]] },
    '`': { width: 10, points: [[6,21],[5,20],[4,18],[4,16],[5,15],[6,16],[5,17]] },
    'a': { width: 19, points: [[15,14],[15,0],[-1,-1],[15,11],[13,13],[11,14],[8,14],[6,13],[4,11],[3,8],[3,6],[4,3],[6,1],[8,0],[11,0],[13,1],[15,3]] },
    'b': { width: 19, points: [[4,21],[4,0],[-1,-1],[4,11],[6,13],[8,14],[11,14],[13,13],[15,11],[16,8],[16,6],[15,3],[13,1],[11,0],[8,0],[6,1],[4,3]] },
    'c': { width: 18, points: [[15,11],[13,13],[11,14],[8,14],[6,13],[4,11],[3,8],[3,6],[4,3],[6,1],[8,0],[11,0],[13,1],[15,3]] },
    'd': { width: 19, points: [[15,21],[15,0],[-1,-1],[15,11],[13,13],[11,14],[8,14],[6,13],[4,11],[3,8],[3,6],[4,3],[6,1],[8,0],[11,0],[13,1],[15,3]] },
    'e': { width: 18, points: [[3,8],[15,8],[15,10],[14,12],[13,13],[11,14],[8,14],[6,13],[4,11],[3,8],[3,6],[4,3],[6,1],[8,0],[11,0],[13,1],[15,3]] },
    'f': { width: 12, points: [[10,21],[8,21],[6,20],[5,17],[5,0],[-1,-1],[2,14],[9,14]] },
    'g': { width: 19, points: [[15,14],[15,-2],[14,-5],[13,-6],[11,-7],[8,-7],[6,-6],[-1,-1],[15,11],[13,13],[11,14],[8,14],[6,13],[4,11],[3,8],[3,6],[4,3],[6,1],[8,0],[11,0],[13,1],[15,3]] },
    'h': { width: 19, points: [[4,21],[4,0],[-1,-1],[4,10],[7,13],[9,14],[12,14],[14,13],[15,10],[15,0]] },
    'i': { width: 8, points: [[3,21],[4,20],[5,21],[4,22],[3,21],[-1,-1],[4,14],[4,0]] },
    'j': { width: 10, points: [[5,21],[6,20],[7,21],[6,22],[5,21],[-1,-1],[6,14],[6,-3],[5,-6],[3,-7],[1,-7]] },
    'k': { width: 17, points: [[4,21],[4,0],[-1,-1],[14,14],[4,4],[-1,-1],[8,8],[15,0]] },
    'l': { width: 8, points: [[4,21],[4,0]] },
    'm': { width: 30, points: [[4,14],[4,0],[-1,-1],[4,10],[7,13],[9,14],[12,14],[14,13],[15,10],[15,0],[-1,-1],[15,10],[18,13],[20,14],[23,14],[25,13],[26,10],[26,0]] },
    'n': { width: 19, points: [[4,14],[4,0],[-1,-1],[4,10],[7,13],[9,14],[12,14],[14,13],[15,10],[15,0]] },
    'o': { width: 19, points: [[8,14],[6,13],[4,11],[3,8],[3,6],[4,3],[6,1],[8,0],[11,0],[13,1],[15,3],[16,6],[16,8],[15,11],[13,13],[11,14],[8,14]] },
    'p': { width: 19, points: [[4,14],[4,-7],[-1,-1],[4,11],[6,13],[8,14],[11,14],[13,13],[15,11],[16,8],[16,6],[15,3],[13,1],[11,0],[8,0],[6,1],[4,3]] },
    'q': { width: 19, points: [[15,14],[15,-7],[-1,-1],[15,11],[13,13],[11,14],[8,14],[6,13],[4,11],[3,8],[3,6],[4,3],[6,1],[8,0],[11,0],[13,1],[15,3]] },
    'r': { width: 13, points: [[4,14],[4,0],[-1,-1],[4,8],[5,11],[7,13],[9,14],[12,14]] },
    's': { width: 17, points: [[14,11],[13,13],[10,14],[7,14],[4,13],[3,11],[4,9],[6,8],[11,7],[13,6],[14,4],[14,3],[13,1],[10,0],[7,0],[4,1],[3,3]] },
    't': { width: 12, points: [[5,21],[5,4],[6,1],[8,0],[10,0],[-1,-1],[2,14],[9,14]] },
    'u': { width: 19, points: [[4,14],[4,4],[5,1],[7,0],[10,0],[12,1],[15,4],[-1,-1],[15,14],[15,0]] },
    'v': { width: 16, points: [[2,14],[8,0],[-1,-1],[14,14],[8,0]] },
    'w': { width: 22, points: [[3,14],[7,0],[-1,-1],[11,14],[7,0],[-1,-1],[11,14],[15,0],[-1,-1],[19,14],[15,0]] },
    'x': { width: 17, points: [[3,14],[14,0],[-1,-1],[14,14],[3,0]] },
    'y': { width: 16, points: [[2,14],[8,0],[-1,-1],[14,14],[8,0],[6,-4],[4,-6],[2,-7],[1,-7]] },
    'z': { width: 17, points: [[14,14],[3,0],[-1,-1],[3,14],[14,14],[-1,-1],[3,0],[14,0]] },
    '{': { width: 14, points: [[9,25],[7,24],[6,23],[5,21],[5,19],[6,17],[7,16],[8,14],[8,12],[6,10],[-1,-1],[7,24],[6,22],[6,20],[7,18],[8,17],[9,15],[9,13],[8,11],[4,9],[8,7],[9,5],[9,3],[8,1],[7,0],[6,-2],[6,-4],[7,-6],[-1,-1],[6,8],[8,6],[8,4],[7,2],[6,1],[5,-1],[5,-3],[6,-5],[7,-6],[9,-7]] },
    '|': { width: 8, points: [[4,25],[4,-7]] },
    '}': { width: 14, points: [[5,25],[7,24],[8,23],[9,21],[9,19],[8,17],[7,16],[6,14],[6,12],[8,10],[-1,-1],[7,24],[8,22],[8,20],[7,18],[6,17],[5,15],[5,13],[6,11],[10,9],[6,7],[5,5],[5,3],[6,1],[7,0],[8,-2],[8,-4],[7,-6],[-1,-1],[8,8],[6,6],[6,4],[7,2],[8,1],[9,-1],[9,-3],[8,-5],[7,-6],[5,-7]] },
    '~': { width: 24, points: [[3,6],[3,8],[4,11],[6,12],[8,12],[10,11],[14,8],[16,7],[18,7],[20,8],[21,10],[-1,-1],[3,8],[4,10],[6,11],[8,11],[10,10],[14,7],[16,6],[18,6],[20,7],[21,10],[21,12]] }
};

CanvasTextFunctions.letter = function (ch)
{
    return CanvasTextFunctions.letters[ch];
}

CanvasTextFunctions.ascent = function( font, size)
{
    return size;
}

CanvasTextFunctions.descent = function( font, size)
{
    return 7.0*size/25.0;
}

CanvasTextFunctions.measure = function( font, size, str)
{
    var total = 0;
    var len = str.length;

    for ( i = 0; i < len; i++) {
	var c = CanvasTextFunctions.letter( str.charAt(i));
	if ( c) total += c.width * size / 25.0;
    }
    return total;
}

CanvasTextFunctions.draw = function(ctx,font,size,x,y,str)
{
    var total = 0;
    var len = str.length;
    var mag = size / 25.0;

    ctx.save();
    ctx.lineCap = "round";
    ctx.lineWidth = 2.0 * mag;

    for ( i = 0; i < len; i++) {
	var c = CanvasTextFunctions.letter( str.charAt(i));
	if ( !c) continue;

	ctx.beginPath();

	var penUp = 1;
	var needStroke = 0;
	for ( j = 0; j < c.points.length; j++) {
		var a = c.points[j];
		if ( a[0] == -1 && a[1] == -1) {
			penUp = 1;
			continue;
		}
		if ( penUp) {
			try{
			ctx.moveTo( x + a[0]*mag, y - a[1]*mag);
			} catch(e) {$l(e)}
			penUp = false;
		} else {
			ctx.lineTo( x + a[0]*mag, y - a[1]*mag);
		}
	}
	ctx.stroke();
	x += c.width*mag;
    }
    ctx.restore();
    return total;
}

CanvasTextFunctions.enable = function( ctx)
{
    ctx.drawText = function(font,size,x,y,text) { return CanvasTextFunctions.draw( ctx, font,size,x,y,text); };
    ctx.measureCanvasText = function(font,size,text) { return CanvasTextFunctions.measure( font,size,text); };
    ctx.fontAscent = function(font,size) { return CanvasTextFunctions.ascent(font,size); }
    ctx.fontDescent = function(font,size) { return CanvasTextFunctions.descent(font,size); }

    ctx.drawTextRight = function(font,size,x,y,text) {
	var w = CanvasTextFunctions.measure(font,size,text);
	return CanvasTextFunctions.draw( ctx, font,size,x-w,y,text);
    };
    ctx.drawTextCenter = function(font,size,x,y,text) {
	var w = CanvasTextFunctions.measure(font,size,text);
	return CanvasTextFunctions.draw( ctx, font,size,x-w/2,y,text);
    };
}
var Keyboard = {
	keys: new Hash(),
	key_input: false,
}
var Mouse = {
	x: 0,
	y: 0,
	down: false,
	up: false,
	click_x: 0,
	click_y: 0,
	click_frame: 0,
	release_frame: null,
	dragging: false,
	drag_x: null,
	drag_y: null
}
var User = {
	color: Glop.random_color(),
	name: 'anonymous',
	lat: 0,
	lon: 0,
	x: -118.31700000003664,
	y: -6562600.9880228145,
	node_submit_uri: '/node/write',
	node_updates_uri: '/node/read',
	way_submit_uri: '/way/write',
	way_update_uri: '/way/read',
	line_width:15,
	node_radius: 30,
	follow_interval: 60,
	following: false,
	following_executer: null,
	drawing_way: false,
	loaded_node_ids: [],
	init: function() {
		if (Cartagen.load_user_features) {
			User.update()
			new PeriodicalExecuter(User.update, 60)
		}
	},
	set_loc: function(loc) {
		if (loc.coords) {
			User.lat = loc.coords.latitude
			User.lon = loc.coords.longitude
		}
		else {
			User.lat = loc.latitude
			User.lon = loc.longitude
		}
		User.x = Projection.lon_to_x(User.lon)
		User.y = Projection.lat_to_y(User.lat)
		$l('detected location: '+this.lat+","+this.lon)
	},
	calculate_coords: function() {
	},
	create_node: function(x, y, draw, id) {
		if (Object.isUndefined(x)) x = User.x
		if (Object.isUndefined(y)) y = User.y
		if (Object.isUndefined(id)) id = 'temp_' + (Math.random() * 999999999).floor()
		var node = new Node()
		node.x = x
		node.y = y
		node.radius = User.node_radius
		node.id = id
		node.lon = Projection.x_to_lon(x)
		node.lat = Projection.y_to_lat(y)
		node.fillStyle = User.color
		node.strokeStyle = "rgba(0,0,0,0)"
		node.user_submitted = true

		if (draw) {
			Geohash.put(node.lat, node.lon, node, 1)
			objects.push(node)
        	Glop.draw()
		}

		return node
	},
	submit_node: function(x, y) {
		var node = User.create_node(x, y, true)
		var name = prompt('Name for the node')
		node.label.name = name
		var params = {
			color: User.color,
			lon: node.lon,
			lat: node.lat,
			author: User.name,
			name: name
		}
		new Ajax.Request(User.node_submit_uri, {
			method: 'post',
			parameters: params,
			onSuccess: function(transport) {
				node.id = 'cartagen_' + transport.responseText
				User.loaded_node_ids.push(id)
			}
		})
	},
	toggle_following: function() {
		if (User.following) {
			User.following_executer.stop()
			User.following = false
		}
		else {
			User.following_executer = new PeriodicalExecuter(User.center_map_on_user,
			                                                 User.follow_interval)
			User.following = true
			User.center_map_on_user()
		}
	},
	center_map_on_user: function() {
		navigator.geolocation.getCurrentPosition(User.set_loc_and_center)
	},
	mark: function() {
		$C.stroke_style('white')
		$C.line_width(3.5/Cartagen.zoom_level)
		$C.begin_path()
		$C.translate(User.x,User.y)
		$C.arc(0,0,10/Cartagen.zoom_level,0,Math.PI*2,true)
		$C.move_to(10/Cartagen.zoom_level,0)
		$C.line_to(6/Cartagen.zoom_level,0)
		$C.move_to(-10/Cartagen.zoom_level,0)
		$C.line_to(-6/Cartagen.zoom_level,0)
		$C.move_to(0,10/Cartagen.zoom_level)
		$C.line_to(0,6/Cartagen.zoom_level)
		$C.move_to(0,-10/Cartagen.zoom_level)
		$C.line_to(0,-6/Cartagen.zoom_level)
		$C.stroke()

		$C.stroke_style('#4C6ACB')
		$C.line_width(2/Cartagen.zoom_level)
		$C.begin_path()
		$C.arc(0,0,10/Cartagen.zoom_level,0,Math.PI*2,true)
		$C.move_to(10/Cartagen.zoom_level,0)
		$C.line_to(6/Cartagen.zoom_level,0)
		$C.move_to(-10/Cartagen.zoom_level,0)
		$C.line_to(-6/Cartagen.zoom_level,0)
		$C.move_to(0,10/Cartagen.zoom_level)
		$C.line_to(0,6/Cartagen.zoom_level)
		$C.move_to(0,-10/Cartagen.zoom_level)
		$C.line_to(0,-6/Cartagen.zoom_level)
		$C.stroke()
	},
	set_loc_and_center: function(loc) {
		User.set_loc(loc)
		Map.x = User.x
		Map.y = User.y
		Glop.draw()
	},
	toggle_way_drawing: function(x, y) {
		if (User.drawing_way) {
			User.add_node(x, y)
			User.submit_way(User.way)
		}
		else {
			User.way = new Way({
				id: 'temp_' + (Math.random() * 999999999).floor(),
				author: User.name,
				nodes: [User.create_node(x,y,true)],
				tags: new Hash()
			})
			User.way.strokeStyle = User.color
			User.way.lineWidth = User.line_width
			User.way.age = 40
			User.way.user_submitted = true
			Geohash.put(Projection.y_to_lat(User.way.y), Projection.x_to_lon(User.way.x), User.way, 1)
			Glop.draw()
		}
		User.drawing_way = !User.drawing_way
	},
	submit_way: function(way) {
		var name = prompt('Name for the way')
		way.label.text = name
 		var params = {
			color: User.color,
			author: User.name,
			bbox: way.bbox,
			name: name,
			nodes: way.nodes.collect(function(node) {
				return [node.lat, node.lon]
			})
		}
		new Ajax.Request(User.way_submit_uri, {
			parameters: {way: Object.toJSON(params)},
			onSuccess: function(transport) {
				way.id = 'cartagen_' + transport.responseJSON.way_id
				var id = 0
				way.nodes.each(function(nd) {
					id = transport.responseJSON.node_ids.shift()
					nd.id = 'cartagen_' + transport.responseJSON.node_ids.shift()
					User.loaded_node_ids.push(id)
				})
			}
		})
	},
	add_node: function(x, y) {
		node = User.create_node(x, y, true)
		User.way.nodes.push(node)
		User.way.bbox = Geometry.calculate_bounding_box(User.way.nodes)
		Glop.draw()
	},
	update: function() {
		if (!Cartagen.load_user_features) return
		var params = {
			bbox: Map.bbox.join(',')
		}
		if (User.last_pos && User.last_pos == [Map.x, Map.y]) {
			 params.timestamp = User.last_update
		}
		new Ajax.Request(User.node_updates_uri, {
			parameters: params,
			onSuccess: function(transport) {
				User._update_nodes(transport.responseJSON)
			}
		})
		User.last_pos = [Map.x, Map.y]
		User.last_update = (new Date()).toUTCString()
	},
	_update_nodes: function(nodes) {
		var ways = []
		nodes.each(function(node) {
			node = node.node
			if (User.loaded_node_ids.indexOf(node.id) == -1) {
				if (node.way_id != 0) {
					ways.push(node.way_id)
				}
				else {
					var n = new Node
					n.id = 'cartagen_' + node.id
					n.height = User.node_radius*2
					n.width = User.node_radius*2
					n.radius = User.node_radius
					n.fillStyle = node.color
					n.user = node.author
					n.lat = node.lat
					n.lon = node.lon

					if (node.name) {
						n.label.text = node.name
					}

					n.x = -1*Projection.lon_to_x(n.lon)
					n.y = Projection.lat_to_y(n.lat)
					n.strokeStyle = "rgba(0,0,0,0)"
					n.user_submitted = true
					Geohash.put(n.lat, n.lon, n, 1)
				}
			}
		})
		Glop.draw()
		if (ways.length > 0) {
			new Ajax.Request(User.way_update_uri, {
				parameters: {
					ids: ways.uniq().join(',')
				},
				onSuccess: function(transport) {
					User._update_ways(transport.responseJSON)
				}
			})
		}
	},
	_update_ways: function(data) {
		nodes = new Hash()

		data.node.each(function(node) {
			var n = new Node
			n.height = User.node_radius*2
			n.width = User.node_radius*2
			n.radius = User.node_radius
			n.fillStyle = node.color
			n.user = node.author
			n.lat = node.lat
			n.lon = node.lon
			n.x = -1*Projection.lon_to_x(n.lon)
			n.y = Projection.lat_to_y(n.lat)
			n.strokeStyle = "rgba(0,0,0,0)"
			n.order = node.order
			n.user_submitted = true
			if (nodes.get(node.way_id)) {
				nodes.get(node.way_id).push(n)
			}
			else {
				nodes.set(node.way_id, [n])
			}
		})

		data.way.each(function(way) {
			var nds = nodes.get(way.id).sort(function(a, b) {return a.order - b.order})
			var data = {
				id: 'cartagen_' + way.id,
				user: way.author,
				nodes: nds,
				tags: new Hash()
			}
			w = new Way(data)
			w.strokeStyle = way.color
			w.lineWidth = User.line_width
			w.user_submitted = true

			if (way.name) {
				w.label.text = way.name
			}
		})
	}
}

document.observe('cartagen:postinit', User.init.bindAsEventListener(User))
var Projection = {
	current_projection: 'spherical_mercator',
	scale_factor: 100000,
	lon_to_x: function(lon) { return -1*Projection[Projection.current_projection].lon_to_x(lon) },
	x_to_lon: function(x) { return Projection[Projection.current_projection].x_to_lon(x) },
	lat_to_y: function(lat) { return -1*Projection[Projection.current_projection].lat_to_y(lat) },
	y_to_lat: function(y) { return -1*Projection[Projection.current_projection].y_to_lat(y) },
	center_lon: function() { return (Cartagen.lng2+Cartagen.lng1)/2 },
	spherical_mercator: {
		lon_to_x: function(lon) { return (lon - Projection.center_lon()) * -1 * Projection.scale_factor },
		x_to_lon: function(x) { return (x/(-1*Projection.scale_factor)) + Projection.center_lon() },
		lat_to_y: function(lat) { return 180/Math.PI * Math.log(Math.tan(Math.PI/4+lat*(Math.PI/180)/2)) * Projection.scale_factor },
		y_to_lat: function(y) { return  180/Math.PI * (2 * Math.atan(Math.exp(y/Projection.scale_factor*Math.PI/180)) - Math.PI/2) }
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
			$D.err('y_to_lat is not supported in elliptical mercator')
		}

	}
}
var Viewport = {
	padding: 0,
	bbox: [],
	width: 0,
	height: 0,
	power: function() {
		return window.screen.width/1024
	}
}

var Map = {
	init: function() {
		this.x = Projection.lon_to_x((Cartagen.lng1+Cartagen.lng2)/2)
		this.y = Projection.lat_to_y((Cartagen.lat1+Cartagen.lat2)/2)
		$('canvas').observe('glop:predraw', this.draw.bindAsEventListener(this))
	},
	draw: function() {
		var lon1 = Projection.x_to_lon(-Map.x - (Viewport.width/2))
		var lon2 = Projection.x_to_lon(-Map.x + (Viewport.width/2))
		var lat1 = Projection.y_to_lat(Map.y - (Viewport.height/2))
		var lat2 = Projection.y_to_lat(Map.y + (Viewport.height/2))
		this.bbox = [lon1, lat2, lon2, lat1]
		this.lon_width = Math.abs(this.bbox[0]-this.bbox[2])
		this.lat_height = Math.abs(this.bbox[1]-this.bbox[3])
		this.lat = Projection.y_to_lat(this.y)
		this.lon = Projection.x_to_lon(-this.x)
		this.resolution = Math.round(Math.abs(Math.log(Cartagen.zoom_level)))
	},
	pointer_x: function() { return Map.x+(((Glop.width/-2)-Mouse.x)/Cartagen.zoom_level) },
	pointer_y: function() { return Map.y+(((Glop.height/-2)-Mouse.y)/Cartagen.zoom_level) },
	bbox: [],
	x: 0,
	y: 0,
	lat: 0,
	lon: 0,
	rotate: 0,
	rotate_old: 0,
	x_old: 0,
	y_old: 0,
	lon_width: 0,
	lat_height: 0,
	resolution: Math.round(Math.abs(Math.log(Cartagen.zoom_level))),
	last_pos: [0,0]
}

document.observe('cartagen:init', Map.init.bindAsEventListener(Map))
document.observe('glop:predraw', Map.draw.bindAsEventListener(Map))
