/**
 * A class defining draggable points which describe a polygon; used in map warping/orthorectification workflows.
 * @class
 */
Warper.ControlPoint = Class.create({
	initialize: function(x,y,r,parent) {
		this.x = x
		this.y = y
		this.r = r
		this.rel_r = this.r / Map.zoom
		this.parent_shape = parent
		this.color = '#200'
		this.dragging = false
		// this.draw_handler = this.draw.bindAsEventListener(this)
		// Glop.observe('glop:postdraw', this.draw_handler)
		this.mousedown_handler = this.mousedown.bindAsEventListener(this)
		Glop.observe('mousedown', this.mousedown_handler)
	},
	// this gets called every frame:
	draw: function() {
		if (this.parent_shape.active) {
			$C.save()
				// go to the object's location:
				$C.translate(this.x,this.y)
				// draw the object:
				$C.fill_style(this.color)
				$C.opacity(0.6)
				$C.circ(0, 0, this.rel_r)
			$C.restore()
		}
	},
	update: function() {
		this.rel_r = this.r / Map.zoom
		
		if (this.parent_shape.active_point == this) {
			this.drag()
		}
	},
	// states of interaction
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
	mousedown: function() {
		if (this.is_inside()) {
			this.color = '#f00'
			// do stuff
			this.parent_shape.active_point = this
			this.parent_shape.old_coordinates = this.parent_shape.coordinates()
			if (Tool.Warp.mode == 'rotate') {
				this.self_angle = Math.atan2(this.parent_shape.centroid[1]-Map.pointer_y(),this.parent_shape.centroid[0]-Map.pointer_x())
				this.parent_shape.points.each(function(point) {
					point.angle = Math.atan2(point.y-this.parent_shape.centroid[1],point.x-this.parent_shape.centroid[0])
					point.distance = (point.x-this.parent_shape.centroid[0])/Math.cos(point.angle)
				},this)
			}
		}
	},
	/**
	 * Handles drags of control points. Behavior varies according to Tool.Warp.mode.
	 */
	drag: function() {
		// do stuff
		if (!Mouse.down) {
			this.cancel_drag()
			return
		}
		if (Tool.Warp.mode == 'default') {
			if (!this.dragging) {
				this.dragging = true
				this.drag_offset_x = Map.pointer_x() - this.x
				this.drag_offset_y = Map.pointer_y() - this.y
			}
			this.color = '#f00'
			this.x = Map.pointer_x() - this.drag_offset_x
			this.y = Map.pointer_y() - this.drag_offset_y
		} else if (Tool.Warp.mode == 'rotate') {
			// use this.centroid to rotate around a point
			var angle = Math.atan2(this.parent_shape.centroid[1]-Map.pointer_y(),this.parent_shape.centroid[0]-Map.pointer_x())
			var theta = angle-this.self_angle
			// use angle to recalculate each of the points in this.parent_shape.points
			this.parent_shape.points.each(function(point) {
				point.x = this.parent_shape.centroid[0]+Math.cos(point.angle+theta)*point.distance
				point.y = this.parent_shape.centroid[1]+Math.sin(point.angle+theta)*point.distance
			},this)
		} else if (Tool.Warp.mode == 'scale') {
			console.log('scale')	
		}
	},
	cancel_drag: function() {
		this.base()
		this.parent_shape.active_point = false
	}
})
