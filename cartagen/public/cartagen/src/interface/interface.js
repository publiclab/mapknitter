//= require "keyboard"
//= require "mouse"
//= require "user"

/**
 * @namespace Misc. UI methods that do not related to user-submitted data
 */
var Interface = {
	/**
	 * Prompts the user to select a bbox, then downloads that bbox
	 */
	download_bbox: function() {
		Glop.paused = true

		alert('Please select a bounding box to download')

		var canvas = $('canvas')
		canvas.observe('mousemove', Interface.bbox_select_mousemove)
		canvas.observe('mousedown', Interface.bbox_select_mousedown)
		canvas.observe('mouseup', Interface.bbox_select_mouseup)
		canvas.stopObserving('mousemove', Events.mousemove)
		canvas.stopObserving('mousedown', Events.mousedown)
		canvas.stopObserving('mouseup', Events.mouseup)

		Interface.bbox_select_active = true
		Interface.bbox_select_dragging = false
	},
	bbox_select_mousemove: function(e) {
		if (Interface.bbox_select_active && Interface.bbox_select_dragging) {
			var pointer_x = Map.x+(((Glop.width/-2)+Event.pointerX(e))/Cartagen.zoom_level)
			var pointer_y = Map.y+(((Glop.height/-2)+Event.pointerY(e))/Cartagen.zoom_level)

			Interface.bbox_select_end = [pointer_x, pointer_y]

			Glop.draw(false, true)

			var width = Interface.bbox_select_end[0] - Interface.bbox_select_start[0]
			var height = Interface.bbox_select_end[1] - Interface.bbox_select_start[1]

			$C.save()
			$C.fill_style('#000')
			$C.opacity(0.1)
			$C.rect(Interface.bbox_select_start[0], Interface.bbox_select_start[1], width, height)
			$C.opacity(1)
			$C.stroke_style('#000')
			$C.stroke_rect(Interface.bbox_select_start[0], Interface.bbox_select_start[1], width, height)
			$C.restore()
		}
	}.bindAsEventListener(Interface),
	bbox_select_mousedown: function(e) {
		if (Interface.bbox_select_active && !Interface.bbox_select_dragging) {
			var pointer_x = Map.x+(((Glop.width/-2)+Event.pointerX(e))/Cartagen.zoom_level)
			var pointer_y = Map.y+(((Glop.height/-2)+Event.pointerY(e))/Cartagen.zoom_level)

			Interface.bbox_select_dragging = true
			Interface.bbox_select_start = [pointer_x, pointer_y]
			Interface.bbox_select_end = Interface.bbox_select_start
		}
	}.bindAsEventListener(Interface),
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

			var canvas = $('canvas')
			canvas.stopObserving('mousemove', Interface.bbox_select_mousemove)
			canvas.stopObserving('mousedown', Interface.bbox_select_mousedown)
			canvas.stopObserving('mouseup', Interface.bbox_select_mouseup)
			canvas.observe('mousemove', Events.mousemove)
			canvas.observe('mousedown', Events.mousedown)
			canvas.observe('mouseup', Events.mouseup)

			Interface.bbox_select_active = true
			Interface.bbox_select_dragging = false
		}
	}.bindAsEventListener(Interface)
}