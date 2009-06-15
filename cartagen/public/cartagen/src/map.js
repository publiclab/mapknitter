var Map = {
	initialize: function() {
		this.x = Projection.lon_to_x((Cartagen.lng1+Cartagen.lng2)/2)
		this.y = Projection.lat_to_y((Cartagen.lat1+Cartagen.lat2)/2)
	},
	draw: function() {
		var lon1 = Projection.x_to_lon(Map.x - (Viewport.width/2))
		var lon2 = Projection.x_to_lon(Map.x + (Viewport.width/2))
		var lat1 = Projection.y_to_lat(Map.y - (Viewport.height/2))
		var lat2 = Projection.y_to_lat(Map.y + (Viewport.height/2))
		this.bbox = [lon1, lat2, lon2, lat1]
		this.lon_width = Math.abs(this.bbox[0]-this.bbox[2])
		this.lat_height = Math.abs(this.bbox[1]-this.bbox[3])
		this.lat = Projection.y_to_lat(this.y)
		this.lon = Projection.x_to_lon(this.x)
		this.resolution = Math.round(Math.abs(Math.log(Cartagen.zoom_level)))
	},
	pointer_x: function() { return Map.x+(((width/-2)-Mouse.x)/Cartagen.zoom_level) },
	pointer_y: function() { return Map.y+(((height/-2)-Mouse.y)/Cartagen.zoom_level) },
	bbox: [],
	x: 0,
	y: 0,
	lat: 0,
	lon: 0,
	rotate: 0,
	rotate_old: 0, // from beginning of drag motion
	x_old: 0, // from beginning of drag motion
	y_old: 0,
	lon_width: 0,
	lat_height: 0,
	resolution: Math.round(Math.abs(Math.log(Cartagen.zoom_level))), // Res down for zoomed-out... getting a NaN for x % 0. Not that much savings yet.
	last_pos: [0,0]
}