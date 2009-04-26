var tiles = new Hash(), nodes = new Hash(), ways = new Hash(), styles, lastPos = [0,0], queue = [], scale_factor = 100000

global_x = lon_to_x((lng1+lng2)/2)
global_y = lat_to_y((lat1+lat2)/2)

function map_pointerX() {
	return global_x-(width/2)+pointerX
}
function map_pointerY() {
	return global_y-(height/2)+pointerY
}

function number_precision(num,prec) {
	return (num * (1/prec)).round()/(1/prec)
}

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

function highlights(query) {
	objects.each(function(object) {
		object.highlight = false
		if (query != "" && object.tags && object instanceof Way) {
			object.tags.each(function(tag) {
				if (tag.key.toLowerCase().match(query.toLowerCase()) || tag.value.toLowerCase().match(query.toLowerCase())) {
					object.highlight = true
				}
			})
			if (object.description && object.description.toLowerCase().match(query.toLowerCase())) {
				object.highlight = true
			}
		}
	})
}

function cartagen() {
	translate(width/2,height/2)
		rotate(global_rotate)
		scale(zoom_level,zoom_level)
 	translate(width/-2,height/-2)
	// rotate(-1*global_rotate)
		translate((-1*global_x)+(width/2),(-1*global_y)+(height/2))
	// rotate(global_rotate)
	// objects = objects.concat(queue.splice(0,parseInt(queue.length/2)+4))
	// objects.sort()
}

function get_plot() {
	if (global_x != lastPos[0] && global_y != lastPos[1]) {
		var new_lat1,new_lat2,new_lng1,new_lng2
		new_lat1 = y_to_lat(global_y)-range
		new_lng1 = x_to_lon(global_x)-range
		new_lat2 = y_to_lat(global_y)+range
		new_lng2 = x_to_lon(global_x)+range
		load_plot(new_lat1,new_lng1,new_lat2,new_lng2)
	}
	lastPos[0] = global_x
	lastPos[1] = global_y
}
new PeriodicalExecuter(get_plot,0.33)

bbox = new Box
bbox.x = lon_to_x(lng1)+global_x
bbox.y = lat_to_y(lat1)+global_y
bbox.shape = function() {
	canvas.save()
	strokeStyle("#900")
	lineWidth(3)
	rect(lon_to_x(lng1) * -1 * scale_factor,lat_to_y(lat1) * -1 * scale_factor,5,5)
	rect(lon_to_x(lng2) * scale_factor,lat_to_y(lat2) * scale_factor,5,5)
	stroke()
	canvas.restore()
}
objects.push(bbox)

new Ajax.Request('/glop/style.gss',{
	method: 'get',
	onComplete: function(result) {
		styles = ("{"+result.responseText+"}").evalJSON()
	}
})

function load_plot(_lat1,_lng1,_lat2,_lng2) {
	_lat1 = number_precision(_lat1,0.001)
	_lng1 = number_precision(_lng1,0.001)
	_lat2 = number_precision(_lat2,0.001)
	_lng2 = number_precision(_lng2,0.001)
	if (!tiles.get(_lat1+","+_lng1+","+_lat2+","+_lng2)) {
		tiles.set(_lat1+","+_lng1+","+_lat2+","+_lng2,true)
		new Ajax.Request('/map/plot.js?lat1='+_lat1+'&lng1='+_lng1+'&lat2='+_lat2+'&lng2='+_lng2+'',{
			method: 'get',
			onComplete: function(result) {
		                data = result.responseText.evalJSON()
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
							// n.visible = node.visible
							n.x = lon_to_x(n.lon)
							n.y = lat_to_y(n.lat)
							// objects.push(n)
							// queue.push(n)
							nodes.set(n.id,n)
		                })
						data.osm.way.each(function(way){
							if (!ways.get(way.id)) {
								var w = new Way
								w.id = way.id
								w.user = way.user
								w.timestamp = way.timestamp
								w.nodes = []
								w.x = 0
								w.y = 0
								way.nd.each(function(nd){
									//find the node corresponding to nd.ref
									try {
										node = nodes.get(nd.ref)
										w.x += node.x
										w.x += node.y
										w.nodes.push([node.x,node.y])

									} catch(e) {
										// alert(nd.ref)
									}
								})
								w.x = w.x/w.nodes.length
								w.y = w.y/w.nodes.length
								w.area = poly_area(w.nodes)
								w.tags = new Hash()
								way.tag.each(function(tag) {
									w.tags.set(tag.k,tag.v)
								})
								objects.push(w)
								// queue.push(w)
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
		})
	} else {
		console.log("already loaded")
	}
}
load_plot(lat1,lng1,lat2,lng2)

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
			style(this,styles.node)
		beginPath()
		translate(this.x,this.y-6)
		arc(0,this.radius,this.radius,0,Math.PI*2,true)
		fill()
		stroke()
	    canvas.restore()
  },
  overlaps: function(target_x,target_y,fudge) {
  	if (target_x > this.x-fudge && target_x < this.x+fudge) {
  		if (target_y > this.y-fudge && target_y < this.y+fudge) {
		  	return true
  		} else {
  			return false
  		}
  	} else {
  		return false
  	}
  },
  within: function(start_x,start_y,end_x,end_y) {
	return false
  }
})

var Way = Class.create({
	age: 0,
	draw: function() {
		this.shape()
		this.age += 1;
	},
	shape: function() {
	    canvas.save()
			style(this,styles.way)
			if (this.highlight) {
				lineWidth(5)
				strokeStyle("red")
				// this.highlight = false
			}
			if (this.age < 20) {
				canvas.globalAlpha = this.age/20
			} else {
				canvas.globalAlpha = 1
			}
		beginPath()
		this.nodes.each(function(node){
			lineTo(node[0],node[1])
		})
		// lineTo(this.nodes[0][0],this.nodes[0][1])
		stroke()
		if (this.nodes[0][0] == this.nodes[this.nodes.length-1][0] && this.nodes[0][1] == this.nodes[this.nodes.length-1][1]) fill()
	    canvas.restore()
	},
	highlight: false,
	nodes: [],
	tags: new Hash(),
	overlaps: function() {
		return false
  },
  click: function() {
	// if (this.label) {
	// 	delete this.label
	// } else {
	// 	this.label = new Label
	// 	this.label.content = this.user+": "+this.timestamp
	// }
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
		area += last[0]*node[1]-node[0]*last[1]+node[0]*next[1]-next[0]*node[1]
	})
	return Math.abs(area/2)
}

function lon_to_x(lon) { return (lon - center_lon()) * -1 * scale_factor }
function x_to_lon(x) { return (x/(-1*scale_factor)) + center_lon() }

function lat_to_y(lat) { return 1.7*((180/Math.PI * (2 * Math.atan(Math.exp(lat*Math.PI/180)) - Math.PI/2))) * scale_factor }
function y_to_lat(y) { return (180/Math.PI * Math.log(Math.tan(Math.PI/4+(y/(scale_factor*1.7))*(Math.PI/180)/2))) }

function center_lon() {
	return (lng2+lng1)/2
}
load_next_script()