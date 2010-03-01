/*
Class: Graphic.CanvasRenderer
	Canvas Renderer Class
	
	This class implements all Graphic.AbstractRender functions.
	
  See Also:
   <AbstractRender>

  Author:
 	Sébastien Gruhier, <http://www.xilinus.com>
*/


//
// Graphic.CanvasRenderer render class. 
//
Graphic.CanvasRenderer = Class.create();
Object.extend(Graphic.CanvasRenderer.prototype, Graphic.AbstractRender.prototype);

// Keep parent initialize
Graphic.CanvasRenderer.prototype._parentInitialize = Graphic.AbstractRender.prototype.initialize;
Graphic.CanvasRenderer.prototype._parentSetSize = Graphic.AbstractRender.prototype.setSize; 
 
Object.extend(Graphic.CanvasRenderer.prototype, {
  initialize: function(element) {
    this._parentInitialize(element);
   
    this.element = document.createElement("canvas");

    this.element.setAttribute("width", this.bounds.w);
    this.element.setAttribute("height", this.bounds.h);
    
    this.element.shape = this;
    $(element).appendChild(this.element);
    
    this.context = this.element.getContext("2d");
    // Node lists
    this.nodes = new Array();
    this.offset = Position.cumulativeOffset(this.element.parentNode);
  },

  destroy: function() {  
    this.nodes.clear();
    this.element.parentNode.removeChild(this.element);    
  },
    
  setSize: function(width, height) { 
    this._parentSetSize(width, height);
    this.element.setAttribute("width", this.bounds.w);
    this.element.setAttribute("height", this.bounds.h);      
    this.zoom(this.viewing.sx, this.viewing.sy)
  },

  add: function(shape, parent) {
    if (parent != null)
      console.log("CanvasRenderer:add inside another shape (parent != null) not yet implemented")    
   if (shape.element)
    this.nodes.push(shape);
  },
  
  shapes: function() {
    return this.nodes;
  },

  updateAttributes:function(shape, attributes) {
    // Nothing to do, canvas shapes use shape's attributes
  },
  
  updateTransform:function(shape) {
    // Nothing to do, canvas shapes use shape's transform
  },
  
  createShape: function(shape){
    var canvasShape = null;
    switch(shape.nodeName) {
      case "rect":
        canvasShape = new CanvasRect(shape);
        break;
      case "ellipse":
        canvasShape = new CanvasEllipse(shape);
        break;
      case "circle":
        canvasShape = new CanvasCircle(shape);
        break;
      case "polygon":
        canvasShape = new CanvasPolygon(shape, true);
        break;      
      case "polyline":
        canvasShape = new CanvasPolygon(shape, false);
        break;      
      case "line":
        canvasShape = new CanvasLine(shape);
        break;      
      case "image":
        canvasShape = new CanvasImage(shape);
        break;      
      default: 
        console.log("shape " + shape.nodeName + " not yet implemented for canvas renderer");
        break;
    }
    return canvasShape;
  },
  
  draw: function() {
    var context = this.context; 
    context.clearRect(this.bounds.x, this.bounds.y, this.bounds.w, this.bounds.h);    
    context.save();
    context.translate(-this.viewing.tx, -this.viewing.ty);        
    context.translate(this.viewing.cx, this.viewing.cy);
    context.scale(this.viewing.sx, this.viewing.sy);
    context.translate(-this.viewing.cx, -this.viewing.cy);
    
    this.nodes.each(function(n) {if (n.element) n.element.draw(this)}.bind(this))
    context.restore();
  },
         
  pick: function(event) {
    var pt = this.viewingMatrix.multiplyPoint(Event.pointerX(event) - this.offset[0], Event.pointerY(event) - this.offset[1]);
    var element = null;
    for (var i = this.nodes.length - 1; i >= 0; i--) { 
      if (this.nodes[i].element.pick(pt.x, pt.y)) 
        break;
    }
    return (i < 0 ? null : this.nodes[i]);
  },
  
  moveToFront: function(shape) {
    var node = this.nodes.find(function(s){if (s == shape) return true});  
    this.nodes = this.nodes.without(node);  
    this.nodes.push(node);
  },
  
  _setViewing: function() {
    this.draw();
  },            
  
  // Specific canvas functions
  fill:function(attributes) { 
    if (attributes.fill && attributes.fill != "none") {
      this.context.fillStyle   = attributes.fill;
      this.context.globalAlpha = attributes["fill-opacity"];  
      this.context.fill();  
    }
  },

  stroke:function(attributes) {        
    this.context.strokeStyle = attributes.stroke;    
    this.context.lineWidth   = attributes["stroke-width"]
    this.context.globalAlpha = attributes["stroke-opacity"];
    this.context.stroke();
  },
  
  moveTo: function(matrix, x, y) {
    var p = matrix.multiplyPoint(x, y);
    this.context.moveTo(p.x, p.y);        
  },

  lineTo: function(matrix, x, y) {
    var p = matrix.multiplyPoint(x, y);
    this.context.lineTo(p.x, p.y);        
  },
  
  bezierCurveTo: function(matrix, cp1x, cp1y, cp2x, cp2y, x, y) {
    var cp1 = matrix.multiplyPoint(cp1x, cp1y);
    var cp2 = matrix.multiplyPoint(cp2x, cp2y);
    var p   = matrix.multiplyPoint(x, y);
    this.context.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, p.x, p.y);        
  }
  
});

CanvasRect = Class.create();
CanvasRect.prototype =  {
  initialize: function(shape) {
    this.shape = shape;
  },
    
  draw: function(renderer) { 
    var context = renderer.context;
    var matrix = this.shape.getMatrix();
    context.save();
    
    with (this.shape) {  
      
      context.beginPath();                 

      renderer.moveTo(matrix, attributes.x, attributes.y);
      renderer.lineTo(matrix, attributes.x + attributes.width, attributes.y);
      renderer.lineTo(matrix, attributes.x + attributes.width, attributes.y + attributes.height);
      renderer.lineTo(matrix, attributes.x, attributes.y + attributes.height);

      context.closePath();      
      
      renderer.fill(attributes);
      renderer.stroke(attributes);
    }
    context.restore();
  },
  
  pick: function(x, y) {     
    var pt = this.shape.getInverseMatrix().multiplyPoint(x, y);
    var a = this.shape.attributes;
    return a.x <= pt.x && pt.x <= a.x + a.width && a.y <= pt.y && pt.y <= a.y + a.height;
  }
}

CanvasEllipse = Class.create();
CanvasEllipse.prototype =  {
  initialize: function(shape) {
    this.shape = shape;
  },
    
  draw: function(renderer) { 
    var context = renderer.context;
    var matrix = this.shape.getMatrix();
    context.save();
    
    with (this.shape) {  
      var KAPPA = 4 * ((Math.sqrt(2) -1) / 3);

      var rx = attributes.rx;
      var ry = attributes.ry;

      var cx = attributes.cx;
      var cy = attributes.cy;

      context.beginPath();        
      renderer.moveTo(matrix, cx, cy - ry);
      renderer.bezierCurveTo(matrix, cx + (KAPPA * rx), cy - ry,  cx + rx, cy - (KAPPA * ry), cx + rx, cy);
      renderer.bezierCurveTo(matrix, cx + rx, cy + (KAPPA * ry), cx + (KAPPA * rx), cy + ry, cx, cy + ry);
      renderer.bezierCurveTo(matrix, cx - (KAPPA * rx), cy + ry, cx - rx, cy + (KAPPA * ry), cx - rx, cy);
      renderer.bezierCurveTo(matrix, cx - rx, cy - (KAPPA * ry), cx - (KAPPA * rx), cy - ry, cx, cy - ry);
      context.closePath();

      renderer.fill(attributes);
      renderer.stroke(attributes);
    }
    context.restore();
  },
  pick: function(x, y) {     
    return false;
  }
}

CanvasCircle = Class.create();
CanvasCircle.prototype =  {
  initialize: function(shape) {
    this.shape = shape;
  },
    
  draw: function(renderer) { 
    var context = renderer.context;
    var matrix = this.shape.getMatrix();
    context.save();
    
    with (this.shape) {  
      context.beginPath();
      var c = matrix.multiplyPoint(attributes.cx, attributes.cy);
      context.arc(c.x, c.y, attributes.r, 0, Math.PI*2, 1)

      context.closePath();
      
      renderer.fill(attributes);
      renderer.stroke(attributes);
    }
    context.restore();
  },
  
  pick: function(x, y) {     
    return false;
  } 
}

CanvasPolygon = Class.create();
CanvasPolygon.prototype =  {
  initialize: function(shape, closed) {
    this.shape = shape;
    this.closed = closed;
  },
    
  draw: function(renderer) {  
    if (this.shape.getPoints().length == 0)
      return;
    var context = renderer.context;
    var matrix = this.shape.getMatrix();
    context.save();
    
    with (this.shape) {  
      context.beginPath();                 
      var first = getPoints()[0];

      renderer.moveTo(matrix, first[0], first[1]);    
      
      getPoints().each(function(point) {
        renderer.lineTo(matrix, point[0], point[1]);
      });
      
      if (this.closed)
        context.closePath();
      
      renderer.fill(attributes);
      renderer.stroke(attributes);
    }
    context.restore();
  },
  
  pick: function(x, y) {     
    return false;
  } 
}

CanvasLine = Class.create();
CanvasLine.prototype =  {
  initialize: function(shape) {
    this.shape = shape;
  },
    
  draw: function(renderer) {  
    var context = renderer.context;
    var matrix = this.shape.getMatrix();
    context.save();
    
    with (this.shape) {  
      context.beginPath();                 
      
      renderer.moveTo(matrix, attributes.x1, attributes.y1);    
      renderer.lineTo(matrix, attributes.x2, attributes.y2);    

      renderer.stroke(attributes);
    }
    context.restore();
  },
  
  pick: function(x, y) {     
    return false;
  } 
}                    

CanvasImage = Class.create();
CanvasImage.prototype =  {
  initialize: function(shape) {
    this.shape = shape;  
    this.loaded = false;
  },
    
  draw: function(renderer) {  
    var context = renderer.context;
    var matrix = this.shape.getMatrix();
    context.save();
    
    with (this.shape) {                                                        
      if (image) {           
        var p = matrix.multiplyPoint(attributes.x, attributes.y);
        if (!this.loaded)                                                    
          Event.observe(image, "load",function() {               
            context.drawImage(image, p.x, p.y); 
            this.loaded = true;
          }.bind(this));
        else
        context.drawImage(image, p.x, p.y); 
      }
    }
    context.restore();
  },
  
  pick: function(x, y) {     
    return false;
  } 
}