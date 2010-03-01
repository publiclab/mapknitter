/*
Class: Graphic.Line
	Shape implementation of a line.

  Author:
  	Sébastien Gruhier, <http://www.xilinus.com>

  License:
  	MIT-style license.

  See Also:
    <Shape>
*/
Graphic.Line = Class.create();
Object.extend(Graphic.Line.prototype, Graphic.Shape.prototype);
// Keep parent initialize
Graphic.Line.prototype._parentInitialize = Graphic.Shape.prototype.initialize;

Object.extend(Graphic.Line.prototype, {
  initialize: function(renderer) {
    this._parentInitialize(renderer, "line");
    return this;
  },
  
  getSize: function() {    
    return {w: Math.abs(this.attributes.x1 - this.attributes.x2), h: Math.abs(this.attributes.y1 - this.attributes.y2)}
  },
  
  setSize: function(width, height) {     
    // this._setAttributes({width: width, height: height});
    return this;
  },
    
  getLocation: function() {
    return {x: Math.min(this.attributes.x1, this.attributes.x2), y: Math.min(this.attributes.y1, this.attributes.y2)}
  },
  
  setLocation: function(x, y) {
    // this._setAttributes({x: x, y: y});
    return this;
  },
  
  setPoints: function(x1, y1, x2, y2) {
    this._setAttributes({x1: x1, y1: y1, x2: x2, y2: y2})
    return this;
  }, 
  
  getPoint: function(index) {
    if (index == 0)
      return {x: this.attributes.x1, y:this.attributes.y1}
    else
      return {x: this.attributes.x2, y:this.attributes.y2}
  }
})
