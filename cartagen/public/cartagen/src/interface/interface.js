//= require "keyboard"
//= require "mouse"
//= require "user"
//= require "context_menu"
//= require "zoom"

/**
 * @namespace Misc. UI methods that do not related to user-submitted data
 */
var Interface = {
	display_loading: function(percent) {
		if (percent < 100) {
			// $l('bar')
			$C.save()
	        $C.translate(Map.x,Map.y)
			$C.rotate(-Map.rotate)
	        $C.translate(-Map.x,-Map.y)
			$C.fill_style('white')
			$C.line_width(0)
			$C.opacity(0.7)
			var x = Map.x-(1/Map.zoom*(Glop.width/2))+(40/Map.zoom), y = Map.y-(1/Map.zoom*(Glop.height/2))+(40/Map.zoom)
			$C.begin_path()
				$C.line_to(x,y)
				$C.arc(x,y,24/Map.zoom,-Math.PI/2,Math.PI*2-Math.PI/2,false)
				$C.line_to(x,y)
			$C.fill()
			$C.opacity(0.9)
			$C.line_width(6/Map.zoom)
			$C.stroke_style('white')
			$C.line_cap('square')
			$C.begin_path()
				$C.arc(x,y,27/Map.zoom,-Math.PI/2,Math.PI*2*(percent/100)-Math.PI/2,false)
			$C.stroke()
			var width = $C.measure_text("Lucida Grande, sans-serif",
			             12,
			             parseInt(percent)+"%")
			$C.draw_text("Lucida Grande, sans-serif",
			             12/Map.zoom,
						 "#333",
			             x-(width/(2*Map.zoom)),
						 y+(6/Map.zoom),
						 parseInt(percent)+"%")	
			$C.translate(Map.x,Map.y)
			$C.rotate(Map.rotate)
	        $C.translate(-Map.x,-Map.y)
			$C.restore()
		}
	},
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
	}.bindAsEventListener(Interface),
	bbox_select_mousedown: function(e) {
		if (Interface.bbox_select_active && !Interface.bbox_select_dragging) {
			var pointer_x = Map.x+(((Glop.width/-2)+Event.pointerX(e))/Map.zoom)
			var pointer_y = Map.y+(((Glop.height/-2)+Event.pointerY(e))/Map.zoom)

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

			var lon = (Map.bbox[0] + Map.bbox[2]) / 2
			var lat = (Map.bbox[1] + Map.bbox[3]) / 2

			alert('Copy these values into your Cartagen.setup call: \n\nlat: ' + lat + ', \nlng: ' + lon + ',\nzoom_level: ' + Map.zoom)

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
