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

global_x = lon_to_x((lng1+lng2)/2)
global_y = lat_to_y((lat1+lat2)/2)

function map_pointerX() {
	return global_x+(((width/2)-pointerX)/zoom_level)
}
function map_pointerY() {
	return global_y+(((height/2)-pointerY)/zoom_level)
}

function number_precision(num,prec) {
	return (num * (1/prec)).round()/(1/prec)
}

// sort ways by area:
function objects_sort(a,b) {
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
}

// Runs every frame in the draw() method. An attempt to isolate cartagen code from general GLOP code
function cartagen() {
	if (Prototype.Browser.MobileSafari) {
		simplify = 3
	}
	// gss body style:
	if (styles) {
		if (styles.body.fillStyle) fillStyle(styles.body.fillStyle)
		if (styles.body.strokeStyle) strokeStyle(styles.body.strokeStyle)
		if (styles.body.lineWidth || styles.body.lineWidth == 0) lineWidth(styles.body.lineWidth)
		rect(0,0,width,height)
		strokeRect(0,0,width,height)
	}
	
	translate(width/2,height/2)
		rotate(global_rotate)
		scale(zoom_level,zoom_level)
 	translate(width/-2,height/-2)
	// rotate(-1*global_rotate)
		translate((-1*global_x)+(width/2),(-1*global_y)+(height/2))
	// rotate(global_rotate)
	
	strokeStyle('white')
	lineWidth(10)
	
	// viewport stuff:
	viewport_width = width*(1/zoom_level)-(100*(1/zoom_level))
	viewport_height = height*(1/zoom_level)-(100*(1/zoom_level))
	viewport = [global_y-viewport_height/2,global_x-viewport_width/2,global_y+viewport_height/2,global_x+viewport_width/2]
	strokeRect(global_x-viewport_width/2,global_y-viewport_height/2,viewport_width,viewport_height)
}

// gets the plot under the current center of the screen
function get_current_plot() {
	if (global_x != lastPos[0] && global_y != lastPos[1]) {
		var new_lat1,new_lat2,new_lng1,new_lng2
		new_lat1 = y_to_lat(global_y)-range
		new_lng1 = x_to_lon(global_x)-range
		new_lat2 = y_to_lat(global_y)+range
		new_lng2 = x_to_lon(global_x)+range
		// this will look for cached plots, or get new ones if it fails
		get_cached_plot(new_lat1,new_lng1,new_lat2,new_lng2,bleed_level)
	}
	lastPos[0] = global_x
	lastPos[1] = global_y
}

function get_static_plot(url) {
	requested_plots++
	new Ajax.Request(url,{
		method: 'get',
		onSuccess: function(result) {
			// console.log(result.responseText.evalJSON().osm.ways.length+" ways")
			parse_objects(result.responseText.evalJSON())
			console.log(objects.length)
			requested_plots--
			if (requested_plots == 0) last_event = frame
			console.log("Total plots: "+plots.size()+", of which "+requested_plots+" are still loading.")
		}
	})
}

// reduces precision of a plot request to quantize plot requests
// checks against local storage for browers with HTML 5
// then fetches the plot and parses the data into the objects array
function get_cached_plot(_lat1,_lng1,_lat2,_lng2,_bleed) {
	plot_precision = 0.001
	_lat1 = number_precision(_lat1,plot_precision)
	_lng1 = number_precision(_lng1,plot_precision)
	_lat2 = number_precision(_lat2,plot_precision)
	_lng2 = number_precision(_lng2,plot_precision)
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
					parse_objects(ls)
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
			delayed_get_cached_plot(_lat1+plot_precision,_lng1+plot_precision,_lat2+plot_precision,_lng2+plot_precision,_bleed-1)
			delayed_get_cached_plot(_lat1-plot_precision,_lng1-plot_precision,_lat2-plot_precision,_lng2-plot_precision,_bleed-1)

			delayed_get_cached_plot(_lat1+plot_precision,_lng1,_lat2+plot_precision,_lng2,_bleed-1)
			delayed_get_cached_plot(_lat1,_lng1+plot_precision,_lat2,_lng2+plot_precision,_bleed-1)

			delayed_get_cached_plot(_lat1-plot_precision,_lng1,_lat2-plot_precision,_lng2,_bleed-1)
			delayed_get_cached_plot(_lat1,_lng1-plot_precision,_lat2,_lng2-plot_precision,_bleed-1)

			delayed_get_cached_plot(_lat1-plot_precision,_lng1+plot_precision,_lat2-plot_precision,_lng2+plot_precision,_bleed-1)
			delayed_get_cached_plot(_lat1+plot_precision,_lng1-plot_precision,_lat2+plot_precision,_lng2-plot_precision,_bleed-1)
		}
	} else {
		// we're live-loading! Gotta get it no matter what:
		load_plot(_lat1,_lng1,_lat2,_lng2)
	}
}

function delayed_get_cached_plot(_lat1,_lng1,_lat2,_lng2,_bleed) {
	bleed_delay = 1000+(2000*Math.random(_lat1+_lng1)) //milliseconds, with a random factor to stagger requests
	setTimeout("get_cached_plot("+_lat1+","+_lng1+","+_lat2+","+_lng2+","+_bleed+")",bleed_delay)
}

function load_plot(_lat1,_lng1,_lat2,_lng2) {
	requested_plots++
	new Ajax.Request('/map/plot.js?lat1='+_lat1+'&lng1='+_lng1+'&lat2='+_lat2+'&lng2='+_lng2+'',{
		method: 'get',
		onComplete: function(result) {
			parse_objects(result.responseText.evalJSON())
			requested_plots--
			if (requested_plots == 0) last_event = frame
			console.log("Total plots: "+plots.size()+", of which "+requested_plots+" are still loading.")
		}
	})
}

function parse_objects(data) {
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
		parse_styles(n,styles.node)
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
			parse_styles(w,styles.way)
			// parse_styles(w.hover,styles.)
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
	objects.sort(objects_sort)
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
			style(this)
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
			style(this)
			if (this.highlight) {
				lineWidth(3/zoom_level)
				strokeStyle("red")
			}
			// fade in after load:
			if (this.age < 20) {
				canvas.globalAlpha = this.age/20
			} else {
				canvas.globalAlpha = 1
			}
			
		beginPath()
		moveTo(this.nodes[0].x,this.nodes[0].y)

		// Res down for zoomed-out... getting a NaN for x % 0. Not that much savings yet.
		var resolution = Math.round(Math.abs(Math.log(zoom_level)))
		if (resolution == 0) resolution = 1
		this.nodes.each(function(node,index){
			if ((index % resolution == 0) || index == 0 || index == this.nodes.length-1 || this.nodes.length <= 30) {
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

// Searches all objects by tags, and sets highlight=true for all matches.
function highlights(query) {
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
}

// Rotates view slowly for cool demo purposes.
function demo() {
	try {
		global_rotate += 0.005
	} catch(e) {}
}

if (!static_map) {
	get_cached_plot(lat1,lng1,lat2,lng2,initial_bleed_level)
	new PeriodicalExecuter(get_current_plot,0.33)
} else {
	if (Prototype.Browser.MobileSafari) {
		get_static_plot(static_map_layers[0])
		get_static_plot(static_map_layers[1])
	} else {
		static_map_layers.each(function(layer_url) {
			get_static_plot(layer_url)
		})	
	}
}
load_next_script()