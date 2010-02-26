/**
 * @namespace The 'Select' tool and associated methods.
 */
Tool.Select = {
	activate: function() {
		Tool.Select.active = true
		Tool.Select.dragging = false
	},
	deactivate: function() {
		Tool.Select.active = false
		Tool.Select.dragging = false
	},
	mousemove: function(e) {
		if (Tool.Select.active && Tool.Select.dragging) {
			var pointer_x = Map.x+(((Glop.width/-2)+Event.pointerX(e))/Map.zoom)
			var pointer_y = Map.y+(((Glop.height/-2)+Event.pointerY(e))/Map.zoom)

			Tool.Select.end = [pointer_x, pointer_y]

			Glop.draw(false, true)

			var width = Tool.Select.end[0] - Tool.Select.start[0]
			var height = Tool.Select.end[1] - Tool.Select.start[1]

			$C.save()
			$C.fill_style('#000')
			$C.opacity(0.2)
			$C.rect(Tool.Select.start[0], Tool.Select.start[1], width, height)
			$C.opacity(1)
			$C.line_width(3/Map.zoom)
			$C.stroke_style('#000')
			$C.stroke_rect(Tool.Select.start[0], Tool.Select.start[1], width, height)
			$C.restore()
		}
	}.bindAsEventListener(Tool.Select),
	mousedown: function(e) {
		if (Tool.Select.active && !Tool.Select.dragging) {
			var pointer_x = Map.x+(((Glop.width/-2)+Event.pointerX(e))/Map.zoom)
			var pointer_y = Map.y+(((Glop.height/-2)+Event.pointerY(e))/Map.zoom)

			Tool.Select.dragging = true
			Tool.Select.start = [pointer_x, pointer_y]
			Tool.Select.end = Tool.Select.start
		}
	}.bindAsEventListener(Tool.Select),
	mouseup: function() {
		if (Tool.Select.active && Tool.Select.dragging) {
			Glop.paused = false
			$l(Tool.Select.start[0])
			$l(Tool.Select.end[0])

			var min_lon = Math.min(Projection.x_to_lon(Tool.Select.start[0]), Projection.x_to_lon(Tool.Select.end[0]))
			var min_lat = Math.min(Projection.y_to_lat(Tool.Select.start[1]), Projection.y_to_lat(Tool.Select.end[1]))
			var max_lon = Math.max(Projection.x_to_lon(Tool.Select.start[0]), Projection.x_to_lon(Tool.Select.end[0]))
			var max_lat = Math.max(Projection.y_to_lat(Tool.Select.start[1]), Projection.y_to_lat(Tool.Select.end[1]))

			var query = min_lon + ',' + min_lat + ',' + max_lon + ',' + max_lat

			window.open('/api/0.6/map.json?bbox=' + query, 'Cartagen data')

			var lon = (Map.bbox[0] + Map.bbox[2]) / 2
			var lat = (Map.bbox[1] + Map.bbox[3]) / 2

			alert('Copy these values into your Cartagen.setup call: \n\nlat: ' + lat + ', \nlng: ' + lon + ',\nzoom_level: ' + Map.zoom)

			Tool.change('Pan')
		}
	}.bindAsEventListener(Tool.Select),
	drag: function() {

	},
	dblclick: function() {
		$l('Select dblclick')
	}.bindAsEventListener(Tool.Select)
}
