/*
Class: Graphic.DrawingTool
	Drawing tool.
	
	Register this tool to be able to move any shapes. 
	After a move, an event  shapeHasBeenMoved is sent with the moved shape as option.
  
  Author:
  	Sébastien Gruhier, <http://www.xilinus.com>

  License:
  	MIT-style license.

  See Also:
    <Tool>, <EventNotifier>
*/
Graphic.DrawingTool = Class.create();
Object.extend(Graphic.DrawingTool.prototype, Graphic.Tool.prototype);
Object.extend(Graphic.DrawingTool.prototype, {
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
    this.polyline =  new Graphic.Polyline(this.renderer); 
    this.polyline.setStroke(this._randomStroke());
    this.polyline.addPoint(x, y); 
    
    this.renderer.add(this.polyline)
    this.renderer.draw();
  },
  
  drag: function(x, y, dx, dy, ddx, ddy, event) {    
    if (this.polyline) {           
      this.polyline.addPoint(x, y); 
      this.renderer.draw();
    }
  },
  
  endDrag: function(x, y, event) {
    if (this.polyline) {
      this.polyline = null;
    }
  },
  
  mouseMove: function(x, y, event) {
  },
  
  _randomStroke: function() {
    var r = Math.floor(255 * Math.random());
    var g = Math.floor(255 * Math.random());
    var b = Math.floor(255 * Math.random());
    var a = 128 + Math.floor(128 * Math.random()); 
    var w = 5 + Math.floor(5 * Math.random());
    return  {r: r, g: g, b: b, a: a, w: w}
  }
});
