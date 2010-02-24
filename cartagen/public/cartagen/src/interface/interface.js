//= require "keyboard"
//= require "mouse"
//= require "user"
//= require "context_menu"
//= require "zoom"
//= require "tool"
//= require "select"
//= require "pen"

/**
 * @namespace Misc. UI methods that do not related to user-submitted data
 */
var Interface = {
	/**
	 * The tool currently in use. Options include 'pan', 'pen', 'select'
	 */
	tool: 'pan',
	switch_tool: function(new_tool) {
		old_tool = Interface.tool
		
		// Close old tool:
		
		if (old_tool == 'select') {
			Glop.stopObserving('mousemove', Tool.Select.mousemove)
			Glop.stopObserving('mousedown', Tool.Select.mousedown)
			Glop.stopObserving('mouseup', Tool.Select.mouseup)
		} else if (old_tool == 'pan') {
			Glop.stopObserving('mousemove', Events.mousemove)
			Glop.stopObserving('mousedown', Events.mousedown)
			Glop.stopObserving('mouseup', Events.mouseup)
		} else if (old_tool == 'pen') {
			Glop.stopObserving('mousemove', Pen.mousemove)
			Glop.stopObserving('mousedown', Pen.mousedown)
			Glop.stopObserving('mouseup', Pen.mouseup)
		}
		
		// Start new tool:
		if (new_tool == 'select') {
			Glop.observe('mousemove', Tool.Select.mousemove)
			Glop.observe('mousedown', Tool.Select.mousedown)
			Glop.observe('mouseup', Tool.Select.mouseup)
		} else if (new_tool == 'pan') {
			Glop.observe('mousemove', Events.mousemove)
			Glop.observe('mousedown', Events.mousedown)
			Glop.observe('mouseup', Events.mouseup)
		} else if (new_tool == 'pen') {
			Glop.stopObserving('mousemove', Pen.mousemove)
			Glop.stopObserving('mousedown', Pen.mousedown)
			Glop.stopObserving('mouseup', Pen.mouseup)
		}
		
		Interface.tool = new_tool
	},
	/**
	 * Draws the display for how much of the map data has downloaded.
	 */
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

		Interface.switch_tool('select')

		Interface.bbox_select_active = true
		Interface.bbox_select_dragging = false
	}
}
