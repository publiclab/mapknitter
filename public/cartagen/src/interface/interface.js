//= require "keyboard"
//= require "mouse"
//= require "user"
//= require "context_menu"
//= require "zoom"
//= require "tool"
//= require "select"
//= require "pen"
//= require "pan"
//= require "warp"

/**
 * @namespace Misc. UI methods that do not related to user-submitted data
 */
var Interface = {
	/**
	 * Draws the display for how much of the map data has downloaded.
	 */
	display_loading: function() {
		var percent = Importer.parse_manager.completed
		if (percent > 75 || (percent < 100)) {
			$('loading_message').hide()
		}
		if (percent < 100) {
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
	 * Displays 'Loading map data...' until more than 75 percent of the map data is loaded.
	 */
	display_loading_message: function(percent) {
		$$('body')[0].insert('<div onClick="$(\'loading_message\').hide();" id="loading_message" style="position:absolute;z-index:999;top:45%;width:100%;text-align:center;-webkit-user-select:none;-moz-user-select:none;"><div style="width:200px;margin:auto;background:rgba(230,230,230,0.9);font-family:Lucida Grande,Lucida Sans Console,Georgia,sans-serif;font-size:16px;padding:14px;-moz-border-radius:10px;-webkit-border-radius:10px;"><p><img src="/images/spinner.gif" style="margin-bottom:12px;" /><br />Loading map data...</div></div>')
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
