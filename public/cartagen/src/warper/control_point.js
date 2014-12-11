/**
 * A class defining draggable points which describe a polygon; used in map warping/orthorectification workflows.
 * @class
 */
Warper.ControlPoint = Class.create({
  type: 'Warper.ControlPoint',
  initialize: function(x,y,r,parent) {
    this.x = x
    this.y = y
    this.r = r
    this.rel_r = this.r / Map.zoom
    this.parent_shape = parent
    this.active = false
    this.dragging = false
  },
  // this gets called every frame:
  draw: function() {
    this.style()
    $C.save()
      $C.canvas.lineWidth = 3/Map.zoom
      // go to the object's location:
      $C.translate(this.x,this.y)
      // draw the object:
      $C.fill_style(this.color)
      $C.opacity(0.6)
      if (this.parent_shape.locked) {
        $C.begin_path()
        $C.move_to(-6/Map.zoom,-6/Map.zoom)
        $C.line_to(6/Map.zoom,6/Map.zoom)
        $C.move_to(-6/Map.zoom,6/Map.zoom)
        $C.line_to(6/Map.zoom,-6/Map.zoom)
        $C.stroke()
      } else {
        if (Tool.Warp.mode == "rotate") $C.stroke_style("red")
        if (this.is_inside()) $C.circ(0, 0, this.rel_r)
        $C.stroke_circ(0, 0, this.rel_r)
      }
    $C.restore()
  },
  select: function() {
    this.active = true
    this.parent_shape.active_point = this
  },
  deselect: function() {
    this.active = false
    this.parent_shape.active_point = false
  },
  style: function() {
    if (this.dragging) {
      this.color = '#f00'
    } else {
      this.color = '#200'
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
    return (Geometry.distance(this.x, this.y, Map.pointer_x(), Map.pointer_y()) < (this.r/Map.zoom))
  },
  mousedown: function() {
    if (!this.parent_shape.locked && this.is_inside()) {
      this.cancel_drag()
      this.color = '#f00'
      // do stuff
      this.parent_shape.active_point = this
      this.parent_shape.old_coordinates = this.parent_shape.coordinates()
      if (Tool.Warp.mode == 'rotate') {
        with (Math) {
          this.self_distance = sqrt(pow(this.parent_shape.centroid[1]-Map.pointer_y(),2)+pow(this.parent_shape.centroid[0]-Map.pointer_x(),2))
        }
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
  drag: function(translating_whole_image) {
    if (!this.parent_shape.locked) {
    // translation is possible in any tool:
    if (translating_whole_image || Tool.Warp.mode == 'default') {
      if (!this.dragging) {
        this.dragging = true
        this.drag_offset_x = Map.pointer_x() - this.x
        this.drag_offset_y = Map.pointer_y() - this.y
        if (Object.isUndefined(translating_whole_image)) $C.cursor('crosshair')
      }
      if (this.drag_offset_x) {
        this.x = Map.pointer_x() - this.drag_offset_x
        this.y = Map.pointer_y() - this.drag_offset_y
      }
    }

    if (Tool.Warp.mode == 'rotate' && Object.isUndefined(translating_whole_image)) {
      // don't translate if it's dragging a control point:
      this.dragging = false
      // use this.centroid to rotate around a point
      var distance = Math.sqrt(Math.pow(this.parent_shape.centroid[1]-Map.pointer_y(),2)+Math.pow(this.parent_shape.centroid[0]-Map.pointer_x(),2))
      var distance_change = distance - this.self_distance
      var angle = Math.atan2(this.parent_shape.centroid[1]-Map.pointer_y(),this.parent_shape.centroid[0]-Map.pointer_x())
      var angle_change = angle-this.self_angle

      if (Keyboard.shift) angle_change = 0 
      // use angle to recalculate each of the points in this.parent_shape.points
      this.parent_shape.points.each(function(point) {
        point.x = this.parent_shape.centroid[0]+Math.cos(point.angle+angle_change)*(point.distance+distance_change)
        point.y = this.parent_shape.centroid[1]+Math.sin(point.angle+angle_change)*(point.distance+distance_change)
      },this)
    }
    }
  },
  cancel_drag: function() {
    this.dragging = false
    this.drag_offset_x = false
    this.drag_offset_y = false
    this.parent_shape.active_point = false
    this.parent_shape.reset_centroid()
  }
})
