/**
 * @namespace The 'Warp' tool and associated methods.
 */
Tool.Warp = {
	/**
	 * 
	 */
	drag: function() {
		
	},
	mousedown: function() {
		$l('Warp mousedown')
		
	}.bindAsEventListener(Tool.Warp),
	mouseup: function() {
		$l('Warp mouseup')
		
	}.bindAsEventListener(Tool.Warp),
	mousemove: function() {
		$l('Warp mousemove')
		
	}.bindAsEventListener(Tool.Warp),
	dblclick: function() {
		$l('Warp dblclick')
				
	}.bindAsEventListener(Tool.Warp)	
}