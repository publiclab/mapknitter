/**
 * A class defining draggable points which describe a polygon; used in map warping/orthorectification workflows.
 * @class
 */
Warper.ControlPoint = Class.create({
	initialize: function(x,y,r,parent) {
		this.x = x
		this.y = y
		this.r = r
		this.parent_shape = parent
		this.color = '#200'
		this.dragging = false
		this.draw_handler = this.draw.bindAsEventListener(this)
		Glop.observe('glop:postdraw', this.draw_handler)
		Glop.observe('mousedown', this.click.bindAsEventListener(this))
	},
	// this gets called every frame:
	draw: function() {
		// transform to 1:1 scale pixelwise (the map is not at this scale by default)
		// first, save the transformation matrix:
		if (this.parent_shape.active) {
			$C.save()
		
				// go to the object's location:
				$C.translate(this.x,this.y)
					// draw the object:
					$C.fill_style(this.color)
					$C.opacity(0.6)
					$C.rect(-this.r/2,-this.r/2,this.r,this.r)
			$C.restore()
		}
		
		if (this.dragging && Mouse.down) {
			this.drag()
		} else if (Geometry.distance(this.x, this.y, Map.pointer_x(), Map.pointer_y()) < this.r) {
			if (Mouse.down) {
				this.drag()
			} else {
				this.hover()
			}
		} else {
			this.base()
		}
	},
	base: function() {
		// do stuff
		this.color = '#200'
		this.dragging = false
	},
	/**
	 * Returns true if the mouse is inside this control point
	 */
	is_inside: function() {
		return (Geometry.distance(this.x, this.y, Map.pointer_x(), Map.pointer_y()) < this.r)
	},
	click: function() {
		if (this.is_inside()) {
			this.color = '#f00'
			// do stuff
			console.log('clicked control point')
			this.parent_shape.active = true
		}
	},
	hover: function() {
		// do stuff
		this.color = '#900'
		this.dragging = false
	},
	drag: function() {
		if (this.parent_shape.active) {
			// do stuff
			if (!this.dragging) {
				this.dragging = true
				this.drag_offset_x = Map.pointer_x() - this.x
				this.drag_offset_y = Map.pointer_y() - this.y
			}
			this.color = '#f00'
			this.x = Map.pointer_x() - this.drag_offset_x
			this.y = Map.pointer_y() - this.drag_offset_y
			// update old_coordinates: if we manage drag events better and get a 'mouseup' we can do this only then
			// right now it's inefficient.
			this.parent_shape.old_coordinates = this.parent_shape.coordinates()
		}
	},
	r: function() {
		// do stuff
		this.color = '#00f'
	}
})
