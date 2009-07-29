//= require "geohash"
//= require "projection"
//= require "viewport"

/**
 * Stores data about the map and methods to manipulate it
 */
var Map = {
	/**
	 * Initializes the map properties
	 */
	init: function() {
		this.x = Projection.lon_to_x(Config.lng)
		this.y = Projection.lat_to_y(Config.lat)
		$('canvas').observe('glop:predraw', this.draw.bindAsEventListener(this))
		this.draw()
	},
	/**
	 * Updates the map properties. Runs every frame.
	 */
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
		this.resolution = Math.round(Math.abs(Math.log(Map.zoom)))
	},
	/**
	 * Mouse's x-coordinate, in the map's coordinate system
	 * @type Number
	 */
	pointer_x: function() { return Map.x+(((Glop.width/-2)-Mouse.x)/Map.zoom) },
	/**
	 * Mouse's y-coordinate, in the map's coordinate system
	 * @type Number
	 */
	pointer_y: function() { return Map.y+(((Glop.height/-2)-Mouse.y)/Map.zoom) },
	/**
	 * Bounding box of map, in [lon1, lat2, lon2, lat1] format
	 * @type Number[]
	 */
	bbox: [],
	/**
	 * X-coordinate of map's center. Set this to move the map.
	 * @type Number
	 */
	x: 0,
	/**
	 * X-coordinate of map's center. Set this to move the map.
	 * @type Number
	 */
	y: 0,
	/**
	 * Latitude of map's center
	 * @type Number
	 */
	lat: 0,
	/**
	 * Longitude of map's center
	 * @type Number
	 */
	lon: 0,
	/**
	 * Tilt degree, in radians
	 * @type Number
	 */
	rotate: 0,
	/**
	 * Tilt degree from beginning of drag motion
	 * @type Number
	 */
	rotate_old: 0,
	/**
	 * X-coordinate from beginning of drag motion
	 * @type Number
	 */
	x_old: 0,
	/**
	 * Y-coordinate from beginning of drag motion
	 * @type Number
	 */
	y_old: 0,
	/**
	 * Width of the map, in degrees of longitude
	 * @type Number
	 */
	lon_width: 0,
	/**
	 * Height of the map, in degrees of latitude
	 * @type Number
	 */
	lat_height: 0,
	/**
	 * Resolution of map - controls the ratio of number of nodes a way has and the number of nodes
	 * used to that way in the drawing process. Not that much savings yet. Automatically
	 * generated based on zoom level.
	 * @type Number
	 */
	resolution: 0,
	/**
	 * Last map position, as an [x, y] tuple
	 * @type Number[]
	 */
	last_pos: [0,0],
	/**
	 * Current zoom level
	 * @type Number
	 */
	 zoom: 0.5
}

// bind to events
document.observe('cartagen:init', Map.init.bindAsEventListener(Map))
document.observe('glop:predraw', Map.draw.bindAsEventListener(Map))
