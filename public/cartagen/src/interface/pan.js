/**
 * @namespace The 'Pan' tool and associated methods.
 */
Tool.Pan = {
	mousedown: function(event) {
	        Map.x_old = Map.x
	        Map.y_old = Map.y
		Map.zoom_old = Map.zoom
	        Map.rotate_old = Map.rotate
	}.bindAsEventListener(Tool.Pan),
	mouseup: function() {

	}.bindAsEventListener(Tool.Pan),
	mousemove: function() {
		var lon = Projection.x_to_lon(-1*Map.pointer_x())
		var lat = Projection.y_to_lat(Map.pointer_y())
		var features = Geohash.get_current_features_upward(encodeGeoHash(lat, lon))
		if (features) features.reverse().concat(Mouse.hovered_features).invoke('style')
	}.bindAsEventListener(Tool.Pan),
	/*
	 * Handles drags. Should rewrite this as an event listener rather than passing from Event > Tool > here
	 */
	drag: function() {
		if (Keyboard.keys.get("r")) { // rotating
			Map.rotate = Map.rotate_old + (-1*Mouse.drag_y/Glop.height)
		} else if (Keyboard.keys.get("z")) {
			if (Map.zoom > 0) {
				Map.zoom = Math.abs(Map.zoom - (Mouse.drag_y/Glop.height))
			} else {
				Map.zoom = 0
			}
		} else {
			var d_x = Math.cos(Map.rotate)*Mouse.drag_x+Math.sin(Map.rotate)*Mouse.drag_y
			var d_y = Math.cos(Map.rotate)*Mouse.drag_y-Math.sin(Map.rotate)*Mouse.drag_x				
			Map.x = Map.x_old+(d_x/Map.zoom)
			Map.y = Map.y_old+(d_y/Map.zoom)
		}
	}
}
