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
			var over_point = false
			shapes.last().points.each(function(point){
				if (point.mouse_inside()) over_point = true
			})
			if (!over_point) { // if you didn't click on an existing node
				shapes.last().new_point(Map.pointer_x(), Map.pointer_y())
				shapes.last().active = true
			}
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
			Tool.change('Pan')
		}
		// complete and store polygon
		
	}.bindAsEventListener(Tool.Pen),
	//Tool.Pen.Shape
	Shape: Class.create({
		
	}),
	//Tool.Pen.Point
	Point: Class.create({
		
	}),
	new_shape: function() {
		
	}
}
