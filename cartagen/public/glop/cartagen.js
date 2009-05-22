var plots = new Hash(), nodes = new Hash(), ways = new Hash(), styles, lastPos = [0,0], scale_factor = 100000, bleed_level = 1, initial_bleed_level = 2, zoom_out_limit, zoom_in_limit, live_gss = false

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

var Viewport = {
}

var Map = {
	pointer_x: function() { return Map.x+(((width/2)-Mouse.x)/zoom_level) },
	pointer_y: function() { return Map.y+(((height/2)-Mouse.y)/zoom_level) },
	x: lon_to_x((lng1+lng2)/2),
	y: lat_to_y((lat1+lat2)/2),
	x_old: 0,
	y_old: 0,
	// Res down for zoomed-out... getting a NaN for x % 0. Not that much savings yet.
	resolution: Math.round(Math.abs(Math.log(zoom_level))),
	refresh_resolution: function() {
		this.resolution = Math.round(Math.abs(Math.log(zoom_level)))
	}
}

var Cartagen = {
	// Runs every frame in the draw() method. An attempt to isolate cartagen code from general GLOP code
	draw: function() {
		Map.refresh_resolution()
		if (Prototype.Browser.MobileSafari) {
			simplify = 2
		}
		// gss body style:
		if (styles) {
			if (styles.body.fillStyle) fillStyle(styles.body.fillStyle)
			if (styles.body.strokeStyle) strokeStyle(styles.body.strokeStyle)
			if (styles.body.lineWidth || styles.body.lineWidth == 0) lineWidth(styles.body.lineWidth)
			if (styles.body.pattern && Object.isUndefined(styles.body.pattern_img)) {
				styles.body.pattern_img = new Image()
				styles.body.pattern_img.src = styles.body.pattern
			}
			if (styles.body.pattern_img) {
				fillStyle(canvas.createPattern(styles.body.pattern_img,'repeat'))	
			}
			rect(0,0,width,height)
			strokeRect(0,0,width,height)
		}

		translate(width/2,height/2)
			rotate(global_rotate)
			scale(zoom_level,zoom_level)
	 	translate(width/-2,height/-2)
		// rotate(-1*global_rotate)
			translate((-1*Map.x)+(width/2),(-1*Map.y)+(height/2))
		// rotate(global_rotate)

		strokeStyle('white')
		lineWidth(10)

		// viewport stuff:
		viewport_width = width*(1/zoom_level)-(100*(1/zoom_level))
		viewport_height = height*(1/zoom_level)-(100*(1/zoom_level))
		viewport = [Map.y-viewport_height/2,Map.x-viewport_width/2,Map.y+viewport_height/2,Map.x+viewport_width/2]
		strokeRect(Map.x-viewport_width/2,Map.y-viewport_height/2,viewport_width,viewport_height)
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
			Style.parse_styles(n,styles.node)
			// can't currently afford to have all nodes in the map as well as all ways.
			// but we're missing some nodes when we render... semantic ones i think. cross-check.
			// objects.push(n)
			nodes.set(n.id,n)
	    })
		data.osm.way.each(function(way){
			if (live || !ways.get(way.id)) {
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
						if ((index % simplify) == 0 || index == 0 || index == way.nd.length-1 || way.nd.length <= simplify*2) {
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
				Style.parse_styles(w,styles.way)
				// Style.parse_styles(w.hover,styles.)
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
		requested_plots++
		new Ajax.Request(url,{
			method: 'get',
			onSuccess: function(result) {
				// console.log(result.responseText.evalJSON().osm.ways.length+" ways")
				Cartagen.parse_objects(result.responseText.evalJSON())
				console.log(objects.length)
				requested_plots--
				if (requested_plots == 0) last_event = frame
				console.log("Total plots: "+plots.size()+", of which "+requested_plots+" are still loading.")
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
		if (!live) {
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
						load_plot(_lat1,_lng1,_lat2,_lng2)
					}
				} else {
					// not loaded this session and no localStorage, so:
					load_plot(_lat1,_lng1,_lat2,_lng2)
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
		requested_plots++
		new Ajax.Request('/map/plot.js?lat1='+_lat1+'&lng1='+_lng1+'&lat2='+_lat2+'&lng2='+_lng2+'',{
			method: 'get',
			onComplete: function(result) {
				Cartagen.parse_objects(result.responseText.evalJSON())
				requested_plots--
				if (requested_plots == 0) last_event = frame
				console.log("Total plots: "+plots.size()+", of which "+requested_plots+" are still loading.")
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


var Node = Class.create({
	radius: 6,
	tags: [],
	draw: function() {
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
		// only draw if in the viewport:
		if (intersect(viewport[0],viewport[1],viewport[2],viewport[3],this.bbox[0],this.bbox[1],this.bbox[2],this.bbox[3])) {
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

function lon_to_x(lon) { return (lon - center_lon()) * -1 * scale_factor }
function x_to_lon(x) { return (x/(-1*scale_factor)) + center_lon() }

function lat_to_y(lat) { return ((180/Math.PI * (2 * Math.atan(Math.exp(lat*Math.PI/180)) - Math.PI/2))) * scale_factor * 1.7 }
function y_to_lat(y) { return (180/Math.PI * Math.log(Math.tan(Math.PI/4+(y/(scale_factor*1.7))*(Math.PI/180)/2))) }

function center_lon() {
	return (lng2+lng1)/2
}

// Rotates view slowly for cool demo purposes.
function demo() {
	try {
		global_rotate += 0.005
	} catch(e) {}
}

if (!static_map) {
	get_cached_plot(lat1,lng1,lat2,lng2,initial_bleed_level)
	new PeriodicalExecuter(Cartagen.get_current_plot,0.33)
} else {
	if (Prototype.Browser.MobileSafari) {
		Cartagen.get_static_plot(static_map_layers[0])
		Cartagen.get_static_plot(static_map_layers[1])
	} else {
		static_map_layers.each(function(layer_url) {
			Cartagen.get_static_plot(layer_url)
		})	
	}
}
load_next_script()