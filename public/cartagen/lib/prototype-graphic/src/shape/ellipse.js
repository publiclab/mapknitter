/*
Class: Graphic.Ellipse
	Shape implementation of an ellipse.

  Author:
  	Sébastien Gruhier, <http://www.xilinus.com>

  License:
  	MIT-style license.

  See Also:
    <Shape>
*/
Graphic.Ellipse = Class.create();
Object.extend(Graphic.Ellipse.prototype, Graphic.Shape.prototype);
// Keep parent initialize
Graphic.Ellipse.prototype._shapeInitialize = Graphic.Shape.prototype.initialize;

Object.extend(Graphic.Ellipse.prototype, {
  initialize: function(renderer) {
    this._shapeInitialize(renderer, "ellipse");   
    Object.extend(this.attributes, {cx: 0, cy: 0, rx: 0, ry: 0})
    return this;
  },
  
  getSize: function() {
    return {w: 2 * this.attributes.rx, h: 2 * this.attributes.ry}
  },
  
  setSize: function(width, height) {
    var location = this.getLocation();
    this._setAttributes({rx: width/2, ry: height/2});  
    this.setLocation(location.x, location.y);
    return this;
  },
    
  getLocation: function() {
    return {x: this.attributes.cx - this.attributes.rx, y: this.attributes.cy - this.attributes.ry}
  },
  
  setLocation: function(x, y) { 
    this._setAttributes({cx: x + this.attributes.rx, cy: y + this.attributes.ry});
    return this;
  }
})
