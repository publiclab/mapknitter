//= require "keyboard"
//= require "mouse"
//= require "user"
//= require "context_menu"
//= require "zoom"
//= require "tool"
//= require "select"
//= require "pen"
//= require "pan"

/**
 * @namespace Misc. UI methods that do not related to user-submitted data
 */
var Interface = {
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
		Tool.change('Select')
	}
}
