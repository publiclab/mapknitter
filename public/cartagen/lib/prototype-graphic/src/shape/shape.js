/*
Class: Graphic.Shape
	Abstract class for vectorial shapes. Must be used for new shape definition.
	
	Any shape must be used by a renderer.
	
  Author:
  	Sébastien Gruhier, <http://www.xilinus.com>

  License:
  	MIT-style license.
*/
Graphic.Shape = Class.create();
Object.extend(Graphic.Shape.prototype, {
  // Group: Implemented Functions

  /*
    Function: initialize
      Constructor. Creates a new shape.
      
    Parameters:
      renderer - Renderer used to display this shape 
      nodeName - Node name (not linked to any renderer), like rect, ellipse ...
      
    Returns:
      A new shape object 
  */
  initialize: function(renderer, nodeName) {
    this.attributes = {};
    this.renderer = renderer;
    this.nodeName = nodeName;
    this.element = renderer.createShape(this);     
    if (this.element) 
      this.element.shape = this;

    // Identity by default
    this.setMatrix(new Matrix()); 
    
    // No stroke, no fill by default  
    this.setStroke(null);
    this.setFill(null);
    return this;
  },
  
  /*
    Function: destroy
      Destructor. 
  */
  destroy: function() {
    this.renderer.remove(this);
  },
  
  /*
    Function: getType
      Gets node type ( = node name)
      
    Returns:
      Node name string
  */
  getType: function() {
    return this.nodeName;
  },
  
  /*
    Function: setID
      Sets shape ID

    Parameters:
      id - Shape id value
      
    Returns:
      this
  */
  setID: function(id) {
    this._setAttribute("id", id, true); 
    return this;
  },

  /*
    Function: getID
      Gets node ID
      
    Returns:
      ID string
  */
  getID: function() {
     return this.attributes.id;
  },
  
  /*
    Function: setClassName
      Sets shape class name

    Parameters:
      className - Shape class name value
      
    Returns:
      this
  */
  setClassName: function(className) {
    this._setAttribute("class", className, true);  
    return this;
  },

  /*
    Function: getClassName
      Gets shape class name
      
    Returns:
      Shape class name string
  */
  getClassName: function() {
     return this.attributes["class"];
  },
  
  /*
    Function: show
      Sets shape visible

    Returns:
      this
  */
  show: function() {
    this.renderer.show(this);
    return this;
  },
  
  /*
    Function: hide
      Sets shape invisible

    Returns:
      this
  */
  hide: function() {
    this.renderer.hide(this);
    return this;
  },
  
  /*
    Function: setFill
      Sets fill attributes. Currently it could be
      - null or  attributes.fill == "none" for no filling
      - an hash of 4 keys {r:, g:, b:, a:}
      - a string : rgb(r,g,b,a) 
   
    Parameters:
      attributes: fill attributes (see above for details)
      
    Returns:
      this
  */
  setFill: function(attributes) {
    // No fill
    if(!attributes || attributes.fill == "none"){
			this._setAttribute("fill", "none");
			this._setAttribute("fill-opacity", 0);
		}
		// Handle just {r:RRR, g:GGG, b:BBB, a:AAA} right now with 0 <= value <= 255, alpha is optional (default 255)
		else if (typeof attributes.r != "undefined"){
		  this._setAttribute("fill", "rgb(" + parseInt(attributes.r) + "," + parseInt(attributes.g) + "," + parseInt(attributes.b) + ")");
		  this._setAttribute("fill-opacity", (attributes.a || 255)/255.0);
		} 
    return this;
  },
  
  /*
    Function: getFill
      Gets fill attributes

    Returns:
      a string : rgb(r,g,b) or none
  */
  getFill: function() {
    return this.attributes.fill;
  },

  /*
    Function: getFillOpacity
      Gets fill opacity attribute

    Returns:
      a float [0..1]
  */
  getFillOpacity: function() {
     return this.attributes["fill-opacity"];
  },
  
  /*
    Function: setStroke
      Sets stroke attributes. Currently it could be
      - null or  attributes.fill == "none" for no filling
      - an hash of 4 keys {r:, g:, b:, a:, w:} w is stroke width
      - a string : rgb(r,g,b,a, w) 
   
    Parameters:
      attributes: stroke attributes (see above for details)  
      
    Returns:
      this
  */
  setStroke: function(attributes) {
		// No stroke
		if(!attributes || attributes.stroke == "none"){
			this._setAttribute("stroke", "none");
			this._setAttribute("stroke-opacity", 0);
			this._setAttribute("stroke-width", 0);
		} 
		// Handle just {r:RRR, g:GGG, b:BBB, a:AAA} right now with 0 <= value <= 255, alpha is optional (default 255)
		else if (typeof attributes.r != "undefined"){
		  this._setAttribute("stroke", "rgb(" + parseInt(attributes.r) + "," + parseInt(attributes.g) + "," + parseInt(attributes.b) + ")");
		  this._setAttribute("stroke-opacity", (attributes.a || 255)/255.0);  
			this._setAttribute("stroke-width", (attributes.w || 1));
		}
		return this;
	},
  
  /*
    Function: setStrokeWidth
      Sets stroke width attribute
      
    Parameters:
      w: width in pixels  
      
    Returns:
      this
  */
	setStrokeWidth : function(w){
	  this._setAttribute("stroke-width", (w || 1));   
	  return this;
	},	
	
  /*
    Function: setStrokeOpacity
      Sets stroke opacity attribute
      
    Parameters:
      a: opacity [0..255]
      
    Returns:
      this
  */
	setStrokeOpacity : function(a){
    this._setAttribute("stroke-opacity", (a || 255) / 255.0);  
	  return this;
	},
	
  /*
    Function: setStrokeColor
      Sets stroke color attributes
      
    Parameters:
      r: red   [0..255]
      g: green [0..255]
      b: blue  [0..255]
      
    Returns:
      this
  */
	setStrokeColor : function(r,g,b){
    this._setAttribute("stroke", "rgb(" + parseInt(r) + "," + parseInt(g) + "," + parseInt(b) + ")");
 	  return this;
	},
	
	/*
    Function: getStroke
      Gets stroke attributes

    Returns:
      a string : rgb(r,g,b) or none
  */
  getStroke: function() {
    return this.attributes.stroke;
  },
  
  /*
    Function: getStrokeOpacity
      Gets stroke opacity attribute

    Returns:
      a float [0..1]
  */
  getStrokeOpacity: function() {
     return this.attributes["stroke-opacity"];
  },
  
  /*
    Function: getStrokeWidth
      Gets stroke width attribute

    Returns:
      a float 
  */
  getStrokeWidth: function() {
     return this.attributes["stroke-width"];
  },
  
  /*
    Function: setAntialiasing
      Sets antialiasing on or off
      
    Parameters:
     on - boolean, true for activating antialiasing

    Returns:
      this
  */
  setAntialiasing: function(on) {
    if (on)
      this._setAttribute("shape-rendering","auto");
    else
      this._setAttribute("shape-rendering","crispEdges");
      
    return this;
  },
      
  /*
    Function: getAntialiasing
      Gets antialiasing value
      
     Returns:
      true/false
  */
  getAntialiasing: function() {
    return this.attributes["shape-rendering"] == "auto";
  },
      
  /*
    Function: setBounds
      Sets shape bounds (it calls setSize and setLocation)
      
    Parameters:
      x - shape X corner
      y - shape Y corner
      w - shape width 
      h - shape height

    Returns:
      this
  */
  setBounds: function(x, y, w, h) {
    this.setLocation(x, y);
    this.setSize(w, h);
    
    return this;
  },
  
  /*
    Function: getBounds
      Gets object bounds 
      
    Returns:
      An hash table {x:, y:, w:, h:}
  */
  getBounds: function() {
    return Object.extend(this.getSize(), this.getLocation());    
  },

  /*
    Function: moveToFront
      Moves this shape above all others

    Returns:
      this
  */
  moveToFront: function() {
    if (this.renderer) 
      this.renderer.moveToFront(this);
    
    return this;
  }, 
    
  /*
    Function: rotate
      Rotates shape (by default rotation center = shape center)
      
    Parameters:
      angle - Angle in degree
      rx - rotation center X value (default shape center)
      ry - rotation center Y value (default shape center)

    Returns:
      this
  */
  rotate: function(angle, rx, ry) {
    var bounds = this.getBounds();
    if (typeof rx == "undefined")
      rx = bounds.x + (bounds.w / 2);

    if (typeof ry == "undefined")
      ry = bounds.y + (bounds.h / 2); 
    
    this.postTransform(Matrix.translate(rx, ry));
    this.postTransform(Matrix.rotate(angle));
    this.postTransform(Matrix.translate(-rx, -ry));

    return this;
  },
  
  /*
    Function: translate
      Translates shape 
      
    Parameters:
      tx - X value 
      ty - Y value

    Returns:
      this
  */
  translate: function(tx, ty) { 
    return this.postTransform(Matrix.translate(tx, ty));
  },


  /*
    Function: scale
      Scales shape 
      
    Parameters:
      sx - sx scale factor 
      sy - sy scale factor 
      cy - scale center X value (default current CTM center)
      cy - scale center Y value (default current CTM center)
    Returns:
      this
  */
  scale: function(sx, sy, cx, cy) { 
    if (cx)
      this.postTransform(Matrix.translate(cx, cy));
    this.postTransform(Matrix.scale(sx, sy));
    if (cx)
      this.postTransform(Matrix.translate(-cx, -cy));
    return this
  },

  /*
    Function: postTransform
      Add a transformation "after" the current CTM
      
    Parameters:
      matrix - matrix to post transform 

    Returns:
      this
  */
  postTransform: function(matrix) {
    this.matrix.multiplyRight(matrix)
    this.inverseMatrix.multiplyLeft(Matrix.invert(matrix));
    this._updateTransform();

    return this;
  },

  /*
    Function: preTransform
      Add a transformation "before" the current CTM
      
    Parameters:
      matrix - matrix to pre transform 

    Returns:
      this
  */
  preTransform: function(matrix) {    
    this.matrix.multiplyLeft(matrix)
    this.inverseMatrix.multiplyRight(Matrix.invert(matrix));
    this._updateTransform();

    return this;
  },
  
  /*
    Function: setMatrix
      Sets CTM (current transformation matrix)
      
    Parameters:
      matrix - new shape CTM
    Returns:
      this      
  */
  setMatrix: function(matrix, inverse) {  
    this.matrix = new Matrix(matrix);
    this.inverseMatrix = inverse || Matrix.invert(this.matrix); 
    this._updateTransform();        
                                          
    return this;
  },  

  /*
    Function: getMatrix
      Gets CTM (current transformation matrix)
      
    Returns:
      An matrix object  
  */
  getMatrix: function() {
    return this.matrix;
  },   
   
  /*
    Function: getInverseMatrix
      Gets inverse CTM (current transformation matrix)
      
    Returns:
      An matrix object  
  */
  getInverseMatrix: function() {
    return this.inverseMatrix;
  },    

  /*
    Function: getRendererObject
      Gets renderer object link to this shape
      
    Returns:
      An object 
  */
  getRendererObject: function() { 
    return this.element;
  },
  
     
  // Group: Abstract Functions
  // Those functions have to be overriden by any shapes. 
  /*
    Function: getSize
      Gets object size

    Returns:
      An hash table {w:, h:}
  */
  getSize: function() {   
    console.log("getSize")
    throw Graphic.functionMustBeOverriden;    
  },

  /*
    Function: setSize
      Sets object size

    Parameters:
      width: shape width
      height: shape height
      
    Returns:
      this
  */
  setSize: function(width, height) {
    console.log("setSize")
    throw Graphic.functionMustBeOverriden;    
  },
  
  /*
    Function: getLocation
      Gets object location

      Returns:
        An hash table {x:, y:}
  */
  getLocation: function() {
    console.log("getLocation")
    throw Graphic.functionMustBeOverriden;    
  },

  /*
    Function: setLocation
      Sets object location

    Parameters:
      x: shape x value
      y: shape y value
      
    Returns:
      this
  */
  setLocation: function(x, y) {
    console.log("setLocation") 
    throw Graphic.functionMustBeOverriden;    
  },      
  
  addComment: function(commentText) { 
	  var commentNode = this.renderer.addComment(this, commentText);
	  return this;
  },

  // Private function for settings attributes and calls renderer updateAttributes function
  _setAttributes: function(attributes) {
    this.attributes = Object.extend(this.attributes, attributes || {});
    this.renderer.updateAttributes(this, attributes);
    return this;
  },

  _setAttribute: function(name, value) {
    var hash = {}
    hash[name] = value;
    this._setAttributes(hash);
    return this;
  },
  
  _updateTransform: function() {
    this._setAttributes({matrix: this.matrix.values().join(","), invmatrix: this.inverseMatrix.values().join(",")}); 
    this.renderer.updateTransform(this);
  }
})
