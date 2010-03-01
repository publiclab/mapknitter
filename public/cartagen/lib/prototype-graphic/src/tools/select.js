/*
Class: Graphic.SelectTool
	Select/Move tool.
	
	Register this tool to be able to move any shapes. 
	After a move, an event  shapeHasBeenMoved is sent with the moved shape as option.
  
  Author:
  	Sébastien Gruhier, <http://www.xilinus.com>

  License:
  	MIT-style license.

  See Also:
    <Tool>, <EventNotifier>
*/
Graphic.SelectTool = Class.create();
Object.extend(Graphic.SelectTool.prototype, Graphic.Tool.prototype);
Object.extend(Graphic.SelectTool.prototype, {
  initialize: function() {  
    this.renderer = null;
    this.shape    = null;
  },
  
  activate: function(manager) {
    this.renderer = manager.renderer;
  },
  
  unactivate: function(manager) {
    this.renderer = null;
  }, 
  
  initDrag: function(x, y, event) {
    this.shape = this.renderer.pick(event);    
    if (this.shape && this.shape.notSelectable)
      this.shape = null;
      
    if (this.shape) {
      this.shape.moveToFront();
      this.x = x;
      this.y = y;
      this.renderer.draw();
    }
  },
  
  drag: function(x, y, dx, dy, ddx, ddy, event) {    
    if (this.shape) {           
      this.shape.preTransform(Matrix.translate(ddx, ddy));  
      this.renderer.draw();
    }
  },
  
  endDrag: function(x, y, event) {
    if (this.shape) {
      EventNotifier.send(this, "shapeHasBeenMoved", {shape: this.shape, dx: x - this.x, dy: y - this.y});
      this.shape = null;
    }
  },
  
  mouseMove: function(x, y, event) {
  }
});
