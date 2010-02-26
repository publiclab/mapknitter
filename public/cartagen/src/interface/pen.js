/**
 * @namespace The 'Pen' tool and associated methods.
 */
Tool.Pen = {
	/**
	 * The tool mode can be 'drawing' when the user is in the process of adding 
	 * points to the polygon, or 'inactive' when a polygon has not yet begun.
	 */
	mode: 'inactive',
	/**
	 * The polygon currently being drawn. 
	 */
	current_poly: null,
	activate: function() {
		$l('Pen activated')
	},
	deactivate: function() {
		$l('Pen deactivated')
	},
	mousedown: function() {
		
		if (Tool.Pen.mode == 'inactive') {
			$l('pen activated')
			
		} else if (Tool.Pen.mode == 'drawing') {
			$l('pen drawing')
		
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
		Tool.Pen.mode = 'inactive'
		// Did we end inside the first control point of the polygon?
		if (true) {
			// close the poly
			
		}
		// complete and store polygon
		
	}.bindAsEventListener(Tool.Pen)
}
