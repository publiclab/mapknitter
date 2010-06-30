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
	mousemove: function(event) {
		Mouse.window_x = Event.pointerX(event)
		Mouse.window_y = Event.pointerY(event)
	},
	/**
 	 * Creates listeners for mouseover and mouseout events for buttons
 	 * on the toolbar; must run every time you change the toolbar.
 	 */
	setup_tooltips: function() {
		$$('.toolbar a').each(function(toolbar){
			toolbar.onmouseover = function() {
				Interface.show_tooltip(toolbar.name)
			}
			toolbar.onmouseout = function() {
				$$('.tooltip').each(function(tooltip) {
					tooltip.remove()
				})
			}
		})
	},
	/**
 	 * Show a tooltip
 	 */
	show_tooltip: function(name) {
		$$('.tooltip').each(function(tooltip){
			//delete it
			tooltip.remove()
		})
		$$('body')[0].insert('<div class="tooltip" id="tooltip">'+name+'</div>')
		// console.log('hey there '+Mouse.window_x+' '+$('tooltip').style.left)
		$('tooltip').style.left = (Mouse.window_x)+'px'
	},
	display_iframe: function() {
		if ($('iframe_code') != undefined) {
			$('iframe_code').remove()
		} else { $$('body')[0].insert("<div style='padding:6px 10px;width:400px;z-index:999999;background:rgba(255,255,255,0.6);margin:8px;' id='iframe_code'><h3>Embed this map on your web site</h3><p>Copy this code and paste it into a blog post or HTML page:</p><textarea cols='40' rows='5'>"+Interface.get_iframe(Map.lat,Map.lon,Map.zoom,Config.stylesheet)+"</textarea><p style='text-align:right;'><br style='clear:both;' /></div>")
		$('iframe_code').absolutize()
		}
	},
	display_knitter_iframe: function() {
		if ($('iframe_code') != undefined) {
			$('iframe_code').remove()
		} else { $$('body')[0].insert("<div style='padding:6px 10px;width:400px;z-index:999999;background:rgba(255,255,255,0.6);margin:8px;' id='iframe_code'><h3>Embed this map on your web site</h3><p>Copy this code and paste it into a blog post or HTML page:</p><textarea cols='40' rows='5'>"+Interface.get_iframe(Map.lat,Map.lon,Map.zoom,Config.stylesheet,'http://cartagen.org/maps/'+Config.map_name,true)+"</textarea><p style='text-align:right;'><br style='clear:both;' /></div>")
		$('iframe_code').absolutize()
		}
	},
	get_iframe: function(lat,lon,zoom,stylesheet,url,locked,height,width) {
		width = width || 500
		height = height || 300
		zoom = zoom || 2
		url = url || 'http://cartagen.org'

		code = "<iframe height='"+height+"'width='"+width+"' src='"+url+'?fullscreen=true'
		if (!Object.isUndefined(locked)) code += '&#038;locked=true'
		if (!Object.isUndefined(stylesheet)) code += '&#038;gss='+stylesheet
		code = code + "' style='border:0;'></iframe>"
 		return code
		//return "<iframe height='"+height+"' width='"+width+"'  src='"+url+"?gss="+stylesheet+"&#038;fullscreen=true&#038;zoom_level="+zoom+"' style='border:0;'></iframe>"
	},
	/**
	 * Draws the display for how much of the map data has downloaded.
	 */
	display_loading: function() {
		if (Config.vectors) {
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
		}
	},
	/**
	 * Displays 'Loading map data...' until more than 75 percent of the map data is loaded.
	 */
	display_loading_message: function(percent) {
		if (Config.vectors) {
	  		$$('body')[0].insert('<div onClick="$(\'loading_message\').hide();" id="loading_message" style="position:absolute;z-index:8;top:25%;width:100%;text-align:center;-webkit-user-select:none;-moz-user-select:none;"><div style="width:200px;margin:auto;background:rgba(255,255,255,0.8);font-family:Lucida Grande,Lucida Sans Console,Georgia,sans-serif;font-size:16px;padding:14px;-moz-border-radius:10px;-webkit-border-radius:10px;"><p><img src="/images/spinner.gif" style="margin-bottom:12px;" /><br />Loading map data...</div></div>')
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
document.observe('mousemove',Interface.mousemove)

