/**
 * @namespace The 'select' tool and associated methods.
 */
Tool.Select = {
	bbox_select_mousemove: function(e) {
		if (Interface.bbox_select_active && Interface.bbox_select_dragging) {
			var pointer_x = Map.x+(((Glop.width/-2)+Event.pointerX(e))/Map.zoom)
			var pointer_y = Map.y+(((Glop.height/-2)+Event.pointerY(e))/Map.zoom)

			Interface.bbox_select_end = [pointer_x, pointer_y]

			Glop.draw(false, true)

			var width = Interface.bbox_select_end[0] - Interface.bbox_select_start[0]
			var height = Interface.bbox_select_end[1] - Interface.bbox_select_start[1]

			$C.save()
			$C.fill_style('#000')
			$C.opacity(0.2)
			$C.rect(Interface.bbox_select_start[0], Interface.bbox_select_start[1], width, height)
			$C.opacity(1)
			$C.stroke_style('#000')
			$C.stroke_rect(Interface.bbox_select_start[0], Interface.bbox_select_start[1], width, height)
			$C.restore()
		}
	}.bindAsEventListener(Tool.Select),
	bbox_select_mousedown: function(e) {
		if (Interface.bbox_select_active && !Interface.bbox_select_dragging) {
			var pointer_x = Map.x+(((Glop.width/-2)+Event.pointerX(e))/Map.zoom)
			var pointer_y = Map.y+(((Glop.height/-2)+Event.pointerY(e))/Map.zoom)

			Interface.bbox_select_dragging = true
			Interface.bbox_select_start = [pointer_x, pointer_y]
			Interface.bbox_select_end = Interface.bbox_select_start
		}
	}.bindAsEventListener(Tool.Select),
	bbox_select_mouseup: function() {
		if (Interface.bbox_select_active && Interface.bbox_select_dragging) {
			Glop.paused = false
			$l(Interface.bbox_select_start[0])
			$l(Interface.bbox_select_end[0])

			var min_lon = Math.min(Projection.x_to_lon(Interface.bbox_select_start[0]), Projection.x_to_lon(Interface.bbox_select_end[0]))
			var min_lat = Math.min(Projection.y_to_lat(Interface.bbox_select_start[1]), Projection.y_to_lat(Interface.bbox_select_end[1]))
			var max_lon = Math.max(Projection.x_to_lon(Interface.bbox_select_start[0]), Projection.x_to_lon(Interface.bbox_select_end[0]))
			var max_lat = Math.max(Projection.y_to_lat(Interface.bbox_select_start[1]), Projection.y_to_lat(Interface.bbox_select_end[1]))

			var query = min_lon + ',' + min_lat + ',' + max_lon + ',' + max_lat

			window.open('/api/0.6/map.json?bbox=' + query, 'Cartagen data')

			var lon = (Map.bbox[0] + Map.bbox[2]) / 2
			var lat = (Map.bbox[1] + Map.bbox[3]) / 2

			alert('Copy these values into your Cartagen.setup call: \n\nlat: ' + lat + ', \nlng: ' + lon + ',\nzoom_level: ' + Map.zoom)

			Interface.switch_tool('pan')

			Interface.bbox_select_active = true
			Interface.bbox_select_dragging = false
		}
	}.bindAsEventListener(Tool.Select)
}
