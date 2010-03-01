/*
Class: Graphic.Polygon
	Shape implementation of a polygon.

  Author:
  	Sébastien Gruhier, <http://www.xilinus.com>

  License:
  	MIT-style license.

  See Also:
    <Shape>
*/
Graphic.Polygon = Class.create();
Object.extend(Graphic.Polygon.prototype, Graphic.Polyline.prototype);
// Keep parent initialize
Graphic.Polygon.prototype._polylineInitialize = Graphic.Polyline.prototype.initialize;

Object.extend(Graphic.Polygon.prototype, {
  initialize: function(renderer) {
    this._polylineInitialize(renderer, "polygon");
    return this;
  }
})
