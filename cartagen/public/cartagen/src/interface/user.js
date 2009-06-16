/**
 * @namespace
 */
var User = {
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
	line_width:15,
	node_radius: 30,
	follow_interval: 60,
	following: false,
	following_executer: null,
	drawing_way: false,
	loaded_node_ids: [],
	nodes: [],
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
		node.strokeStyle = "rgba(0,0,0,0)"
		
		if (_draw) {
			Geohash.put(node.lat, node.lon, node, 1)
			objects.push(node)
        	draw()
		}
		User.nodes.push(node)
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
			User.way.strokeStyle = User.color
			User.way.lineWidth = User.line_width
			User.way.age = 40
			Cartagen.debug([Projection.y_to_lat(User.way.y), Projection.x_to_lon(User.way.x), User.way, 1])
			Geohash.put(Projection.y_to_lat(User.way.y), Projection.x_to_lon(User.way.x), User.way, 1)
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
				return [node.lat, node.lon]
			})
		}
		Cartagen.debug(_way.nodes)
		Cartagen.debug(params)
		new Ajax.Request(User.way_submit_uri, {
			parameters: {way: Object.toJSON(params)},
			onSuccess: function(transport) {
				_way.id = 'cartagen_' + transport.responseJSON.way_id
				var id = 0
				_way.nodes.each(function(nd) {
					id = transport.responseJSON.node_ids.shift()
					nd.id = 'cartagen_' + transport.responseJSON.node_ids.shift()
					User.loaded_node_ids.push(id)
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
		var params = {
			bbox: Map.bbox.join(',')
		}
		if (User.last_pos && User.last_pos == [Map.x, Map.y]) {
			 params.timestamp = User.last_update
		}
		new Ajax.Request(User.node_updates_uri, {
			parameters: params,
			onSuccess: function(transport) {
				Cartagen.debug(transport)
				User.update_nodes(transport.responseJSON)
			}
		})
		User.last_pos = [Map.x, Map.y]
		User.last_update = (new Date()).toUTCString()
	},
	update_nodes: function(nodes) {
		var ways = []
		nodes.each(function(node) {
			node = node.node
			if (User.loaded_node_ids.indexOf(node.id) == -1) {				
				if (node.way_id != 0) {
					ways.push(node.way_id)
				}
				else {
					var n = new Node
					n.height = User.node_radius*2
					n.width = User.node_radius*2
					n.radius = User.node_radius
					n.fillStyle = node.color
					n.user = node.author
					n.lat = node.lat
					n.lon = node.lon
					// BAD!!! Why do we need a *-1????
					n.x = -1*Projection.lon_to_x(n.lon)
					n.y = Projection.lat_to_y(n.lat)
					n.strokeStyle = "rgba(0,0,0,0)"
					Geohash.put(n.lat, n.lon, n, 1)
				}
			}
		})
		Cartagen.debug(ways)
		draw()
		if (ways.length > 0) {
			new Ajax.Request(User.way_update_uri, {
				parameters: {
					ids: ways.uniq().join(',')
				},
				onSuccess: function(transport) {
					Cartagen.debug(transport)
					User.update_ways(transport.responseJSON)
				}
			})
		}
	},
	update_ways: function(data) {
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
			// BAD!!! Why do we need a *-1????
			n.x = -1*Projection.lon_to_x(n.lon)
			n.y = Projection.lat_to_y(n.lat)
			n.strokeStyle = "rgba(0,0,0,0)"
			n.order = node.order
			if (nodes.get(node.way_id)) {
				nodes.get(node.way_id).push(n)
			}
			else {
				nodes.set(node.way_id, [n])
			}
		})
			
		data.way.each(function(way) {
			try {
			var nds = nodes.get(way.id).sort(function(a, b) {return a.order - b.order})
			var data = {
				id: 'cartagen_' + way.id,
				user: way.author,
				nodes: nds,
				tags: new Hash()
			}
			Cartagen.debug(way)
			Cartagen.debug(data)
			w = new Way(data)
			w.strokeStyle = way.color
			w.lineWidth = User.line_width
			Cartagen.debug(w)
			g_w = w
			} catch(e) {Cartagen.debug(e)}
		})
	}
}