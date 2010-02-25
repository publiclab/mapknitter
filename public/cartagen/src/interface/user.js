/**
 * @namespace Data about the user, and function to collect user input and fetch other users' input
 */
var User = {
	/**
	 * Color assigned to this user's submissions
	 * @type String
	 */
	color: Glop.random_color(),
	/**
	 * Name of the user
	 * @type String
	 */
	name: 'anonymous',
	/**
	 * Latitude of the user, from geolocation
	 * @type Number
	 */
	lat: 0,
	/**
	 * Longitude of the user, from geolocation
	 * @type Number
	 */
	lon: 0,
	/**
	 * X-coordinate of the user, from geolocation
	 * @type Number
	 */
	x: -118.31700000003664,
	/**
	 * Y-coordinate of the user, from geolocation
	 * @type Number
	 */
	y: -6562600.9880228145,
	/**
	 * URI to submit nodes to
	 * @type String
	 */
	node_submit_uri: '/node/write',
	/**
	 * URI to get updated nodes from
	 * @type String
	 */
	node_updates_uri: '/node/read',
	/**
	 * URI to submit nodes to
	 * @type String
	 */
	way_submit_uri: '/way/write',
	/**
	 * URI to get way updates from
	 * @type String
	 */
	way_update_uri: '/way/read',
	/**
	 * Width of user-submitted lines
	 * @type Number
	 */
	line_width:15,
	/**
	 * Radius of user-submitted nodes
	 * @type Number
	 */
	node_radius: 30,
	/**
	 * How often the user's location is updated when following
	 * @type Number
	 */
	follow_interval: 60,
	/**
	 * Whether we are following the user, like a creepy stalker
	 * @type Boolean
	 */
	following: false,
	/**
	 * The PeriodicalExecuter that is responsible for updating the user's location
	 * @type PeriodicalExecuter
	 */
	following_executer: null,
	/**
	 * Whether the user is in the process of drawing a way
	 * @type Boolean
	 */
	drawing_way: false,
	/**
	 * Ids of user-submitted nodes that have already been loaded
	 * @type String[]
	 */
	loaded_node_ids: [],
	/**
	 * Loads User-submitted data and sets up the periodical updater to reload
	 * data. Bound to cartagen:postinit
	 */
	init: function() {
		if (Config.load_user_features) {
			User.update()
			new PeriodicalExecuter(User.update, 60)
		}
	},
	/**
	 * Geolocates the user. Geolocation is asynchronous. Location is available as User.lat and
	 * User.lon once the asynchronous request has completed. Returns true if geolocaion is supported
	 * by the user agent, else returns false.
	 */
	geolocate: function() {
		// geolocate if available
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(User.set_loc)
			return true
		}
		else return false
	},
	/**
	 * Sets the user's location
	 * @param {Location} loc The Loction object passed by navigator.geolocation
	 */
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
		// User.calculate_coords()
		$l('detected location: '+this.lat+","+this.lon)
	},
	/**
	 * Calculates the user's x and y based on the user's lon and lat
	 */
	calculate_coords: function() {
		// this should be based on lat and lon
	},
	/**
	 * Creates a node
	 * @param {Number} [x]     X-coordinate of node. Defaults to User.x
	 * @param {Number} [y]     Y-coordinate of node. Defaults to User.y
	 * @param {Boolean} [draw] Whether this node should be drawn on the canvas. Defaults to false.
	 *                         If this is ture, the node is registered with Geohash.
	 * @param {String} [id]    Id of the node. Defaults to a random number below 1000000000
	 *                         prefixed with "temp_"
	 * @return The created node
	 * @type Node
	 */
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
        	Glop.trigger_draw()
		}

		return node
	},
	/**
	 * Creates and submits a node to the server. The node is set to be drawn in each frame, and
	 * sets the id of the node to the server-generated id, prefixed with "cartagen_".
	 * @param {Object} [x] X-coordinate of the node. Defaults to user's x.
	 * @param {Object} [y] Y-coordinate of the node. Defaults to user's y.
	 */
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
	/**
	 * Toggles whether the map follows the user.
	 */
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
	/**
	 * Updates the user's location with geolocation and moves the map to be centered on the user.
	 */
	center_map_on_user: function() {
		navigator.geolocation.getCurrentPosition(User.set_loc_and_center)
		// User.set_loc_and_center()
	},
	/**
	 * Draws a small circle of desired color centered on the user's latitude and longitude.
	 */
	mark: function() {
		$C.stroke_style('white')
		$C.line_width(3.5/Map.zoom)
		$C.begin_path()
		$C.translate(User.x,User.y)
		$C.arc(0,0,10/Map.zoom,0,Math.PI*2,true)
		$C.move_to(10/Map.zoom,0)
		$C.line_to(6/Map.zoom,0)
		$C.move_to(-10/Map.zoom,0)
		$C.line_to(-6/Map.zoom,0)
		$C.move_to(0,10/Map.zoom)
		$C.line_to(0,6/Map.zoom)
		$C.move_to(0,-10/Map.zoom)
		$C.line_to(0,-6/Map.zoom)
		$C.stroke()
				
		$C.stroke_style('#4C6ACB')
		$C.line_width(2/Map.zoom)
		$C.begin_path()
		$C.arc(0,0,10/Map.zoom,0,Math.PI*2,true)
		$C.move_to(10/Map.zoom,0)
		$C.line_to(6/Map.zoom,0)
		$C.move_to(-10/Map.zoom,0)
		$C.line_to(-6/Map.zoom,0)
		$C.move_to(0,10/Map.zoom)
		$C.line_to(0,6/Map.zoom)
		$C.move_to(0,-10/Map.zoom)
		$C.line_to(0,-6/Map.zoom)
		$C.stroke()
	},
	/**
	 * Sets the user's location and centers the map on the new location
	 * @param {Location} loc Location object from navigator.geolocation
	 */
	set_loc_and_center: function(loc) {
		User.set_loc(loc)
		Map.x = User.x
		Map.y = User.y
		Glop.trigger_draw()
	},
	/**
	 * Toggles whether the user is drawing a way. When ending a way, submits the way to the server
	 * and updates the way's id to the server-generated id, prefixed with "cartagen_". When 
	 * starting a way, the way is created with a node at the user's current position.
	 * @param {Number} [x] X-coordinate of the start or end node. Defaults to user's x.
	 * @param {Number} [y] Y-coordinate of the start or end node. Defaults to user's y.
	 */
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
			Glop.trigger_draw()			
		}
		User.drawing_way = !User.drawing_way
	},
	/**
	 * Submits a way to the server and updates its id to the server-generated id, prefixed with
	 * "cartagen_"
	 * @param {Way} way Way to submit
	 */
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
	/**
	 * Adds a node to the way that is currently being drawn
	 * @param {Number} [x] X-coordinate of node to add
	 * @param {Number} [y] Y-coordinate of node to add
	 */
	add_node: function(x, y) {
		node = User.create_node(x, y, true)
		User.way.nodes.push(node)
		User.way.bbox = Geometry.calculate_bounding_box(User.way.nodes)
		Glop.trigger_draw()
	},
	/**
	 * Updates the map with other users' nodes and ways
	 */
	update: function() {
		if (!Config.load_user_features) return
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
	// callback for update - takes the server's node data
	// and creates the nodes, then loads ways, as needed
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

					// BAD!!! Why do we need a *-1????
					n.x = -1*Projection.lon_to_x(n.lon)
					n.y = Projection.lat_to_y(n.lat)
					n.strokeStyle = "rgba(0,0,0,0)"
					n.user_submitted = true
					Geohash.put(n.lat, n.lon, n, 1)
				}
			}
		})
		Glop.trigger_draw()
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
	// callback for _update_nodes - updates the map with the server's way data
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
			// BAD!!! Why do we need a *-1????
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

// bind events
document.observe('cartagen:postinit', User.init.bindAsEventListener(User))
