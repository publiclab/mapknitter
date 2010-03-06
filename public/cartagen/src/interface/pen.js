/**
 * @namespace The 'Pen' tool and associated methods.
 */
Tool.Pen = {
	/**
	 * The tool mode can be 'drawing' when the user is in the process of adding 
	 * points to the polygon, or 'inactive' when a polygon has not yet begun.
	 */
	mode: 'inactive', //'draw','inactive','drag'
	/**
	 * The polygon currently being drawn. 
	 */
	current_poly: null,
	drag: function() {
		$l('Pen dragging')
	},
	activate: function() {
		$l('Pen activated')
	},
	deactivate: function() {
		$l('Pen deactivated')
	},
	mousedown: function() {
		
		if (Tool.Pen.mode == 'inactive') {
			
		} else if (Tool.Pen.mode == 'draw') {
			console.log('pen drawing')
			shapes.last().new_point(Map.pointer_x(), Map.pointer_y())
			shapes.last().active = true
			
		}
		
	}.bindAsEventListener(Tool.Pen),
	mouseup: function() {
		$l('Pen mouseup')
	}.bindAsEventListener(Tool.Pen),
	mousemove: function() {
		$l('Pen mousemove')
	}.bindAsEventListener(Tool.Pen),
	dblclick: function() {
		$l('Pen dblclick')
		// Tool.Pen.mode = 'inactive'
		// Did we end inside the first control point of the polygon?
		if (true) {
			// close the poly
			Tool.Pen.mode = 'inactive'
			Tool.change('Warp')
		}
		// complete and store polygon
		
	}.bindAsEventListener(Tool.Pen)
}
