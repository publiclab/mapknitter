/**
 * A class defining draggable points which describe a polygon; used in map warping/orthorectification workflows.
 * @class
 */
Warper.ControlPoint = Class.create({
	initialize: function(x,y) {
		//
		this.selected = true
		this.x = x
		this.y = y
	},
	drag: function() {
		console.log('CP dragging')
	},
	click: function() {
		console.log('CP clicked')
	}.bindAsEventListener(Glop),
	/**
	 * Called every frame from Cartagen.draw 
	 */
	draw: function() {
		
		
		
	}
})