/*
Class: Graphic.Circle
	Shape implementation of a circle.

  Author:
  	Sébastien Gruhier, <http://www.xilinus.com>

  License:
  	MIT-style license.

  See Also:
    <Shape>
*/
Graphic.Circle = Class.create();
Object.extend(Graphic.Circle.prototype, Graphic.Shape.prototype);
// Keep parent initialize
Graphic.Circle.prototype._parentInitialize = Graphic.Shape.prototype.initialize;

Object.extend(Graphic.Circle.prototype, {
  initialize: function(renderer) {    
    this._parentInitialize(renderer, "circle");
    Object.extend(this.attributes, {cx: 0, cy: 0, r: 0})
    return this;
  },

  getSize: function() {
    return {w: 2 * this.attributes.r, h: 2 * this.attributes.r}
  },
  
  setSize: function(width, height) {
    var location = this.getLocation();
    this._setAttributes({r:  Math.max(width, height)/2});
    this.setLocation(location.x, location.y);
    return this;
  },
    
  getLocation: function() {
    return {x: this.attributes.cx - this.attributes.r, y: this.attributes.cy - this.attributes.r}
  },
  
  setLocation: function(x, y) { 
    this._setAttributes({cx: x + this.attributes.r, cy: y + this.attributes.r});
    return this;
  },
  
  setCenter: function(cx, cy) {
    this._setAttributes({cx: cx, cy: cy});
    return this;
  },

  getCenter: function() {
    return {cx: this.attributes.cx, cy: this.attributes.cy};
  },

  setRadius: function(r) {
    this._setAttributes({r: r});
    return this;
  },
  
  getRadius: function() {
    return this.attributes.r;
  }
  
})
