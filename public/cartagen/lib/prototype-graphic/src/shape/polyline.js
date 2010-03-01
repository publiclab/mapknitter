/*
Class: Graphic.Polyline
	Shape implementation of a Polyline.

  Author:
  	Sébastien Gruhier, <http://www.xilinus.com>

  License:
  	MIT-style license.

  See Also:
    <Shape>
*/
Graphic.Polyline = Class.create();
Object.extend(Graphic.Polyline.prototype, Graphic.Shape.prototype);
// Keep parent initialize
Graphic.Polyline.prototype._parentInitialize = Graphic.Shape.prototype.initialize;

Object.extend(Graphic.Polyline.prototype, {
  initialize: function(renderer, type) {  
    this._parentInitialize(renderer, type || "polyline");
    Object.extend(this.attributes, {x:0, y:0, w:0, h:0});

    this.points = new Array();
    return this;
  },
  
  addPoints: function(points) {
    points.each(function(p) {this.points.push([p[0], p[1]])}.bind(this));
    this._updatePath();
    return this;
  },
   
  setPoints: function(points) {
    this.points.clear();
    this.addPoints(points)
    return this;
  },
   
  setPoint: function(x, y, index) {  
    if (index < this.points.length) {
      this.points[index][0] = x;      
      this.points[index][1] = y;      
       this._updatePath();
    }
    return this;
  },
   
  addPoint: function(x, y) {
    this.points.push([x, y]);
    this._updatePath();
    return this;
  },
   
  getPoints: function() {
    return this.points;
  },
  
  getPoint: function(index) {
    return {x: this.points[index][0], y: this.points[index][1]};
  },
  
  getNbPoints: function() {
    return this.points.length;
  },
  
  // From shape
  setSize: function(width, height) {
    var x0 = this.x;
    var y0 = this.y;
    var fx = width / this.w;
    var fy = height / this.h;
    this.points.each(function(p) { 
      p[0] = (p[0] - this.x) * fx + this.x;
      p[1] = (p[1] - this.y) * fy + this.y;
    }.bind(this));
    this._updatePath();
    return this;
  },

  getSize: function() {
    return {w: this.w, h: this.h}
  },
  
  setLocation: function(x, y) {
    var dx = x - this.x;
    var dy = y - this.y;
    this.points.each(function(p) { 
      p[0] += dx;
      p[1] += dy;
    });
    this._updatePath();
    return this;
  },

  getLocation: function() {
    return {x: this.x, y: this.y}
  },

  // Private functions
  _updateBounds: function() {
    var xmin = 0, ymin = 0, xmax = 0, ymax = 0;
    if (this.points.length > 0) {
      var xmin = parseFloat(this.points[0][0]), ymin = parseFloat(this.points[0][1]),
          xmax = parseFloat(this.points[0][0]), ymax = parseFloat(this.points[0][1]);
      xmin = parseFloat(xmin);
      this.points.each(function(p) { 
        p[0] = parseFloat(p[0]);
        p[1] = parseFloat(p[1]);
        if (p[0] < xmin) xmin = p[0];
        if (p[0] > xmax) xmax = p[0];
        if (p[1] < ymin) ymin = p[1];
        if (p[1] > ymax) ymax = p[1];     
      });
      
      this.x = xmin;
      this.y = ymin;
      this.w = xmax - xmin;
      this.h = ymax - ymin;
    }
    else {
      this.x = 0;
      this.y = 0;
      this.w = 0;
      this.h = 0;
    };    
  },
  
  _updatePath: function() {
    // Converts points into SVG path
    var path = "";
    this.points.each(function(p) { path += p[0] + " " + p[1] + ","});
    path = path.slice(0, path.length-1);

    this._updateBounds();
    this._setAttribute("points", path);
  }
})
