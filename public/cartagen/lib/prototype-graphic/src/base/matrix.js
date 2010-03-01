/*
Class: Matrix
	2D Matrix operation used for geometric transform of any shape.
	
  Author:
  	Sébastien Gruhier, <http://www.xilinus.com>

  License:
  	MIT-style license.
*/
Matrix = Class.create();  

// Group: Class Methods
Object.extend(Matrix, {
  /*
    Function: multiply
      Multiply 2 matrix
      
    Parameters:
      left -  Left matrix
      right -  Right matrix
      
    Returns:
      A new matrix result of left multiply by right
  */
  multiply: function(left, right) { 
    var matrices;
    if (left instanceof Array) 
      matrices = left;    
      else 
    matrices = [left, right];
		var matrix = matrices[0];
		for(var i = 1; i < matrices.length; ++i){
			var left = matrix;
			var right = matrices[i];
			matrix = new Matrix();
  		matrix.xx = left.xx * right.xx + left.xy * right.yx;
  		matrix.xy = left.xx * right.xy + left.xy * right.yy;
  		matrix.yx = left.yx * right.xx + left.yy * right.yx;
  		matrix.yy = left.yx * right.xy + left.yy * right.yy;
  		matrix.dx = left.xx * right.dx + left.xy * right.dy + left.dx;
  		matrix.dy = left.yx * right.dx + left.yy * right.dy + left.dy;
		}
    
    return matrix;
  },                
  
  /*
    Function: translate
      Create a translation matrix
      
    Parameters:
      x -  X translation value
      y -  Y translation value
      
    Returns:
      A new matrix 
  */
  translate: function(x, y) {
    return new Matrix({dx: x, dy: y});
  },

  /*
    Function: rotate
      Create a rotate matrix
      
    Parameters:
      a -  angle in degree
      
    Returns:
      A new matrix 
  */
  rotate: function(angle) {
    var c = Math.cos(degToRad(angle));
  	var s = Math.sin(degToRad(angle));
    return new Matrix({xx:c, xy:s, yx:-s, yy:c});    
  },

  /*
    Function: scale
      Create a scale matrix
      
    Parameters:
      sx -  x scale factor
      sy -  y scale factor (default sy = sx)
      
    Returns:
      A new matrix 
  */
  scale: function(sx, sy) {
    sy = sy || sx;
    return new Matrix({xx:sx, yy:sy});    
  },
     
  
  skewX:function (angle) {
  	return new Matrix({xy:Math.tan(degToRad(angle))});
	},
	
  skewY:function (angle) {
  	return new Matrix({yx:Math.tan(-degToRad(angle))});
	},
	
  /*
    Function: rotateAt
      Create a rotate matrix at a specific rotation center
      
    Parameters:
      a -  angle in degree
      x - X coordinate of rotation center
      y - Y coordinate of rotation center
    Returns:
      A new matrix 
  */
  rotateAt: function(angle, x, y) {
    return Matrix.multiply([Matrix.translate(x, y), Matrix.rotate(angle), Matrix.translate(-x, -y)])
  },
  
  /*
    Function: scaleAt
      Create a scale matrix at a specific center
      
    Parameters:
      sx - x scale factor
      sy - y scale factor 
      x  - X coordinate of scale center
      y  - Y coordinate of scale center
    Returns:
      A new matrix 
  */
  scaleAt: function(sx, sy, x, y) {
    return Matrix.multiply([Matrix.translate(x, y), Matrix.scale(sx, sy), Matrix.translate(-x, -y)])
  },
  
  /*
    Function: invert
      Inverts a matrix
      
    Parameters:
      matrix -  matrix to invert

    Returns:
      A new matrix 
  */
  invert: function(matrix) {
    var m = matrix;
    var D = m.xx * m.yy - m.xy * m.yx;
    return new Matrix({xx: m.yy/D, xy: -m.xy/D, yx: -m.yx/D, yy: m.xx/D, dx: (m.yx * m.dy - m.yy * m.dx) / D, dy: (m.xy * m.dx - m.xx * m.dy) / D	});
  }
  
})

// Group: Instance Methods
Object.extend(Matrix.prototype, {
  /*
    Function: initialize
      Constructor. Creates a identity matrix by default
      
    Parameters:
      values - Hash tables with matrix values: keys are xx, xy, yx, yy, dx, dy
      
    Returns:
      A new matrix 
  */
  initialize: function(values) {    
    Object.extend(Object.extend(this, {xx:1 , xy: 0, yx: 0, yy: 1, dx: 0, dy:0 }), values || {});
    return this;
  },
  
	
  /*
    Function: mutliplyRight
      Multiply this matrix by another one to the right (this * matrix)
      
    Parameters:
      matrix -  Right matrix
      
    Returns:
      this 
  */
  multiplyRight: function(matrix) {
    var matrix = Matrix.multiply(this, matrix);
    this._affectValues(matrix);
  	return this;
  },
  
  /*
    Function: mutliplyLeft
      Multiply this matrix by another one to the left (matrix * this)
      
    Parameters:
      matrix -  Left matrix
      
    Returns:
      this 
  */
  multiplyLeft: function(matrix) {
    var matrix = Matrix.multiply(matrix, this);
    this._affectValues(matrix);
  	return this;
  },
    
  /*
    Function: multiplyPoint
      Multiply a point 
      
    Parameters:
      x -  x coordinate
      y -  y coordinate
      
    Returns:
      {x:, y:}  
      
    TODO: unit test
  */
  multiplyPoint: function(x, y) {
		return {x: this.xx * x + this.xy * y + this.dx, y: this.yx * x + this.yy * y + this.dy}; 
  },
	
  /*
    Function: multiplyBounds
      Multiply a bound area (x, y, w, h) 
      
    Parameters:
      bounds - has table {x:, y:, w:, h:}
      
    Returns:
      {x:, y:, w:, h:} 
      
    TODO: unit test
  */
	multiplyBounds: function(bounds) {
	  var pt1 = this.multiplyPoint(bounds.x, bounds.y);
	  var pt2 = this.multiplyPoint(bounds.x + bounds.w, bounds.y);
	  var pt3 = this.multiplyPoint(bounds.x, bounds.y + bounds.h);
	  var pt4 = this.multiplyPoint(bounds.x + bounds.w, bounds.y + bounds.h);
	  
	  var xmin = Math.min(Math.min(pt1.x, pt2.x), Math.min(pt3.x, pt4.x));
	  var ymin = Math.min(Math.min(pt1.y, pt2.y), Math.min(pt3.y, pt4.y));
	  var xmax = Math.max(Math.max(pt1.x, pt2.x), Math.max(pt3.x, pt4.x));
	  var ymax = Math.max(Math.max(pt1.y, pt2.y), Math.max(pt3.y, pt4.y));
	  
	  return {x: xmin, y:ymin, w: xmax - xmin, h: ymax - ymin};
	},
	
  /*
    Function: values
      Gets matrix values (xx, yx, xy, yy, dx, dy)
      
    Returns:
      An array of 6 float values: xx, yx, xy, yy, dx, dy
  */
  values: function() {
    return $A([this.xx, this.yx, this.xy, this.yy, this.dx, this.dy]);
  },
   
  /*
    Function: setValues
      Sets matrix values (xx, yx, xy, yy, dx, dy) with an array
      
    Parameters:
      array- An array of 6 float values: xx, yx, xy, yy, dx, dy
      
    Returns:
      this
  */
  setValues: function(array) {
    this.xx = parseFloat(array[0]);
    this.yx = parseFloat(array[1]);
    this.xy = parseFloat(array[2]);
    this.yy = parseFloat(array[3]);
    this.dx = parseFloat(array[4]);
    this.dy = parseFloat(array[5]);
    
    return this;
  },
  
  /*
    Function: hashValues
      Gets matrix values (xx, xy, yx, yy, dx, dy)
      
    Returns:
      An hash table {xx: , xy: , yx: , yy: , dx: , dy: };
  */
  hashValues: function() {
    return $H({xx: this.xx , xy: this.xy, yx: this.yx, yy: this.yy, dx: this.dx, dy: this.dy});
  },
  
  toString: function() {
    return Object.inspect(this.hashValues());
  },        
  
  toJSON: function() { 
    return this.hashValues().toJSON();
  },
  
  // Private function to affect values from another matrix
  _affectValues: function(matrix) {
    Object.extend(this, matrix);
    return this;
  }
});
