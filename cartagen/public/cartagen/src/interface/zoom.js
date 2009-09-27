/**
 * @namespace Provides a non-scrollwheel zooming interface
 */
var Zoom = {
	initialize: function() {
		$('canvas').observe('cartagen:postdraw', Zoom.draw.bindAsEventListener(this))
	},
	zoom_to: function() {
		
	},
	width: 20,
	height:0.4,
	draw: function() {
		
		// Glop.height*0.3
		// $l('hey')
		$C.save()
		$C.fill_style('white')
		$C.line_width(Zoom.width/Cartagen.zoom_level)
		$C.opacity(0.7)
		var x = Map.x-(1/Cartagen.zoom_level*(Glop.width/2))+(40/Cartagen.zoom_level), y = Map.y-(1/Cartagen.zoom_level*(Glop.height/2))+(40/Cartagen.zoom_level)
		$C.begin_path()
			$C.line_to(x,y)
			$C.line_to(x,y+(Glop.height*Zoom.height)/Cartagen.zoom_level)
		$C.stroke()

		$C.opacity(0.9)
		$C.line_width(Zoom.width/Cartagen.zoom_level)
		$C.stroke_style('white')
		$C.line_cap('square')
		$C.begin_path()
			$C.line_to(x,y)
			$C.line_to(x,y+(Cartagen.zoom_level*Glop.height*Zoom.height)/Cartagen.zoom_level)
		$C.stroke()

		$C.restore()
		
	}
	
}

document.observe('cartagen:init', Zoom.initialize.bindAsEventListener(Zoom))